import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, CheckCircle2, AlertCircle, Minimize2, Maximize2, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'thinking';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'flow_generated' | 'clarification' | 'message';
    thinking_steps?: string[];
    options?: string[];
  };
}

interface AgentChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  thinkingSteps: string[];
  onSendMessage: (message: string) => void;
  onOptionSelect?: (option: string) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const AgentChatPanel: React.FC<AgentChatPanelProps> = ({
  messages,
  isLoading,
  thinkingSteps,
  onSendMessage,
  onOptionSelect,
  isMinimized = false,
  onToggleMinimize
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinkingSteps]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        onClick={onToggleMinimize}
        className="absolute bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center hover:scale-105 transition-transform group"
      >
        <Bot className="w-6 h-6 text-primary-foreground" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
        <span className="absolute left-full ml-3 px-2 py-1 rounded bg-popover text-popover-foreground text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          Open AI Chat (⌘J)
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ x: -350, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -350, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="flex flex-col h-full bg-card border-r w-[350px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Flow Builder Agent</h3>
            <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
          </div>
        </div>
        {onToggleMinimize && (
          <Button variant="ghost" size="icon" onClick={onToggleMinimize} className="h-8 w-8">
            <Minimize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/50 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground mb-3">
                    Hi! I'll instantly build automation flows for you. Just describe what you need and I'll create it on the canvas.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Quick starts:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Lead qualification with BANT",
                        "Appointment booking agent",
                        "Order tracking for e-commerce",
                        "Payment reminder calls"
                      ].map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => onSendMessage(suggestion)}
                          className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user' 
                    ? "bg-secondary" 
                    : message.role === 'thinking'
                    ? "bg-amber-500/10"
                    : "bg-primary/10"
                )}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-secondary-foreground" />
                  ) : message.role === 'thinking' ? (
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                <div className={cn(
                  "max-w-[80%] rounded-xl px-4 py-3",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : message.role === 'thinking'
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-muted"
                )}>
                  {message.role === 'thinking' && (
                    <p className="text-xs text-amber-600 font-medium mb-1">Planning...</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Thinking Steps */}
                  {message.metadata?.thinking_steps && (
                    <div className="mt-3 space-y-1">
                      {message.metadata.thinking_steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Option Buttons */}
                  {message.metadata?.options && message.metadata.options.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.metadata.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => onOptionSelect?.(option)}
                          className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Live Thinking Steps */}
          {isLoading && thinkingSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-600 font-medium mb-2">Planning next moves...</p>
                <div className="space-y-1">
                  {thinkingSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500" />
                      <span>{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {isLoading && thinkingSteps.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Designing your flow</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your automation flow..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
