import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "vriksha_ai_calling_consent";

export const getAICallingConsent = (): "accepted" | null => {
  return localStorage.getItem(CONSENT_KEY) as "accepted" | null;
};

export const setAICallingConsent = (value: "accepted") => {
  localStorage.setItem(CONSENT_KEY, value);
};

const AICallingConsentModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = getAICallingConsent();
    if (!consent) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setAICallingConsent("accepted");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">AI Calling Consent</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p className="text-base font-medium text-foreground/90">
              At Vriksha AI, we believe technology should feel human. Our Voice AI 
              is designed to connect with you personally — understanding your needs, 
              answering your questions, and being there when you need us most.
            </p>
            <p className="text-sm">
              This consent allows us to reach out to you through our AI-powered voice 
              technology. By accepting, you consent to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Receiving AI-powered voice calls from Vriksha AI</li>
              <li>Processing of your contact information for voice communications</li>
              <li>Call recording for quality and training purposes</li>
            </ul>
            <p className="text-sm italic text-muted-foreground">
              We ask for this consent because trust is the foundation of everything we build. 
              Your permission empowers us to serve you better while respecting your privacy.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg mt-2">
          <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your data is protected under our{" "}
            <Link to="/privacy" className="text-primary hover:underline" onClick={handleAccept}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="mt-4">
          <Button
            onClick={handleAccept}
            className="w-full"
          >
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AICallingConsentModal;
