import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mic, User, MapPin, Wallet, Calendar, ThumbsUp } from "lucide-react";
import { useState, useEffect } from "react";

const transcriptLines = [
  "Hi, I'm looking for a 3BHK apartment...",
  "My budget is around 1.5 crores...",
  "Preferably in Whitefield area...",
  "Need it within 2-3 months...",
  "Looking for good schools nearby...",
];

const profileFields = [
  { icon: User, label: "Name", value: "Rajesh Kumar" },
  { icon: MapPin, label: "Location", value: "Whitefield, Bangalore" },
  { icon: Wallet, label: "Budget", value: "₹1.2 - 1.5 Cr" },
  { icon: Calendar, label: "Timeline", value: "60-90 days" },
  { icon: ThumbsUp, label: "Intent Score", value: "85/100" },
];

export const VoiceToProfileDemo = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [visibleFields, setVisibleFields] = useState<number[]>([]);

  useEffect(() => {
    // Reset and restart animation loop
    const phases = [
      // Phase 0: Call active (2s)
      () => {
        setActivePhase(0);
        setVisibleLines([]);
        setVisibleFields([]);
      },
      // Phase 1: Transcript appears (show lines one by one)
      ...transcriptLines.map((_, i) => () => {
        setActivePhase(1);
        setVisibleLines(prev => [...prev, i]);
      }),
      // Phase 2: Profile updates (show fields one by one)
      ...profileFields.map((_, i) => () => {
        setActivePhase(2);
        setVisibleFields(prev => [...prev, i]);
      }),
      // Phase 3: Hold complete state
      () => setActivePhase(3),
    ];

    let currentStep = 0;
    const delays = [
      1500, // Initial call
      ...transcriptLines.map(() => 600), // Each transcript line
      ...profileFields.map(() => 400), // Each profile field
      2000, // Hold
    ];

    const runSequence = () => {
      phases[currentStep]?.();
      const delay = delays[currentStep] || 1000;
      
      currentStep++;
      if (currentStep >= phases.length) {
        currentStep = 0;
        setVisibleLines([]);
        setVisibleFields([]);
      }
      
      return setTimeout(runSequence, delay);
    };

    const timeout = runSequence();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-4 md:gap-6 items-start max-w-5xl mx-auto">
      {/* Phone Card */}
      <motion.div
        className="bg-card rounded-2xl border border-border p-4 md:p-6 relative overflow-hidden"
        animate={{
          borderColor: activePhase === 0 || activePhase === 1 
            ? "hsl(var(--primary))" 
            : "hsl(var(--border))",
          boxShadow: activePhase === 0 || activePhase === 1 
            ? "0 0 30px hsl(var(--primary) / 0.2)" 
            : "none",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <span className="text-sm font-medium text-muted-foreground">Incoming Call</span>
          <motion.div
            className="w-3 h-3 rounded-full bg-green-500"
            animate={{
              scale: activePhase <= 1 ? [1, 1.2, 1] : 1,
              opacity: activePhase <= 1 ? 1 : 0.5,
            }}
            transition={{ duration: 0.8, repeat: activePhase <= 1 ? Infinity : 0 }}
          />
        </div>

        <div className="flex justify-center mb-4 md:mb-6">
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{
              scale: activePhase <= 1 ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 1.5, repeat: activePhase <= 1 ? Infinity : 0 }}
          >
            <Phone className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </motion.div>
        </div>

        {/* Waveform Animation */}
        <div className="flex items-center justify-center gap-1 h-10 md:h-12">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 md:w-1.5 bg-primary rounded-full"
              animate={{
                height: activePhase <= 1 
                  ? [8, Math.random() * 24 + 8, 8] 
                  : 8,
              }}
              transition={{
                duration: 0.4,
                repeat: activePhase <= 1 ? Infinity : 0,
                delay: i * 0.05,
              }}
            />
          ))}
        </div>

        <div className="text-center mt-3 md:mt-4">
          <motion.span
            className="text-sm text-muted-foreground"
            animate={{ opacity: activePhase <= 1 ? [0.5, 1, 0.5] : 0.5 }}
            transition={{ duration: 1.5, repeat: activePhase <= 1 ? Infinity : 0 }}
          >
            {activePhase <= 1 ? "AI Listening..." : "Call Ended"}
          </motion.span>
        </div>
      </motion.div>

      {/* Transcript Card */}
      <motion.div
        className="bg-card rounded-2xl border border-border p-4 md:p-6 min-h-[200px] md:min-h-[280px]"
        animate={{
          borderColor: activePhase === 1 
            ? "hsl(var(--secondary))" 
            : "hsl(var(--border))",
          boxShadow: activePhase === 1 
            ? "0 0 30px hsl(var(--secondary) / 0.2)" 
            : "none",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Mic className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-muted-foreground">Live Transcript</span>
        </div>

        <div className="space-y-2 md:space-y-3">
          <AnimatePresence>
            {visibleLines.map((lineIndex) => (
              <motion.div
                key={lineIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs md:text-sm text-foreground bg-muted/50 rounded-lg p-2 md:p-3"
              >
                <span className="text-primary font-medium">Customer:</span>{" "}
                {transcriptLines[lineIndex]}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {visibleLines.length === 0 && (
            <div className="text-xs md:text-sm text-muted-foreground italic">
              Waiting for transcript...
            </div>
          )}
        </div>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="bg-card rounded-2xl border border-border p-4 md:p-6 min-h-[200px] md:min-h-[280px]"
        animate={{
          borderColor: activePhase >= 2 
            ? "hsl(var(--primary))" 
            : "hsl(var(--border))",
          boxShadow: activePhase >= 2 
            ? "0 0 30px hsl(var(--primary) / 0.2)" 
            : "none",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Profile Auto-Update</span>
        </div>

        <div className="space-y-2 md:space-y-3">
          <AnimatePresence>
            {visibleFields.map((fieldIndex) => {
              const field = profileFields[fieldIndex];
              return (
                <motion.div
                  key={fieldIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-lg bg-primary/5"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <field.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{field.label}</div>
                    <div className="text-xs md:text-sm font-medium text-foreground truncate">{field.value}</div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {visibleFields.length === 0 && (
            <div className="text-xs md:text-sm text-muted-foreground italic">
              Profile updating soon...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceToProfileDemo;