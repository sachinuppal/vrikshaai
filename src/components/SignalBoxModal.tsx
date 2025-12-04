import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ContactForm from "@/components/ContactForm";

interface SignalBoxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignalBoxModal = ({ open, onOpenChange }: SignalBoxModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">Share Your Use Case</DialogTitle>
          <DialogDescription>
            Tell us about your on-premise or on-device AI voice requirements.
          </DialogDescription>
        </DialogHeader>
        <ContactForm 
          source="signal_box" 
          onSuccess={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default SignalBoxModal;
