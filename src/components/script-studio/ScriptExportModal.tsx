import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Copy, Check, FileJson, FileCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { ScriptData } from "@/pages/ScriptStudio";

interface ScriptExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptData: ScriptData;
}

export const ScriptExportModal = ({ isOpen, onClose, scriptData }: ScriptExportModalProps) => {
  const [copied, setCopied] = useState(false);

  // Build the export JSON
  const buildExportJson = () => {
    const exportData = {
      name: scriptData.name,
      description: scriptData.description,
      use_case: scriptData.useCase,
      industry: scriptData.industry,
      version: 1,
      created_at: new Date().toISOString(),
      sections: scriptData.sections.reduce((acc, section) => {
        acc[section.id] = {
          name: section.name,
          content: section.content,
          is_complete: section.isComplete,
        };
        return acc;
      }, {} as Record<string, any>),
      flowchart: scriptData.flowchart,
    };
    return JSON.stringify(exportData, null, 2);
  };

  // Build a minimal JSON for Ringg/other platforms
  const buildMinimalJson = () => {
    const sections = scriptData.sections.reduce((acc, section) => {
      if (Object.keys(section.content).length > 0) {
        acc[section.id] = section.content;
      }
      return acc;
    }, {} as Record<string, any>);

    return JSON.stringify(
      {
        agent_name: sections.identity_framing?.agent_name || scriptData.name,
        agent_role: sections.identity_framing?.agent_role || "",
        primary_objective: sections.objectives?.primary_objective || "",
        guardrails: sections.guardrails || {},
        flows: sections.core_flows || {},
      },
      null,
      2
    );
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const fullJson = buildExportJson();
  const minimalJson = buildMinimalJson();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Export Script
          </DialogTitle>
          <DialogDescription>
            Export your voice agent script as JSON for use with Ringg or other platforms.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="full" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full">
              <FileJson className="mr-2 h-4 w-4" />
              Full Export
            </TabsTrigger>
            <TabsTrigger value="minimal">
              <FileCode className="mr-2 h-4 w-4" />
              Minimal (Ringg)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="full" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete export with all 18 sections, flowchart, and metadata.
            </p>
            <ScrollArea className="h-[300px] rounded-lg border border-border bg-muted/30 p-4">
              <pre className="text-xs">{fullJson}</pre>
            </ScrollArea>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleCopy(fullJson)}
                className="flex-1"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copy JSON
              </Button>
              <Button
                onClick={() =>
                  handleDownload(fullJson, `${scriptData.name.replace(/\s+/g, "-").toLowerCase()}-script.json`)
                }
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="minimal" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Minimal export with core fields for Ringg integration.
            </p>
            <ScrollArea className="h-[300px] rounded-lg border border-border bg-muted/30 p-4">
              <pre className="text-xs">{minimalJson}</pre>
            </ScrollArea>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleCopy(minimalJson)}
                className="flex-1"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copy JSON
              </Button>
              <Button
                onClick={() =>
                  handleDownload(
                    minimalJson,
                    `${scriptData.name.replace(/\s+/g, "-").toLowerCase()}-ringg.json`
                  )
                }
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
