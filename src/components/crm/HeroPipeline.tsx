import { motion } from "framer-motion";
import { Shield, Phone, UserCheck, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const pipelineSteps = [
  { icon: Shield, label: "Consent", tooltip: "Consent Captured" },
  { icon: Phone, label: "Voice Call", tooltip: "Call Understood" },
  { icon: UserCheck, label: "Profile Updated", tooltip: "Auto-Synced" },
  { icon: Zap, label: "Next Actions", tooltip: "AI Triggered" },
];

export const HeroPipeline = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      {/* Desktop: Horizontal Pipeline */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />
        
        {/* Animated Progress Line */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-secondary -translate-y-1/2 z-10"
          animate={{
            width: `${(activeStep / (pipelineSteps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Glowing Dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary z-20"
          animate={{
            left: `${(activeStep / (pipelineSteps.length - 1)) * 100}%`,
            x: "-50%",
            boxShadow: [
              "0 0 0 0 hsl(var(--primary) / 0.4)",
              "0 0 20px 10px hsl(var(--primary) / 0.2)",
              "0 0 0 0 hsl(var(--primary) / 0.4)",
            ],
          }}
          transition={{
            left: { duration: 0.5, ease: "easeInOut" },
            boxShadow: { duration: 1, repeat: Infinity },
          }}
        />

        {/* Pipeline Steps */}
        {pipelineSteps.map((step, index) => (
          <motion.div
            key={index}
            className="relative z-30 flex flex-col items-center"
            animate={{
              scale: activeStep === index ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-300 ${
                activeStep >= index
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border-2 border-border text-muted-foreground"
              }`}
              animate={{
                boxShadow: activeStep === index 
                  ? "0 0 20px hsl(var(--primary) / 0.4)" 
                  : "none",
              }}
            >
              <step.icon className="w-6 h-6" />
            </motion.div>
            
            <span className={`mt-2 text-sm font-medium transition-colors ${
              activeStep >= index ? "text-primary" : "text-muted-foreground"
            }`}>
              {step.label}
            </span>

            {/* Tooltip */}
            <motion.div
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: activeStep === index ? 1 : 0,
                y: activeStep === index ? 0 : 10,
              }}
              transition={{ duration: 0.2 }}
            >
              {step.tooltip}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Mobile: Vertical Pipeline */}
      <div className="flex md:hidden flex-col items-center relative">
        {/* Connecting Line */}
        <div className="absolute top-0 bottom-0 left-7 w-1 bg-border z-0" />
        
        {/* Animated Progress Line */}
        <motion.div
          className="absolute top-0 left-7 w-1 bg-gradient-to-b from-primary to-secondary z-10"
          animate={{
            height: `${(activeStep / (pipelineSteps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Pipeline Steps */}
        {pipelineSteps.map((step, index) => (
          <motion.div
            key={index}
            className="relative z-30 flex items-center gap-4 py-4 w-full"
            animate={{
              x: activeStep === index ? 4 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                activeStep >= index
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border-2 border-border text-muted-foreground"
              }`}
              animate={{
                boxShadow: activeStep === index 
                  ? "0 0 20px hsl(var(--primary) / 0.4)" 
                  : "none",
              }}
            >
              <step.icon className="w-6 h-6" />
            </motion.div>
            
            <div className="flex flex-col">
              <span className={`text-sm font-medium transition-colors ${
                activeStep >= index ? "text-primary" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
              <motion.span
                className="text-xs text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: activeStep === index ? 1 : 0.5 }}
              >
                {step.tooltip}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HeroPipeline;
