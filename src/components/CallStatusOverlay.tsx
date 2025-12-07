import { useState, useEffect } from "react";
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
  icon: React.ReactNode;
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
    title: "Analyzing call",
    description: "AI is extracting insights...",
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
  const isVisible = status !== "idle" && !dismissed;

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
    if (status === "analysis_ready") {
      setDismissed(true);
    }
  };

  // Reset dismissed state when a new call starts
  useEffect(() => {
    if (status === "initiated") {
      setDismissed(false);
    }
  }, [status]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-[10000] sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
            
            {/* Pulse ring for active states */}
            {config.pulse && (
              <div className="absolute inset-0 rounded-2xl">
                <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" style={{ animationDuration: "2s" }} />
              </div>
            )}

            <div className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
              {/* Status Icon & Text Row */}
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

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {status === "analysis_ready" && (
                  <>
                    {countdown !== null && (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:mr-2">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span className="whitespace-nowrap">Redirecting in {countdown}s</span>
                      </div>
                    )}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleStayHere}
                        className="text-xs flex-1 sm:flex-initial"
                      >
                        Stay Here
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleViewNow}
                        className="gap-1.5 flex-1 sm:flex-initial"
                      >
                        View Results
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                )}

                {/* Dismiss button for completed states */}
                {(status === "completed" || status === "analyzing") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => callId && navigate(`/call-analysis/${callId}`)}
                    className="text-xs w-full sm:w-auto"
                  >
                    View Analysis
                  </Button>
                )}

                {/* Close button */}
                {status === "analysis_ready" && (
                  <button
                    onClick={handleDismiss}
                    className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
