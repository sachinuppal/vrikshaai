import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SignalBoxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignalBoxModal = ({ open, onOpenChange }: SignalBoxModalProps) => {
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Required field",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Store submission (could be sent to backend later)
    console.log("Signal Box use case submission:", { email, useCase });
    
    toast({
      title: "Thank you!",
      description: "We've received your use case. Our team will reach out soon.",
    });

    // Close modal and reset
    onOpenChange(false);
    setEmail("");
    setUseCase("");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Share Your Use Case</DialogTitle>
          <DialogDescription>
            Tell us about your on-premise or on-device AI voice requirements.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="useCase">Use Case (Optional)</Label>
            <Textarea
              id="useCase"
              placeholder="Describe your requirements..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignalBoxModal;
