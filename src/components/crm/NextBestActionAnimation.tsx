import { motion } from "framer-motion";
import { Brain, Mail, MessageSquare, Phone, Megaphone } from "lucide-react";
import { useState, useEffect } from "react";

const channels = [
  { icon: Mail, label: "Email", color: "from-blue-500 to-blue-600", angle: -60 },
  { icon: MessageSquare, label: "WhatsApp", color: "from-green-500 to-green-600", angle: -20 },
  { icon: Phone, label: "Voice Call", color: "from-purple-500 to-purple-600", angle: 20 },
  { icon: Megaphone, label: "Ad Retarget", color: "from-orange-500 to-orange-600", angle: 60 },
];

export const NextBestActionAnimation = () => {
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Animation sequence: pulse brain, then fire channels one by one
    const sequence = async () => {
      // Pulse brain
      setIsPulsing(true);
      await new Promise(r => setTimeout(r, 800));
      
      // Fire each channel
      for (let i = 0; i < channels.length; i++) {
        setActiveChannel(i);
        await new Promise(r => setTimeout(r, 600));
      }
      
      // Hold
      await new Promise(r => setTimeout(r, 1000));
      
      // Reset
      setActiveChannel(null);
      setIsPulsing(false);
      await new Promise(r => setTimeout(r, 500));
    };

    const interval = setInterval(sequence, 4500);
    sequence(); // Run immediately
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-64 md:h-80">
      {/* SVG Paths */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          {channels.map((channel, index) => (
            <linearGradient key={index} id={`pathGradient${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" className={`${channel.color.includes('blue') ? 'text-blue-500' : channel.color.includes('green') ? 'text-green-500' : channel.color.includes('purple') ? 'text-purple-500' : 'text-orange-500'}`} stopOpacity="0.8" />
            </linearGradient>
          ))}
        </defs>
        
        {/* Curved paths from center to channels */}
        {channels.map((channel, index) => {
          const startX = 300;
          const startY = 150;
          const endX = 100 + index * 130;
          const endY = 50;
          const controlY = 100;
          
          return (
            <g key={index}>
              {/* Background path */}
              <path
                d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${endY}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              
              {/* Animated path */}
              <motion.path
                d={`M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${endY}`}
                fill="none"
                stroke={`url(#pathGradient${index})`}
                strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: activeChannel !== null && activeChannel >= index ? 1 : 0,
                  opacity: activeChannel !== null && activeChannel >= index ? 1 : 0,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              
              {/* Traveling dot */}
              {activeChannel === index && (
                <motion.circle
                  r="6"
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    offsetDistance: ["0%", "100%"],
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    offsetPath: `path('M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY} ${endX} ${endY}')`,
                  }}
                >
                  <animate attributeName="cx" dur="0.5s" fill="freeze" />
                </motion.circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Channel Icons */}
      {channels.map((channel, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: `${12 + index * 22}%`,
            top: "8%",
          }}
          animate={{
            scale: activeChannel === index ? [1, 1.3, 1.1] : 1,
            y: activeChannel === index ? [0, -5, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-all ${
              activeChannel !== null && activeChannel >= index
                ? `bg-gradient-to-br ${channel.color} text-white shadow-lg`
                : "bg-card border border-border text-muted-foreground"
            }`}
            animate={{
              boxShadow: activeChannel === index 
                ? "0 0 30px hsl(var(--primary) / 0.5)" 
                : "none",
            }}
          >
            <channel.icon className="w-6 h-6 md:w-7 md:h-7" />
          </motion.div>
          <div className="text-xs md:text-sm font-medium text-center mt-2 text-foreground">
            {channel.label}
          </div>
          
          {/* Action indicator */}
          <motion.div
            className="absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: activeChannel !== null && activeChannel >= index ? 1 : 0,
              opacity: activeChannel !== null && activeChannel >= index ? 1 : 0,
            }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        </motion.div>
      ))}

      {/* Central AI Brain */}
      <motion.div
        className="absolute left-1/2 bottom-8 -translate-x-1/2"
        animate={{
          scale: isPulsing ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
          animate={{
            boxShadow: isPulsing
              ? [
                  "0 0 0 0 hsl(var(--primary) / 0.4)",
                  "0 0 40px 20px hsl(var(--primary) / 0.3)",
                  "0 0 0 0 hsl(var(--primary) / 0.4)",
                ]
              : "0 0 20px 10px hsl(var(--primary) / 0.2)",
          }}
          transition={{ duration: 0.8, repeat: isPulsing ? 2 : 0 }}
        >
          <Brain className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
        </motion.div>
        <div className="text-sm md:text-base font-semibold text-center mt-3 text-foreground">
          AI Brain
        </div>
        <motion.div
          className="text-xs text-muted-foreground text-center mt-1"
          animate={{ opacity: isPulsing ? [0.5, 1, 0.5] : 0.7 }}
          transition={{ duration: 0.8, repeat: isPulsing ? 2 : 0 }}
        >
          {isPulsing ? "Analyzing..." : activeChannel !== null ? "Executing Actions" : "Ready"}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NextBestActionAnimation;
