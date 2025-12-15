import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, Save, Upload, Loader2, ArrowLeft, GitBranch, Sparkles } from "lucide-react";
import { ScriptChatInterface } from "@/components/script-studio/ScriptChatInterface";
import { DynamicFlowchartRenderer } from "@/components/script-studio/DynamicFlowchartRenderer";
import { ScriptSectionEditor } from "@/components/script-studio/ScriptSectionEditor";
import { ScriptExportModal } from "@/components/script-studio/ScriptExportModal";
import { ScriptSelector } from "@/components/script-studio/ScriptSelector";
import { ScriptImportModal } from "@/components/script-studio/ScriptImportModal";
import { ScriptPreview } from "@/components/script-studio/ScriptPreview";
import { ScriptVersionHistory } from "@/components/script-studio/ScriptVersionHistory";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

type WorkflowPhase = "script" | "flowchart";

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
  const { user } = useAuth();
  const [scriptData, setScriptData] = useState<ScriptData>(initialScriptData);
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(scriptId || null);
  const [scriptStatus, setScriptStatus] = useState<string>("draft");
  const [scriptVersion, setScriptVersion] = useState<number>(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Two-phase workflow state
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>("script");
  const [animatingSection, setAnimatingSection] = useState<string | null>(null);
  const [isGeneratingFlowchart, setIsGeneratingFlowchart] = useState(false);
  const [hasAutoSaved, setHasAutoSaved] = useState(false);
  const [isCreatingScript, setIsCreatingScript] = useState(false);

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
            nodes: Array.isArray(flowchartJson.nodes) ? flowchartJson.nodes : [],
          },
        });
        setCurrentScriptId(id);
        setScriptStatus(data.status || "draft");
        setScriptVersion(data.version || 1);
        setHasUnsavedChanges(false);
        
        // If script has flowchart, go to flowchart phase
        if (flowchartJson.nodes && flowchartJson.nodes.length > 0) {
          setCurrentPhase("flowchart");
        }
      }
    } catch (error) {
      console.error("Failed to load script:", error);
      toast.error("Failed to load script");
    } finally {
      setIsLoading(false);
    }
  };

  const saveVersionHistory = async (scriptId: string, currentVersion: number) => {
    try {
      await supabase.from("agent_script_versions").insert({
        script_id: scriptId,
        version: currentVersion,
        script_json: JSON.parse(JSON.stringify({ sections: scriptData.sections })),
        flowchart_json: JSON.parse(JSON.stringify(scriptData.flowchart)),
        created_by: user?.id,
        change_summary: `Version ${currentVersion} snapshot`,
      });
    } catch (error) {
      console.error("Failed to save version history:", error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setScriptStatus(newStatus);
    setHasUnsavedChanges(true);
    
    if (currentScriptId) {
      try {
        await supabase
          .from("agent_scripts")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", currentScriptId);
        toast.success(`Status changed to ${newStatus}`);
      } catch (error) {
        console.error("Failed to update status:", error);
        toast.error("Failed to update status");
      }
    }
  };

  const handleScriptUpdate = useCallback((updates: Partial<ScriptData>) => {
    setScriptData((prev) => {
      const newData = { ...prev, ...updates };
      
      // If sections are being updated, merge them properly and trigger animation
      if (updates.sections) {
        const updatedSectionIds: string[] = [];
        
        newData.sections = prev.sections.map((existingSection) => {
          const updatedSection = updates.sections?.find((s) => s.id === existingSection.id);
          if (updatedSection && Object.keys(updatedSection.content || {}).length > 0) {
            // Track which section was updated for animation
            if (!existingSection.isComplete && updatedSection.isComplete) {
              updatedSectionIds.push(existingSection.id);
            }
            return {
              ...existingSection,
              content: { ...existingSection.content, ...updatedSection.content },
              isComplete: updatedSection.isComplete ?? Object.keys(updatedSection.content || {}).length > 0,
            };
          }
          return existingSection;
        });
        
        // Animate the first newly completed section
        if (updatedSectionIds.length > 0) {
          setAnimatingSection(updatedSectionIds[0]);
          setTimeout(() => setAnimatingSection(null), 3000);
        }
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

  const generateFlowchartFromAI = async () => {
    setIsGeneratingFlowchart(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("script-studio-chat", {
        body: {
          message: "Based on the current script sections, generate a detailed conversation flowchart. Include all decision points, guardrails, tool calls, and conversation paths from the script. Make it comprehensive and match the actual script content.",
          sessionId: `script-${currentScriptId || 'new'}-flowchart`,
          currentScript: scriptData,
          messageHistory: [],
          action: "generate_flowchart"
        }
      });

      if (error) throw error;

      if (data.flowchartNodes && data.flowchartNodes.length > 0) {
        handleFlowchartUpdate(data.flowchartNodes);
        toast.success(`Generated flowchart with ${data.flowchartNodes.length} nodes`);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Failed to generate flowchart:", error);
      toast.error("Failed to generate flowchart. Using default structure.");
    } finally {
      setIsGeneratingFlowchart(false);
    }
  };

  const handleProceedToFlowchart = async () => {
    setCurrentPhase("flowchart");
    
    // If no flowchart exists, auto-generate one from AI
    if (scriptData.flowchart.nodes.length === 0) {
      await generateFlowchartFromAI();
    }
  };

  const handleBackToScript = () => {
    setCurrentPhase("script");
  };

  const handleSaveScript = async () => {
    setIsSaving(true);
    try {
      if (currentScriptId) {
        await saveVersionHistory(currentScriptId, scriptVersion);
        
        const newVersion = scriptVersion + 1;
        
        const { error } = await supabase
          .from("agent_scripts")
          .update({
            name: scriptData.name,
            description: scriptData.description,
            use_case: scriptData.useCase,
            industry: scriptData.industry,
            script_json: JSON.parse(JSON.stringify({ sections: scriptData.sections })),
            flowchart_json: JSON.parse(JSON.stringify(scriptData.flowchart)),
            status: scriptStatus,
            version: newVersion,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentScriptId);

        if (error) throw error;
        setScriptVersion(newVersion);
        toast.success(`Script saved (v${newVersion})`);
      } else {
        const { data, error } = await supabase
          .from("agent_scripts")
          .insert([{
            name: scriptData.name,
            description: scriptData.description,
            use_case: scriptData.useCase,
            industry: scriptData.industry,
            script_json: JSON.parse(JSON.stringify({ sections: scriptData.sections })),
            flowchart_json: JSON.parse(JSON.stringify(scriptData.flowchart)),
            status: scriptStatus,
            version: 1,
            created_by: user?.id,
          }])
          .select("id, version")
          .single();

        if (error) throw error;
        
        setCurrentScriptId(data.id);
        setScriptVersion(data.version || 1);
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
    setScriptStatus("draft");
    setScriptVersion(1);
    setHasUnsavedChanges(false);
    setCurrentPhase("script");
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

  // Ensure script is saved before chat starts - called from chat interface
  const ensureScriptSaved = useCallback(async (): Promise<string | null> => {
    // Already have a script ID
    if (currentScriptId) return currentScriptId;
    
    // Already creating
    if (isCreatingScript) return null;
    
    if (!user?.id) {
      toast.error("Please sign in to save scripts");
      return null;
    }

    setIsCreatingScript(true);
    try {
      const { data, error } = await supabase
        .from("agent_scripts")
        .insert([{
          name: scriptData.name || "Untitled Script",
          description: scriptData.description,
          use_case: scriptData.useCase,
          industry: scriptData.industry,
          script_json: JSON.parse(JSON.stringify({ sections: scriptData.sections })),
          flowchart_json: JSON.parse(JSON.stringify(scriptData.flowchart)),
          status: "draft",
          version: 1,
          created_by: user.id,
        }])
        .select("id, version")
        .single();

      if (error) throw error;
      
      setCurrentScriptId(data.id);
      setScriptVersion(data.version || 1);
      setHasAutoSaved(true);
      navigate(`/scripttoflowchart/${data.id}`, { replace: true });
      toast.success("Script created");
      return data.id;
    } catch (error) {
      console.error("Failed to create script:", error);
      toast.error("Failed to create script");
      return null;
    } finally {
      setIsCreatingScript(false);
    }
  }, [currentScriptId, isCreatingScript, user, scriptData, navigate]);

  useEffect(() => {
    document.title = "Script Studio - Build Voice Agent Scripts with AI | Vriksha";
  }, []);

  // Auto-save new script as draft when first content is added
  useEffect(() => {
    const hasContent = scriptData.sections.some(s => s.isComplete);
    if (!currentScriptId && hasContent && user?.id && !hasAutoSaved) {
      const autoSaveNewScript = async () => {
        try {
          const { data, error } = await supabase
            .from("agent_scripts")
            .insert([{
              name: scriptData.name || "Untitled Script",
              description: scriptData.description,
              use_case: scriptData.useCase,
              industry: scriptData.industry,
              script_json: JSON.parse(JSON.stringify({ sections: scriptData.sections })),
              flowchart_json: JSON.parse(JSON.stringify(scriptData.flowchart)),
              status: "draft",
              version: 1,
              created_by: user?.id,
            }])
            .select("id, version")
            .single();

          if (error) throw error;
          
          setCurrentScriptId(data.id);
          setScriptVersion(data.version || 1);
          setHasAutoSaved(true);
          setHasUnsavedChanges(false);
          navigate(`/scripttoflowchart/${data.id}`, { replace: true });
          toast.success("Script auto-saved as draft");
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      };
      autoSaveNewScript();
    }
  }, [scriptData.sections, currentScriptId, user, hasAutoSaved, navigate, scriptData]);

  // Debounced auto-save for existing scripts
  useEffect(() => {
    if (currentScriptId && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        handleSaveScript();
      }, 10000); // Auto-save after 10 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [currentScriptId, hasUnsavedChanges, scriptData]);

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
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Build Voice Agent Scripts with AI
                  </p>
                  <Badge variant={currentPhase === "script" ? "default" : "secondary"} className="text-xs">
                    {currentPhase === "script" ? "Script Phase" : "Flowchart Phase"}
                  </Badge>
                  {hasUnsavedChanges && <span className="text-xs text-yellow-500">• Unsaved</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ScriptSelector
                currentScriptId={currentScriptId}
                onSelectScript={handleSelectScript}
                onNewScript={handleNewScript}
              />
              
              <Select value={scriptStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <span className="text-xs text-muted-foreground">v{scriptVersion}</span>
              
              <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <ScriptVersionHistory
                scriptId={currentScriptId}
                currentVersion={scriptVersion}
                onRestore={(data, nodes) => {
                  handleScriptUpdate(data);
                  handleFlowchartUpdate(nodes);
                }}
              />
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
        <main className="container py-6 space-y-6">
          {/* Phase Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentPhase === "flowchart" && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleBackToScript}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Script
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={generateFlowchartFromAI}
                    disabled={isGeneratingFlowchart}
                  >
                    {isGeneratingFlowchart ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {isGeneratingFlowchart ? "Generating..." : "Regenerate Flowchart"}
                  </Button>
                </>
              )}
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <button
                  onClick={() => setCurrentPhase("script")}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gap-2 ${
                    currentPhase === "script" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "hover:bg-background/50"
                  }`}
                >
                  <FileCode2 className="h-4 w-4" />
                  Script Builder
                </button>
                <button
                  onClick={() => {
                    if (scriptData.sections.filter(s => s.isComplete).length >= 3) {
                      handleProceedToFlowchart();
                    }
                  }}
                  disabled={scriptData.sections.filter(s => s.isComplete).length < 3}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gap-2 disabled:pointer-events-none disabled:opacity-50 ${
                    currentPhase === "flowchart" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "hover:bg-background/50"
                  }`}
                >
                  <GitBranch className="h-4 w-4" />
                  Flowchart
                </button>
              </div>
            </div>
            
            <Badge variant="outline">
              {scriptData.sections.filter(s => s.isComplete).length}/{scriptData.sections.length} sections complete
            </Badge>
          </div>

          {/* Phase Content */}
          <AnimatePresence mode="wait">
            {currentPhase === "script" ? (
              <motion.div
                key="script-phase"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                {/* Chat Interface */}
                <div className="h-[calc(100vh-220px)] min-h-[500px]">
                  <ScriptChatInterface
                    scriptData={scriptData}
                    onScriptUpdate={handleScriptUpdate}
                    onFlowchartUpdate={handleFlowchartUpdate}
                    scriptId={currentScriptId}
                    phase={currentPhase}
                    onEnsureScriptSaved={ensureScriptSaved}
                  />
                </div>

                {/* Script Preview (Google Docs style) */}
                <div className="h-[calc(100vh-220px)] min-h-[500px]">
                  <ScriptPreview
                    sections={scriptData.sections}
                    scriptName={scriptData.name}
                    onProceedToFlowchart={handleProceedToFlowchart}
                    animatingSection={animatingSection}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="flowchart-phase"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                {/* Chat Interface */}
                <div className="h-[calc(100vh-220px)] min-h-[500px]">
                  <ScriptChatInterface
                    scriptData={scriptData}
                    onScriptUpdate={handleScriptUpdate}
                    onFlowchartUpdate={handleFlowchartUpdate}
                    scriptId={currentScriptId}
                    phase={currentPhase}
                    onEnsureScriptSaved={ensureScriptSaved}
                  />
                </div>

                {/* Flowchart Preview */}
                <div className="h-[calc(100vh-220px)] min-h-[500px]">
                  <DynamicFlowchartRenderer
                    nodes={scriptData.flowchart.nodes}
                    onNodesChange={handleFlowchartUpdate}
                    scriptData={scriptData}
                    isAnimating={currentPhase === "flowchart"}
                    isGenerating={isGeneratingFlowchart}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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