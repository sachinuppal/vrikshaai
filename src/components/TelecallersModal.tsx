import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { openVoiceChat } from "@/lib/voiceChat";
import { useToast } from "@/hooks/use-toast";

interface TelecallersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TelecallersModal = ({ open, onOpenChange }: TelecallersModalProps) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !mobile.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter both name and mobile number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Store user info (could be sent to backend later)
    console.log("Telecallers pilot request:", { name, mobile });
    
    toast({
      title: "Starting Voice Pilot",
      description: "Connecting you to our AI voice assistant...",
    });

    // Close modal and trigger voice chat
    onOpenChange(false);
    setName("");
    setMobile("");
    setIsSubmitting(false);
    
    // Small delay to allow modal to close
    setTimeout(() => {
      openVoiceChat();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Request Voice Pilot</DialogTitle>
          <DialogDescription>
            Enter your details to start a voice demo with our AI assistant.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="+91 99999 99999"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Connecting..." : "Start Voice Demo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TelecallersModal;
