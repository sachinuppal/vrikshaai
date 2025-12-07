import { useState, useEffect, cloneElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Phone, 
  PhoneCall, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  X,
  ArrowRight,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallStatus } from "@/hooks/useCallStatus";

interface CallStatusOverlayProps {
  status: CallStatus;
  callId: string | null;
  onClear: () => void;
}

const statusConfig: Record<CallStatus, {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: string;
  pulse?: boolean;
}> = {
  idle: {
    icon: <Phone className="h-5 w-5" />,
    title: "",
    description: "",
    color: "text-muted-foreground",
  },
  initiated: {
    icon: <Phone className="h-5 w-5" />,
    title: "Ready to connect",
    description: "Click 'Start Call' to begin your conversation",
    color: "text-primary",
    pulse: true,
  },
  in_progress: {
    icon: <PhoneCall className="h-5 w-5" />,
    title: "Call in progress",
    description: "We're listening and taking notes",
    color: "text-green-500",
    pulse: true,
  },
  completed: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Call completed",
    description: "Processing your conversation...",
    color: "text-blue-500",
  },
  analyzing: {
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
    title: "Analyzing your call",
    description: "Our AI is extracting valuable insights from your conversation",
    color: "text-amber-500",
  },
  analysis_ready: {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Analysis ready!",
    description: "Your call insights are ready to view",
    color: "text-primary",
  },
};

export const CallStatusOverlay = ({ 
  status, 
  callId, 
  onClear 
}: CallStatusOverlayProps) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const config = statusConfig[status];
  // Skip "initiated" status - redundant when Ringg widget is already visible
  // Show modal for post-call states: in_progress, completed, analyzing, analysis_ready
  const isVisible = status !== "idle" && status !== "initiated" && !dismissed;
  const isModalState = status === "completed" || status === "analyzing" || status === "analysis_ready";

  // Auto-redirect countdown when analysis is ready
  useEffect(() => {
    if (status === "analysis_ready" && callId) {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            navigate(`/call-analysis/${callId}`);
            onClear();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [status, callId, navigate, onClear]);

  const handleViewNow = () => {
    if (callId) {
      navigate(`/call-analysis/${callId}`);
      onClear();
    }
  };

  const handleStayHere = () => {
    setCountdown(null);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Reset dismissed state when a new call starts
  useEffect(() => {
    if (status === "initiated") {
      setDismissed(false);
    }
  }, [status]);

  // Clone icon with larger size for modal
  const getLargeIcon = () => {
    return cloneElement(config.icon, { 
      className: `h-8 w-8 ${config.icon.props.className?.includes('animate-spin') ? 'animate-spin' : ''}`
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop for modal states */}
          {isModalState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
              onClick={handleDismiss}
            />
          )}

          {/* Modal/Overlay Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: isModalState ? 0 : -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: isModalState ? 0 : -30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={
              isModalState
                ? "fixed inset-0 z-[10000] flex items-center justify-center p-4"
                : "fixed top-4 left-4 right-4 z-[10000] sm:top-auto sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2"
            }
          >
            <div className={
              isModalState
                ? "relative overflow-hidden rounded-2xl border border-border/50 bg-card backdrop-blur-xl shadow-2xl w-full max-w-md"
                : "relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl"
            }>
              {/* Gradient accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              
              {/* Pulse ring for active states */}
              {config.pulse && !isModalState && (
                <div className="absolute inset-0 rounded-2xl">
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" style={{ animationDuration: "2s" }} />
                </div>
              )}

              {isModalState ? (
                // Modal Layout for completed/analyzing/analysis_ready
                <div className="relative p-8 text-center">
                  {/* Close button */}
                  <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Centered Icon */}
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-background/50 border border-border/50 ${config.color} mb-6`}>
                    {getLargeIcon()}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {config.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-6">
                    {config.description}
                  </p>

                  {/* Enhanced Copy */}
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Would you like to see how we analyse our calls and how our analysis looks like?
                  </p>

                  {/* Countdown indicator */}
                  {countdown !== null && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4" />
                      <span>Redirecting in {countdown}s</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Button
                      size="lg"
                      onClick={handleViewNow}
                      className="w-full gap-2"
                    >
                      View Analysis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="ghost"
                      onClick={handleStayHere}
                      className="w-full text-muted-foreground"
                    >
                      Stay Here
                    </Button>
                  </div>
                </div>
              ) : (
                // Compact Layout for in_progress
                <div className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/50 ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0 sm:min-w-[180px]">
                      <h4 className="font-semibold text-foreground text-sm">
                        {config.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
