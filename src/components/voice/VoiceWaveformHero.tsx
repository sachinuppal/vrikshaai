import { motion } from 'framer-motion';
import { Mic, Database, Brain, Zap } from 'lucide-react';

const waveformBars = Array.from({ length: 24 }, (_, i) => i);

export const VoiceWaveformHero = () => {
  return (
    <div className="relative py-12">
      {/* Animated Waveform - Fixed height container */}
      <div className="flex items-end justify-center gap-1 h-20 mb-12">
        {waveformBars.map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-16 bg-gradient-to-t from-primary to-primary/50 rounded-full origin-bottom will-change-transform"
            animate={{
              scaleY: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.05,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Transformation Flow */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
        {[
          { icon: Mic, label: "Voice", color: "from-primary to-orange-400" },
          { icon: Database, label: "Data", color: "from-blue-500 to-cyan-400" },
          { icon: Brain, label: "Intelligence", color: "from-purple-500 to-pink-400" },
          { icon: Zap, label: "Action", color: "from-green-500 to-emerald-400" },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            className="flex items-center gap-4 md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-[5deg] transition-transform duration-300 will-change-transform`}
              >
                <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <span className="text-sm md:text-base font-medium text-muted-foreground">
                {item.label}
              </span>
            </div>
            
            {index < 3 && (
              <motion.div
                className="hidden md:flex items-center"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.2 + 0.7, duration: 0.3 }}
              >
                <div className="w-12 h-0.5 bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/20" />
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary will-change-transform"
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};