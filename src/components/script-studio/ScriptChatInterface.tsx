import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, Lightbulb, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScriptData, FlowchartNode } from "@/pages/ScriptStudio";

// Helper to try parsing script JSON from message content
const tryParseScriptFromMessage = (content: string): { scriptUpdates?: Partial<ScriptData>; flowchartNodes?: FlowchartNode[] } | null => {
  try {
    // Try to parse the entire content as JSON
    const parsed = JSON.parse(content);
    if (parsed.scriptUpdates || parsed.flowchartNodes) {
      return { scriptUpdates: parsed.scriptUpdates, flowchartNodes: parsed.flowchartNodes };
    }
    return null;
  } catch {
    // Try to find JSON within the content
    const jsonMatch = content.match(/\{[\s\S]*"scriptUpdates"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return { scriptUpdates: parsed.scriptUpdates, flowchartNodes: parsed.flowchartNodes };
      } catch {
        return null;
      }
    }
    return null;
  }
};

// Clean up message display - show friendly text instead of raw JSON
const getDisplayMessage = (content: string): string => {
  if (content.startsWith('{') && (content.includes('"scriptUpdates"') || content.includes('"flowchartNodes"'))) {
    return "I've generated the script content for you. You can apply it using the button below, or check the preview on the right!";
  }
  return content;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    type?: "script_update" | "flowchart_update" | "recommendation" | "flaw_detected";
    data?: any;
  };
}

interface ScriptChatInterfaceProps {
  scriptData: ScriptData;
  onScriptUpdate: (updates: Partial<ScriptData>) => void;
  onFlowchartUpdate: (nodes: FlowchartNode[]) => void;
  scriptId?: string | null;
  phase?: "script" | "flowchart";
}

const STARTER_PROMPTS = [
  "Build me a store locator script for a retail chain",
  "Create an appointment booking agent for a dental clinic",
  "Design a debt collection script with compliance safeguards",
  "Help me build a customer support agent for an e-commerce platform",
];

export const ScriptChatInterface = ({
  scriptData,
  onScriptUpdate,
  onFlowchartUpdate,
  scriptId,
  phase = "script",
}: ScriptChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to Script Studio! 🎙️

I'll help you build a comprehensive voice agent script. You can:

• **Describe your use case** and I'll generate sections with animated preview
• **Paste an existing script** and I'll parse it into our format
• **Modify specific sections** like guardrails or call flows

Once your script is ready, we'll proceed to generate the flowchart.

What kind of voice agent would you like to build?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history when scriptId changes
  useEffect(() => {
    if (scriptId && !chatHistoryLoaded) {
      loadChatHistory(scriptId);
    }
  }, [scriptId, chatHistoryLoaded]);

  const loadChatHistory = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("script_chat_messages")
        .select("*")
        .eq("script_id", id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()),
          metadata: msg.metadata as Message["metadata"],
        }));
        setMessages(loadedMessages);
      }
      setChatHistoryLoaded(true);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const saveMessage = useCallback(async (message: Message, currentScriptId: string | null) => {
    if (!currentScriptId) return;

    try {
      await supabase.from("script_chat_messages").insert({
        script_id: currentScriptId,
        session_id: sessionId,
        role: message.role,
        content: message.content,
        metadata: message.metadata || {},
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to database
    if (scriptId) {
      saveMessage(userMessage, scriptId);
    }

    try {
      // Call the edge function for script building
      const response = await supabase.functions.invoke("script-studio-chat", {
        body: {
          message: userMessage.content,
          sessionId,
          currentScript: scriptData,
          messageHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get response");
      }

      let scriptUpdates = response.data.scriptUpdates;
      let flowchartNodes = response.data.flowchartNodes;
      let displayMessage = response.data.message;

      // If no scriptUpdates but message looks like JSON, try to extract
      if (!scriptUpdates && displayMessage && typeof displayMessage === 'string') {
        const extracted = tryParseScriptFromMessage(displayMessage);
        if (extracted) {
          scriptUpdates = extracted.scriptUpdates;
          flowchartNodes = extracted.flowchartNodes || flowchartNodes;
          displayMessage = "I've generated and populated the script sections for you. Check the preview on the right!";
        }
      }

      // Handle script updates from AI - auto-fill sections
      if (scriptUpdates) {
        onScriptUpdate(scriptUpdates);
        
        // Show toast for section updates
        if (scriptUpdates.sections && scriptUpdates.sections.length > 0) {
          const sectionNames = scriptUpdates.sections
            .filter((s: any) => s.isComplete)
            .map((s: any) => s.name || s.id)
            .slice(0, 3);
          if (sectionNames.length > 0) {
            toast.success(`Auto-filled: ${sectionNames.join(", ")}${scriptUpdates.sections.length > 3 ? "..." : ""}`);
          }
        }
      }

      // Handle flowchart updates
      if (flowchartNodes) {
        onFlowchartUpdate(flowchartNodes);
      }

      // Use cleaned display message
      const data = { ...response.data, message: displayMessage };

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      if (scriptId) {
        saveMessage(assistantMessage, scriptId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to process your request. Please try again.");

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            Script Builder AI
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {scriptData.sections.filter((s) => s.isComplete).length}/18 sections
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`flex max-w-[85%] flex-col gap-1 rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{getDisplayMessage(message.content)}</div>
                    
                    {/* Apply to Script Preview button for raw JSON messages */}
                    {message.role === "assistant" && tryParseScriptFromMessage(message.content) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 w-fit"
                        onClick={() => {
                          const extracted = tryParseScriptFromMessage(message.content);
                          if (extracted) {
                            if (extracted.scriptUpdates) {
                              onScriptUpdate(extracted.scriptUpdates);
                              toast.success("Script applied to preview!");
                            }
                            if (extracted.flowchartNodes) {
                              onFlowchartUpdate(extracted.flowchartNodes);
                              toast.success("Flowchart nodes applied!");
                            }
                          }
                        }}
                      >
                        <Wand2 className="mr-1 h-3 w-3" />
                        Apply to Script Preview
                      </Button>
                    )}
                    
                    {message.metadata?.type && (
                      <div className="mt-2 flex items-center gap-2">
                        {message.metadata.type === "flaw_detected" && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Issue Detected
                          </Badge>
                        )}
                        {message.metadata.type === "recommendation" && (
                          <Badge variant="secondary" className="text-xs">
                            <Lightbulb className="mr-1 h-3 w-3" />
                            Recommendation
                          </Badge>
                        )}
                        {message.metadata.type === "script_update" && (
                          <Badge className="text-xs">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Script Updated
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Starter Prompts (show when few messages) */}
        {messages.length < 3 && !isLoading && (
          <div className="border-t border-border/50 px-4 pb-2 pt-3">
            <p className="mb-2 text-xs text-muted-foreground">Quick start:</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="h-auto whitespace-normal py-1.5 text-left text-xs"
                  onClick={() => handleStarterPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border/50 p-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your voice agent or ask me to modify the script..."
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-auto self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
