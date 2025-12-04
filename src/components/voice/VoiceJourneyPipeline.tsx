import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mic, Brain, Settings, Database, Share2 } from 'lucide-react';

const pipelineSteps = [
  { icon: Phone, label: 'Incoming Call', tooltip: 'Customer initiates or receives call' },
  { icon: Mic, label: 'Speech-to-Text', tooltip: 'Real-time voice transcription' },
  { icon: Brain, label: 'Intent Detection', tooltip: 'NLU extracts meaning & entities' },
  { icon: Settings, label: 'Business Logic', tooltip: 'Apply rules & workflows' },
  { icon: Database, label: 'CRM Update', tooltip: 'Auto-update customer profile' },
  { icon: Share2, label: 'Multi-Channel', tooltip: 'Trigger follow-up actions' },
];

export const VoiceJourneyPipeline = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % pipelineSteps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          {/* Progress Line Background */}
          <div className="absolute top-8 left-8 right-8 h-1 bg-border rounded-full" />
          
          {/* Active Progress Line */}
          <motion.div
            className="absolute top-8 left-8 h-1 bg-gradient-to-r from-primary to-orange-400 rounded-full"
            animate={{
              width: `${(activeStep / (pipelineSteps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: 'calc(100% - 64px)' }}
          />

          {/* Glowing Dot */}
          <motion.div
            className="absolute top-6 w-5 h-5 bg-primary rounded-full shadow-lg shadow-primary/50"
            animate={{
              left: `calc(${(activeStep / (pipelineSteps.length - 1)) * 100}% - 10px + 32px)`,
            }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: '0 0 20px hsl(var(--primary))' }}
          />

          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <div key={index} className="relative z-10 flex flex-col items-center">
                <motion.div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-card border border-border text-muted-foreground'
                  }`}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -4 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-7 h-7" />
                </motion.div>

                <motion.p
                  className={`mt-3 text-sm font-medium text-center max-w-[100px] ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  animate={{ opacity: isActive ? 1 : 0.7 }}
                >
                  {step.label}
                </motion.p>

                {/* Tooltip */}
                <motion.div
                  className="absolute -bottom-14 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted-foreground whitespace-nowrap shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : -10,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {step.tooltip}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="relative flex flex-col items-start gap-4 pl-8">
          {/* Vertical Progress Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
          
          <motion.div
            className="absolute left-3 top-0 w-0.5 bg-gradient-to-b from-primary to-orange-400"
            animate={{
              height: `${((activeStep + 1) / pipelineSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />

          {pipelineSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isPast = index < activeStep;

            return (
              <motion.div
                key={index}
                className="relative flex items-center gap-4"
                animate={{ opacity: isActive ? 1 : 0.6 }}
              >
                {/* Dot on line */}
                <motion.div
                  className={`absolute -left-8 w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-primary shadow-lg shadow-primary/50'
                      : isPast
                      ? 'bg-primary/50'
                      : 'bg-border'
                  }`}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                >
                  {isPast && (
                    <motion.div
                      className="w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.div>

                <motion.div
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 'bg-card border border-border'
                  }`}
                  animate={{ x: isActive ? 4 : 0 }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isActive ? 'text-primary' : ''}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.tooltip}</p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
