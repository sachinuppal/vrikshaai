import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HubSpotFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HubSpotFormModal = ({ open, onOpenChange }: HubSpotFormModalProps) => {
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      // Load HubSpot form script
      const script = document.createElement('script');
      script.src = 'https://js-na2.hsforms.net/forms/embed/244503106.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup script on unmount
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Contact Us</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill out the form below and we'll get back to you shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/30 rounded-xl p-6 mt-4">
          <div 
            className="hs-form-frame" 
            data-region="na2" 
            data-form-id="4f92692d-3c24-4df3-a960-42ccc2a29498" 
            data-portal-id="244503106"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HubSpotFormModal;
