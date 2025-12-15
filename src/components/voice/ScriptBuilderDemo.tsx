import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Bot, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  GitBranch,
  User,
  Phone,
  FileText,
  Target,
  Calendar,
  Mic
} from 'lucide-react';

const chatMessages = [
  { role: 'user', text: 'Create a real estate lead qualification script' },
  { role: 'assistant', text: 'I\'ll create an 18-section script for real estate lead qualification with consent capture, property preferences, budget assessment, and appointment scheduling.' },
];

const flowchartNodes = [
  { id: 'start', label: 'Start Call', icon: Play, color: 'from-emerald-500 to-emerald-600', x: 50, y: 20 },
  { id: 'greeting', label: 'Greeting', icon: Mic, color: 'from-blue-500 to-blue-600', x: 50, y: 80 },
  { id: 'consent', label: 'Consent Capture', icon: CheckCircle2, color: 'from-purple-500 to-purple-600', x: 50, y: 140 },
  { id: 'intent', label: 'Intent Detection', icon: Target, color: 'from-orange-500 to-orange-600', x: 50, y: 200 },
  { id: 'buyer', label: 'Buyer Flow', icon: User, color: 'from-primary to-primary/80', x: 20, y: 270 },
  { id: 'seller', label: 'Seller Flow', icon: FileText, color: 'from-cyan-500 to-cyan-600', x: 80, y: 270 },
  { id: 'qualify', label: 'Qualification', icon: GitBranch, color: 'from-pink-500 to-pink-600', x: 50, y: 340 },
  { id: 'schedule', label: 'Schedule Meeting', icon: Calendar, color: 'from-amber-500 to-amber-600', x: 50, y: 400 },
  { id: 'end', label: 'End Call', icon: Phone, color: 'from-red-500 to-red-600', x: 50, y: 460 },
];

const connections = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 6 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 7, to: 8 },
];

export const ScriptBuilderDemo = () => {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [visibleNodes, setVisibleNodes] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setVisibleMessages(prev => {
        if (prev < chatMessages.length) return prev + 1;
        return prev;
      });
    }, 1500);

    return () => clearInterval(messageTimer);
  }, []);

  useEffect(() => {
    if (visibleMessages >= chatMessages.length) {
      const nodeTimer = setInterval(() => {
        setVisibleNodes(prev => {
          if (prev < flowchartNodes.length) return prev + 1;
          if (prev === flowchartNodes.length) {
            setIsComplete(true);
            clearInterval(nodeTimer);
          }
          return prev;
        });
      }, 300);

      return () => clearInterval(nodeTimer);
    }
  }, [visibleMessages]);

  // Reset animation loop
  useEffect(() => {
    if (isComplete) {
      const resetTimer = setTimeout(() => {
        setVisibleMessages(0);
        setVisibleNodes(0);
        setIsComplete(false);
      }, 5000);
      return () => clearTimeout(resetTimer);
    }
  }, [isComplete]);

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Chat Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border p-6 h-[500px] flex flex-col"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Script Studio</h3>
            <p className="text-xs text-muted-foreground">AI-Powered Script Builder</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <AnimatePresence>
            {chatMessages.slice(0, visibleMessages).map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {visibleMessages >= chatMessages.length && visibleNodes > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>Generating flowchart...</span>
            </motion.div>
          )}
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              18 sections generated successfully!
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Flowchart Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border p-6 h-[500px] relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Dynamic Flowchart</h3>
              <p className="text-xs text-muted-foreground">Auto-generated from script</p>
            </div>
          </div>
          {visibleNodes > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
            >
              {visibleNodes}/{flowchartNodes.length} nodes
            </motion.div>
          )}
        </div>

        <div className="relative h-[400px] overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {/* Connection Lines */}
            {connections.map((conn, index) => {
              const fromNode = flowchartNodes[conn.from];
              const toNode = flowchartNodes[conn.to];
              const isVisible = visibleNodes > conn.from && visibleNodes > conn.to;
              
              return (
                <motion.path
                  key={index}
                  d={`M ${fromNode.x}% ${fromNode.y + 15} Q ${(fromNode.x + toNode.x) / 2}% ${(fromNode.y + toNode.y) / 2} ${toNode.x}% ${toNode.y - 15}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: isVisible ? 1 : 0, 
                    opacity: isVisible ? 0.5 : 0 
                  }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {flowchartNodes.map((node, index) => {
            const Icon = node.icon;
            const isVisible = index < visibleNodes;

            return (
              <motion.div
                key={node.id}
                className="absolute flex items-center gap-2"
                style={{ 
                  left: `${node.x}%`, 
                  top: `${node.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isVisible ? 1 : 0, 
                  opacity: isVisible ? 1 : 0 
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 20,
                  delay: index * 0.1
                }}
              >
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${node.color} text-white shadow-lg`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium whitespace-nowrap">{node.label}</span>
                </div>
              </motion.div>
            );
          })}

          {/* Empty state */}
          {visibleNodes === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Flowchart will appear here</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
