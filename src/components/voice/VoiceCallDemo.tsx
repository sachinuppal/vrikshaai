import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User, Mic, CheckCircle2, Brain, MessageSquare, Zap } from 'lucide-react';

const transcriptLines = [
  { speaker: 'AI', text: "Hello! This is Vriksha AI calling from ABC Properties. Am I speaking with Mr. Sharma?" },
  { speaker: 'Customer', text: "Yes, speaking." },
  { speaker: 'AI', text: "Great! I noticed you showed interest in our 3BHK apartments in Whitefield. Are you still looking?" },
  { speaker: 'Customer', text: "Yes, my budget is around 1.2 crores. I need something ready to move in." },
  { speaker: 'AI', text: "Perfect! We have ready-to-move units starting at 1.15 crores. Would you like to schedule a site visit this weekend?" },
  { speaker: 'Customer', text: "Saturday afternoon works for me." },
];

const detectedIntents = [
  { label: 'High Intent', color: 'bg-green-500' },
  { label: '3BHK Interest', color: 'bg-primary' },
  { label: 'Budget: ₹1.2Cr', color: 'bg-blue-500' },
  { label: 'Timeline: Immediate', color: 'bg-purple-500' },
];

const actionTriggers = [
  { label: 'CRM Profile Updated', icon: CheckCircle2 },
  { label: 'Site Visit Scheduled', icon: CheckCircle2 },
  { label: 'WhatsApp Confirmation Sent', icon: CheckCircle2 },
  { label: 'Sales Team Notified', icon: CheckCircle2 },
];

export const VoiceCallDemo = () => {
  const [phase, setPhase] = useState<'idle' | 'calling' | 'connected' | 'analyzing' | 'actions'>('idle');
  const [visibleLines, setVisibleLines] = useState(0);
  const [visibleIntents, setVisibleIntents] = useState(0);
  const [visibleActions, setVisibleActions] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [sentiment, setSentiment] = useState(50);

  useEffect(() => {
    const runSequence = async () => {
      // Reset
      setPhase('idle');
      setVisibleLines(0);
      setVisibleIntents(0);
      setVisibleActions(0);
      setCallDuration(0);
      setSentiment(50);

      await new Promise(r => setTimeout(r, 1000));
      setPhase('calling');
      await new Promise(r => setTimeout(r, 1500));
      setPhase('connected');

      // Show transcript lines
      for (let i = 0; i < transcriptLines.length; i++) {
        await new Promise(r => setTimeout(r, 1200));
        setVisibleLines(i + 1);
        setCallDuration(prev => prev + 8);
        // Update sentiment based on conversation
        if (i === 3) setSentiment(75);
        if (i === 5) setSentiment(90);
      }

      await new Promise(r => setTimeout(r, 800));
      setPhase('analyzing');

      // Show intents
      for (let i = 0; i < detectedIntents.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        setVisibleIntents(i + 1);
      }

      await new Promise(r => setTimeout(r, 600));
      setPhase('actions');

      // Show actions
      for (let i = 0; i < actionTriggers.length; i++) {
        await new Promise(r => setTimeout(r, 500));
        setVisibleActions(i + 1);
      }

      await new Promise(r => setTimeout(r, 3000));
    };

    runSequence();
    const interval = setInterval(runSequence, 18000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
      {/* Phone Panel */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Live Call</h3>
            <motion.div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                phase === 'connected' || phase === 'analyzing' || phase === 'actions'
                  ? 'bg-green-500/20 text-green-400'
                  : phase === 'calling'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-muted text-muted-foreground'
              }`}
              animate={{ scale: phase !== 'idle' ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {phase === 'idle' && 'Standby'}
              {phase === 'calling' && 'Dialing...'}
              {(phase === 'connected' || phase === 'analyzing' || phase === 'actions') && 'Connected'}
            </motion.div>
          </div>

          {/* Caller Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Rajesh Sharma</p>
              <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              <p className="text-xs text-primary mt-1">Lead: Property Inquiry</p>
            </div>
          </div>

          {/* Waveform */}
          <div className="flex items-center justify-center gap-1 h-16 mb-4">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: phase === 'connected' || phase === 'analyzing' || phase === 'actions'
                    ? [8, Math.random() * 40 + 10, 8]
                    : 8,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5 + Math.random() * 0.3,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>

          {/* Duration & Controls */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold text-primary">
              {formatDuration(callDuration)}
            </span>
            <motion.div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                phase !== 'idle' ? 'bg-red-500' : 'bg-green-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {phase !== 'idle' ? (
                <PhoneOff className="w-5 h-5 text-white" />
              ) : (
                <Phone className="w-5 h-5 text-white" />
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Transcript Panel */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Real-Time Transcript</h3>
        </div>

        <div className="h-[280px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
          <AnimatePresence>
            {transcriptLines.slice(0, visibleLines).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: line.speaker === 'AI' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${line.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-sm ${
                    line.speaker === 'AI'
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-xs font-medium mb-1 text-muted-foreground">
                    {line.speaker === 'AI' ? '🤖 AI Agent' : '👤 Customer'}
                  </p>
                  <p>{line.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Analysis & Actions Panel */}
      <motion.div
        className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <div className="space-y-6">
          {/* Sentiment */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Sentiment Analysis</h4>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, #ef4444, #eab308, #22c55e)`,
                }}
                animate={{ width: `${sentiment}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Negative</span>
              <span className="text-green-400 font-medium">{sentiment}% Positive</span>
              <span>Positive</span>
            </div>
          </div>

          {/* Detected Intents */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Detected Intents</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {detectedIntents.slice(0, visibleIntents).map((intent, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`px-3 py-1 rounded-full text-xs font-medium text-white ${intent.color}`}
                  >
                    {intent.label}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Triggers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <h4 className="font-semibold">Auto-Triggered Actions</h4>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {actionTriggers.slice(0, visibleActions).map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </motion.div>
                    <span>{action.label}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
