import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, RotateCcw, Clock, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import type { ScriptData, ScriptSection, FlowchartNode } from "@/pages/ScriptStudio";

interface ScriptVersion {
  id: string;
  version: number;
  script_json: unknown;
  flowchart_json: unknown;
  created_at: string;
  change_summary: string | null;
}

interface ScriptVersionHistoryProps {
  scriptId: string | null;
  currentVersion: number;
  onRestore: (scriptData: Partial<ScriptData>, flowchartNodes: FlowchartNode[]) => void;
  asDropdownItem?: boolean;
}

export const ScriptVersionHistory = ({
  scriptId,
  currentVersion,
  onRestore,
  asDropdownItem = false,
}: ScriptVersionHistoryProps) => {
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<ScriptVersion | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<ScriptVersion | null>(null);

  useEffect(() => {
    if (isOpen && scriptId) {
      loadVersions();
    }
  }, [isOpen, scriptId]);

  const loadVersions = async () => {
    if (!scriptId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_script_versions")
        .select("*")
        .eq("script_id", scriptId)
        .order("version", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error("Failed to load versions:", error);
      toast.error("Failed to load version history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (version: ScriptVersion) => {
    const scriptJson = version.script_json as { sections?: ScriptSection[] };
    const flowchartJson = version.flowchart_json as { nodes?: FlowchartNode[] };
    const sections = scriptJson?.sections || [];
    const nodes = flowchartJson?.nodes || [];
    
    onRestore({ sections }, nodes);
    setConfirmRestore(null);
    setIsOpen(false);
    toast.success(`Restored to version ${version.version}`);
  };

  const getCompletedSections = (version: ScriptVersion): number => {
    const scriptJson = version.script_json as { sections?: ScriptSection[] };
    return scriptJson?.sections?.filter(s => s.isComplete).length || 0;
  };

  const getFlowchartNodeCount = (version: ScriptVersion): number => {
    const flowchartJson = version.flowchart_json as { nodes?: FlowchartNode[] };
    return flowchartJson?.nodes?.length || 0;
  };

  const getSections = (version: ScriptVersion): ScriptSection[] => {
    const scriptJson = version.script_json as { sections?: ScriptSection[] };
    return scriptJson?.sections || [];
  };

  if (!scriptId) {
    return asDropdownItem ? (
      <button
        disabled
        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none opacity-50 w-full"
      >
        <History className="mr-2 h-4 w-4" />
        Version History
      </button>
    ) : null;
  }

  const sheetContent = (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Version History
        </SheetTitle>
        <SheetDescription>
          View and restore previous versions of your script. Current version: v{currentVersion}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="mt-6 h-[calc(100vh-180px)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No version history yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Versions are saved automatically when you save your script
            </p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {versions.map((version, index) => (
              <Collapsible
                key={version.id}
                open={expandedVersion === version.id}
                onOpenChange={(open) => setExpandedVersion(open ? version.id : null)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border/50 bg-card/50"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          v{version.version}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">
                            {version.change_summary || `Version ${version.version}`}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Latest
                          </Badge>
                        )}
                        {expandedVersion === version.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border/50 p-4">
                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Sections Complete</p>
                          <p className="mt-1 font-medium">
                            {getCompletedSections(version)}/18
                          </p>
                        </div>
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Flowchart Nodes</p>
                          <p className="mt-1 font-medium">
                            {getFlowchartNodeCount(version)}
                          </p>
                        </div>
                      </div>
                      <p className="mb-4 text-xs text-muted-foreground">
                        Created: {format(new Date(version.created_at), "PPpp")}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewVersion(version);
                          }}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmRestore(version);
                          }}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </motion.div>
              </Collapsible>
            ))}
          </div>
        )}
      </ScrollArea>
    </>
  );

  const dialogs = (
    <>
      {/* Preview Dialog */}
      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Preview: Version {previewVersion?.version}
            </DialogTitle>
            <DialogDescription>
              {previewVersion?.change_summary || `Snapshot from ${previewVersion?.created_at ? format(new Date(previewVersion.created_at), "PPpp") : ""}`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <div className="space-y-3">
              {previewVersion && getSections(previewVersion).map((section) => (
                <div
                  key={section.id}
                  className={`rounded-lg border p-3 ${
                    section.isComplete
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{section.name}</span>
                    <Badge variant={section.isComplete ? "default" : "secondary"} className="text-xs">
                      {section.isComplete ? "Complete" : "Empty"}
                    </Badge>
                  </div>
                  {section.isComplete && Object.keys(section.content).length > 0 && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {JSON.stringify(section.content).slice(0, 150)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewVersion(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (previewVersion) {
                setPreviewVersion(null);
                setConfirmRestore(previewVersion);
              }
            }}>
              <RotateCcw className="mr-1 h-3 w-3" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Restore Dialog */}
      <Dialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version {confirmRestore?.version}?</DialogTitle>
            <DialogDescription>
              This will replace your current script with the content from version {confirmRestore?.version}. 
              Your current work will be saved as a new version before restoring.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRestore(null)}>
              Cancel
            </Button>
            <Button onClick={() => confirmRestore && handleRestore(confirmRestore)}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Restore Version {confirmRestore?.version}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  // Render as dropdown item
  if (asDropdownItem) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full"
        >
          <History className="mr-2 h-4 w-4" />
          Version History
        </button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            {sheetContent}
          </SheetContent>
        </Sheet>
        {dialogs}
      </>
    );
  }

  // Default render with trigger button
  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {sheetContent}
        </SheetContent>
      </Sheet>
      {dialogs}
    </>
  );
};