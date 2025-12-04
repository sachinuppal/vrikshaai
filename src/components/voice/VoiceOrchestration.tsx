import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Mail, MessageSquare, Phone, Target, Database, CheckCircle2 } from 'lucide-react';

const channels = [
  { icon: Mail, label: 'Email', color: 'from-blue-500 to-blue-600', trigger: 'Send follow-up email' },
  { icon: MessageSquare, label: 'WhatsApp', color: 'from-green-500 to-green-600', trigger: 'Confirmation message' },
  { icon: Phone, label: 'Callback', color: 'from-primary to-orange-500', trigger: 'Schedule next call' },
  { icon: Target, label: 'Ad Retarget', color: 'from-purple-500 to-purple-600', trigger: 'Add to audience' },
  { icon: Database, label: 'CRM', color: 'from-cyan-500 to-cyan-600', trigger: 'Update profile' },
];

export const VoiceOrchestration = () => {
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [completedChannels, setCompletedChannels] = useState<number[]>([]);

  useEffect(() => {
    const runSequence = async () => {
      setCompletedChannels([]);
      setActiveChannel(null);
      
      // Pulse the brain
      setIsPulsing(true);
      await new Promise(r => setTimeout(r, 1000));
      setIsPulsing(false);

      // Activate each channel
      for (let i = 0; i < channels.length; i++) {
        setActiveChannel(i);
        await new Promise(r => setTimeout(r, 800));
        setCompletedChannels(prev => [...prev, i]);
      }

      await new Promise(r => setTimeout(r, 2000));
    };

    runSequence();
    const interval = setInterval(runSequence, 8000);
    return () => clearInterval(interval);
  }, []);

  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (Math.PI / (total + 1)) * (index + 1);
    return {
      x: Math.cos(angle) * radius,
      y: -Math.sin(angle) * radius,
    };
  };

  return (
    <div className="relative">
      {/* Mobile Layout - Vertical Stack */}
      <div className="md:hidden flex flex-col items-center gap-4 py-8">
        {/* Central Brain - Mobile */}
        <motion.div
          className="relative z-20 w-20 h-20 rounded-full bg-gradient-to-br from-primary via-orange-500 to-primary flex items-center justify-center will-change-transform"
          animate={{
            scale: isPulsing ? [1, 1.1, 1] : 1,
            boxShadow: isPulsing
              ? [
                  '0 0 0 0 rgba(249, 115, 22, 0.4)',
                  '0 0 0 15px rgba(249, 115, 22, 0)',
                  '0 0 0 0 rgba(249, 115, 22, 0)',
                ]
              : '0 0 20px rgba(249, 115, 22, 0.3)',
          }}
          transition={{ type: "tween", duration: 0.8 }}
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.div
          className="text-sm font-medium text-primary mb-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {isPulsing ? 'Analyzing...' : activeChannel !== null ? 'Executing Actions' : 'Ready'}
        </motion.div>

        {/* Channel Cards - Mobile */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            const isActive = activeChannel === index;
            const isCompleted = completedChannels.includes(index);

            return (
              <motion.div
                key={index}
                className={`relative p-3 rounded-xl flex items-center gap-3 bg-gradient-to-br ${channel.color} shadow-md`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-white text-sm font-medium">{channel.label}</span>
                
                {isCompleted && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Desktop Layout - Radial */}
      <div className="hidden md:flex relative h-[400px] items-center justify-center">
        {/* SVG for connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            {channels.map((_, index) => (
              <linearGradient
                key={index}
                id={`line-gradient-${index}`}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.3)" />
              </linearGradient>
            ))}
          </defs>
          
          {channels.map((_, index) => {
            const pos = getPosition(index, channels.length, 140);
            const centerX = 200;
            const centerY = 200;
            const targetX = centerX + pos.x;
            const targetY = centerY + pos.y;
            
            // Create curved path
            const midX = (centerX + targetX) / 2;
            const midY = (centerY + targetY) / 2 - 30;
            
            return (
              <g key={index}>
                {/* Background path */}
                <path
                  d={`M ${centerX} ${centerY} Q ${midX} ${midY} ${targetX} ${targetY}`}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                
                {/* Animated path */}
                <motion.path
                  d={`M ${centerX} ${centerY} Q ${midX} ${midY} ${targetX} ${targetY}`}
                  fill="none"
                  stroke={`url(#line-gradient-${index})`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: activeChannel === index || completedChannels.includes(index) ? 1 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Traveling dot */}
                {activeChannel === index && (
                  <motion.circle
                    r="6"
                    fill="hsl(var(--primary))"
                    filter="url(#glow)"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    transition={{ duration: 0.5 }}
                    style={{
                      offsetPath: `path("M ${centerX} ${centerY} Q ${midX} ${midY} ${targetX} ${targetY}")`,
                    }}
                  />
                )}
              </g>
            );
          })}

          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Channel nodes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {channels.map((channel, index) => {
            const pos = getPosition(index, channels.length, 140);
            const Icon = channel.icon;
            const isActive = activeChannel === index;
            const isCompleted = completedChannels.includes(index);

            return (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  left: `calc(50% + ${pos.x}px - 32px)`,
                  top: `calc(50% + ${pos.y}px - 32px)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={`relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${channel.color} shadow-lg transition-transform duration-200 hover:scale-110`}
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    boxShadow: isActive
                      ? '0 0 30px rgba(249, 115, 22, 0.5)'
                      : '0 4px 20px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <Icon className="w-7 h-7 text-white" />
                  
                  {/* Completed checkmark */}
                  {isCompleted && (
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                <p className="text-center text-sm font-medium mt-2">{channel.label}</p>

                {/* Tooltip */}
                <motion.div
                  className="absolute top-full mt-6 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs whitespace-nowrap shadow-lg z-10"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : -5,
                  }}
                >
                  {channel.trigger}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Central Brain */}
        <motion.div
          className="relative z-20 w-24 h-24 rounded-full bg-gradient-to-br from-primary via-orange-500 to-primary flex items-center justify-center will-change-transform"
          animate={{
            scale: isPulsing ? [1, 1.1, 1] : 1,
            boxShadow: isPulsing
              ? [
                  '0 0 0 0 rgba(249, 115, 22, 0.4)',
                  '0 0 0 20px rgba(249, 115, 22, 0)',
                  '0 0 0 0 rgba(249, 115, 22, 0)',
                ]
              : '0 0 30px rgba(249, 115, 22, 0.3)',
          }}
          transition={{ type: "tween", duration: 0.8 }}
        >
          <Brain className="w-12 h-12 text-white" />
          
          {/* Status text */}
          <motion.div
            className="absolute -bottom-10 whitespace-nowrap text-sm font-medium text-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {isPulsing ? 'Analyzing...' : activeChannel !== null ? 'Executing Actions' : 'Ready'}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};