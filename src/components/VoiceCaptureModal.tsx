import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/data/countries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { initializeRinggWidget, triggerRinggWidget } from "@/lib/ringgWidget";

interface VoiceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallStart?: (recordId: string) => void;
}

export const VoiceCaptureModal = ({ isOpen, onClose, onCallStart }: VoiceCaptureModalProps) => {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCountry = countries.find((c) => c.code === countryCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhone = `${selectedCountry?.dialCode}${phone}`;
      
      // Save to database and get the record ID
      const { data, error } = await supabase.from("voice_widget_calls").insert({
        name: name.trim(),
        phone: phone.trim(),
        country_code: countryCode,
        full_phone: fullPhone,
        source: "voice_widget",
        page_url: window.location.href,
      }).select("id").single();

      if (error) {
        console.error("Error saving voice call data:", error);
        toast.error("Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Store record ID and user info in session
      sessionStorage.setItem("voice_call_record_id", data.id);
      sessionStorage.setItem("voice_user_name", name.trim());
      sessionStorage.setItem("voice_user_phone", fullPhone);
      sessionStorage.setItem("voice_captured", "true");

      // Start call tracking for the overlay
      onCallStart?.(data.id);

      // Initialize widget with personalized variables
      await initializeRinggWidget(name.trim(), fullPhone);

      // Close modal with animation
      onClose();

      // Trigger widget after modal animation completes
      setTimeout(() => {
        const triggered = triggerRinggWidget();
        if (!triggered) {
          toast.info("Widget is loading, please try clicking the button again");
        }
      }, 500);

    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              {/* Gradient accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8">
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Before we connect
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quick intro so we can personalize your experience
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="voice-name" className="text-sm font-medium">
                      Your name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="voice-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        autoFocus
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="voice-phone" className="text-sm font-medium">
                      Phone number
                    </Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[100px] shrink-0">
                          <SelectValue>
                            {selectedCountry && (
                              <span className="flex items-center gap-1.5">
                                <span>{selectedCountry.flag}</span>
                                <span className="text-xs text-muted-foreground">
                                  {selectedCountry.dialCode}
                                </span>
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="text-muted-foreground">
                                  {country.dialCode}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="voice-phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                          className="pl-10"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || !name.trim() || !phone.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Start Call
                      </>
                    )}
                  </Button>

                  {/* Consent text */}
                  <p className="text-center text-xs text-muted-foreground">
                    By continuing, you consent to receiving an AI-powered call.
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
