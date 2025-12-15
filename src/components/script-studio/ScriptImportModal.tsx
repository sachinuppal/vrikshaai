import { useState } from "react";
import { FileUp, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ScriptData, FlowchartNode } from "@/pages/ScriptStudio";

interface ScriptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (scriptData: Partial<ScriptData>, flowchartNodes?: FlowchartNode[]) => void;
}

export const ScriptImportModal = ({
  isOpen,
  onClose,
  onImport,
}: ScriptImportModalProps) => {
  const [rawScript, setRawScript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = async () => {
    if (!rawScript.trim()) {
      toast.error("Please paste your script content");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await supabase.functions.invoke("script-studio-chat", {
        body: {
          message: `I have an existing voice agent script that I want to convert to the 18-section format. Please analyze this script and extract/organize it into all 18 sections. Fill in as much as you can infer, and mark sections that need more information.

Here's my existing script:

${rawScript}

Please convert this to the structured 18-section format and generate an appropriate flowchart.`,
          sessionId: crypto.randomUUID(),
          currentScript: {
            name: "Imported Script",
            description: "",
            useCase: "",
            industry: "",
            sections: [],
            flowchart: { nodes: [] },
          },
          messageHistory: [],
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.scriptUpdates) {
        onImport(data.scriptUpdates, data.flowchartNodes);
        toast.success("Script imported and converted successfully!");
        onClose();
        setRawScript("");
      } else {
        toast.error("Could not parse the script. Please try again.");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import script. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Import Existing Script
          </DialogTitle>
          <DialogDescription>
            Paste your existing voice agent script below. Our AI will analyze it and
            convert it into the structured 18-section format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="raw-script">Your Existing Script</Label>
            <Textarea
              id="raw-script"
              value={rawScript}
              onChange={(e) => setRawScript(e.target.value)}
              placeholder={`Paste your script here...

Example:
"Hi, this is Sarah from Acme Dental. I'm calling to confirm your appointment tomorrow at 2pm with Dr. Smith. Can you confirm you'll be there?

If they say yes: Great! We'll see you then. Remember to bring your insurance card.
If they say no: I understand. Would you like to reschedule? I have openings on...
If they want to cancel: I'm sorry to hear that. May I ask the reason?"

The AI will parse this and organize it into the 18-section structure.`}
              className="min-h-[300px] font-mono text-sm"
              disabled={isProcessing}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p className="font-medium">What gets extracted:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>Agent identity and persona</li>
              <li>Conversation flows and branching logic</li>
              <li>Objection handling and FAQs</li>
              <li>Compliance requirements</li>
              <li>Success criteria and outcomes</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isProcessing || !rawScript.trim()}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Convert to 18 Sections
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
