import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ContactForm from "@/components/ContactForm";

interface TelecallersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TelecallersModal = ({ open, onOpenChange }: TelecallersModalProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
    // Redirect to telecallers.ai after successful submission
    setTimeout(() => {
      window.open("https://telecallers.ai", "_blank", "noopener,noreferrer");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">Request Voice Pilot</DialogTitle>
          <DialogDescription>
            Enter your details to explore Telecallers.ai voice solutions.
          </DialogDescription>
        </DialogHeader>
        <ContactForm 
          source="telecallers" 
          onSuccess={handleSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default TelecallersModal;
