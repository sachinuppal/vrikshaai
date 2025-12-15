import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { FileCode2, Sparkles } from "lucide-react";
import { ScriptChatInterface } from "@/components/script-studio/ScriptChatInterface";
import { DynamicFlowchartRenderer } from "@/components/script-studio/DynamicFlowchartRenderer";
import { ScriptSectionEditor } from "@/components/script-studio/ScriptSectionEditor";
import { ScriptExportModal } from "@/components/script-studio/ScriptExportModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ScriptSection {
  id: string;
  name: string;
  content: Record<string, any>;
  isComplete: boolean;
}

export interface FlowchartNode {
  id: string;
  type: "start" | "end" | "step" | "decision" | "action" | "tool" | "guardrail";
  label: string;
  description?: string;
  position: { x: number; y: number };
  connections: string[];
  metadata?: Record<string, any>;
}

export interface ScriptData {
  name: string;
  description: string;
  useCase: string;
  industry: string;
  sections: ScriptSection[];
  flowchart: {
    nodes: FlowchartNode[];
  };
}

const initialScriptData: ScriptData = {
  name: "New Voice Agent Script",
  description: "",
  useCase: "",
  industry: "",
  sections: [
    { id: "identity_framing", name: "Identity & Framing", content: {}, isComplete: false },
    { id: "objectives", name: "Objectives & Success Criteria", content: {}, isComplete: false },
    { id: "conversation_contract", name: "Conversation Contract", content: {}, isComplete: false },
    { id: "operating_context", name: "Operating Context", content: {}, isComplete: false },
    { id: "stt_instructions", name: "STT Instructions", content: {}, isComplete: false },
    { id: "tts_instructions", name: "TTS Instructions", content: {}, isComplete: false },
    { id: "turn_taking", name: "Turn-Taking & Dialogue", content: {}, isComplete: false },
    { id: "task_logic", name: "Task Logic", content: {}, isComplete: false },
    { id: "core_flows", name: "Core Call Flows", content: {}, isComplete: false },
    { id: "guardrails", name: "Guardrails & Safety", content: {}, isComplete: false },
    { id: "knowledge_grounding", name: "Knowledge & Grounding", content: {}, isComplete: false },
    { id: "faq_pack", name: "FAQ Pack", content: {}, isComplete: false },
    { id: "compliance_policy", name: "Compliance & Policy", content: {}, isComplete: false },
    { id: "ux_guidelines", name: "UX Guidelines", content: {}, isComplete: false },
    { id: "output_formats", name: "Output Formats", content: {}, isComplete: false },
    { id: "testing_config", name: "Testing & Evaluation", content: {}, isComplete: false },
    { id: "deployment_config", name: "Deployment Config", content: {}, isComplete: false },
    { id: "usage_guidelines", name: "Usage Guidelines", content: {}, isComplete: false },
  ],
  flowchart: { nodes: [] },
};

const ScriptStudio = () => {
  const [scriptData, setScriptData] = useState<ScriptData>(initialScriptData);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const handleScriptUpdate = useCallback((updates: Partial<ScriptData>) => {
    setScriptData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleFlowchartUpdate = useCallback((nodes: FlowchartNode[]) => {
    setScriptData((prev) => ({
      ...prev,
      flowchart: { nodes },
    }));
  }, []);

  const handleSectionUpdate = useCallback((sectionId: string, content: Record<string, any>) => {
    setScriptData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, content, isComplete: Object.keys(content).length > 0 } : s
      ),
    }));
  }, []);

  useEffect(() => {
    document.title = "Script Studio - Build Voice Agent Scripts with AI | Vriksha";
  }, []);

  return (
    <>
        <meta
          name="description"
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileCode2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{scriptData.name || "Script Studio"}</h1>
                <p className="text-xs text-muted-foreground">Build Voice Agent Scripts with AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
                Export JSON
              </Button>
              <Button size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Save Script
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="chat">Chat Builder</TabsTrigger>
              <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
              <TabsTrigger value="sections">18 Sections</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-0">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Chat Interface */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-[calc(100vh-220px)] min-h-[500px]"
                >
                  <ScriptChatInterface
                    scriptData={scriptData}
                    onScriptUpdate={handleScriptUpdate}
                    onFlowchartUpdate={handleFlowchartUpdate}
                  />
                </motion.div>

                {/* Live Flowchart Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-[calc(100vh-220px)] min-h-[500px]"
                >
                  <DynamicFlowchartRenderer
                    nodes={scriptData.flowchart.nodes}
                    onNodesChange={handleFlowchartUpdate}
                    scriptData={scriptData}
                  />
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="flowchart">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[calc(100vh-220px)] min-h-[600px]"
              >
                <DynamicFlowchartRenderer
                  nodes={scriptData.flowchart.nodes}
                  onNodesChange={handleFlowchartUpdate}
                  scriptData={scriptData}
                  fullscreen
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="sections">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ScriptSectionEditor
                  sections={scriptData.sections}
                  onSectionUpdate={handleSectionUpdate}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <ScriptExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scriptData={scriptData}
      />
    </>
  );
};

export default ScriptStudio;
