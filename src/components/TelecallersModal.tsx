import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
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
    
    try {
      // Store in database
      const { error } = await supabase
        .from('lead_submissions')
        .insert({
          source: 'telecallers',
          name: name.trim(),
          mobile: mobile.trim(),
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Redirecting you to Telecallers.ai...",
      });

      // Close modal and reset
      onOpenChange(false);
      setName("");
      setMobile("");
      
      // Redirect to telecallers.ai
      setTimeout(() => {
        window.open("https://telecallers.ai", "_blank", "noopener,noreferrer");
      }, 300);
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Request Voice Pilot</DialogTitle>
          <DialogDescription>
            Enter your details to explore Telecallers.ai voice solutions.
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
            {isSubmitting ? "Submitting..." : "Continue to Telecallers.ai"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TelecallersModal;
