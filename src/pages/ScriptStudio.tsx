import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCode2, Sparkles, Save, Upload, Loader2 } from "lucide-react";
import { ScriptChatInterface } from "@/components/script-studio/ScriptChatInterface";
import { DynamicFlowchartRenderer } from "@/components/script-studio/DynamicFlowchartRenderer";
import { ScriptSectionEditor } from "@/components/script-studio/ScriptSectionEditor";
import { ScriptExportModal } from "@/components/script-studio/ScriptExportModal";
import { ScriptSelector } from "@/components/script-studio/ScriptSelector";
import { ScriptImportModal } from "@/components/script-studio/ScriptImportModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { scriptId } = useParams();
  const navigate = useNavigate();
  const [scriptData, setScriptData] = useState<ScriptData>(initialScriptData);
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(scriptId || null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load script from URL param or selection
  useEffect(() => {
    if (scriptId) {
      loadScript(scriptId);
    }
  }, [scriptId]);

  const loadScript = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_scripts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const scriptJson = data.script_json as Record<string, any> || {};
        const flowchartJson = data.flowchart_json as Record<string, any> || {};
        
        setScriptData({
          name: data.name || "Untitled Script",
          description: data.description || "",
          useCase: data.use_case || "",
          industry: data.industry || "",
          sections: scriptJson.sections || initialScriptData.sections,
          flowchart: {
            nodes: flowchartJson.nodes || [],
          },
        });
        setCurrentScriptId(id);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Failed to load script:", error);
      toast.error("Failed to load script");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScriptUpdate = useCallback((updates: Partial<ScriptData>) => {
    setScriptData((prev) => {
      const newData = { ...prev, ...updates };
      
      // If sections are being updated, merge them properly
      if (updates.sections) {
        newData.sections = prev.sections.map((existingSection) => {
          const updatedSection = updates.sections?.find((s) => s.id === existingSection.id);
          if (updatedSection) {
            return {
              ...existingSection,
              content: { ...existingSection.content, ...updatedSection.content },
              isComplete: updatedSection.isComplete ?? Object.keys(updatedSection.content || {}).length > 0,
            };
          }
          return existingSection;
        });
      }
      
      return newData;
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleFlowchartUpdate = useCallback((nodes: FlowchartNode[]) => {
    setScriptData((prev) => ({
      ...prev,
      flowchart: { nodes },
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSectionUpdate = useCallback((sectionId: string, content: Record<string, any>) => {
    setScriptData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, content, isComplete: Object.keys(content).length > 0 } : s
      ),
    }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveScript = async () => {
    setIsSaving(true);
    try {
      const scriptPayload = {
        name: scriptData.name,
        description: scriptData.description,
        use_case: scriptData.useCase,
        industry: scriptData.industry,
        script_json: JSON.parse(JSON.stringify({ sections: scriptData.sections })),
        flowchart_json: JSON.parse(JSON.stringify(scriptData.flowchart)),
        status: "draft",
        updated_at: new Date().toISOString(),
      };

      if (currentScriptId) {
        // Update existing script
        const { error } = await supabase
          .from("agent_scripts")
          .update(scriptPayload)
          .eq("id", currentScriptId);

        if (error) throw error;
        toast.success("Script saved successfully");
      } else {
        // Create new script
        const { data, error } = await supabase
          .from("agent_scripts")
          .insert([scriptPayload])
          .select("id")
          .single();

        if (error) throw error;
        
        setCurrentScriptId(data.id);
        navigate(`/scripttoflowchart/${data.id}`, { replace: true });
        toast.success("Script created successfully");
      }
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save script:", error);
      toast.error("Failed to save script");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectScript = (id: string | null) => {
    if (id) {
      navigate(`/scripttoflowchart/${id}`);
    }
  };

  const handleNewScript = () => {
    setScriptData(initialScriptData);
    setCurrentScriptId(null);
    setHasUnsavedChanges(false);
    navigate("/scripttoflowchart");
  };

  const handleImport = (importedData: Partial<ScriptData>, flowchartNodes?: FlowchartNode[]) => {
    setScriptData((prev) => ({
      ...prev,
      ...importedData,
      flowchart: flowchartNodes ? { nodes: flowchartNodes } : prev.flowchart,
    }));
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    document.title = "Script Studio - Build Voice Agent Scripts with AI | Vriksha";
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading script...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
                <p className="text-xs text-muted-foreground">
                  Build Voice Agent Scripts with AI
                  {hasUnsavedChanges && <span className="ml-2 text-yellow-500">• Unsaved changes</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ScriptSelector
                currentScriptId={currentScriptId}
                onSelectScript={handleSelectScript}
                onNewScript={handleNewScript}
              />
              <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
                Export JSON
              </Button>
              <Button size="sm" onClick={handleSaveScript} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
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
                    scriptId={currentScriptId}
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

      <ScriptImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </>
  );
};

export default ScriptStudio;
