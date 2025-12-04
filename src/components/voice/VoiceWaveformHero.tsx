import { motion } from 'framer-motion';
import { Mic, Database, Brain, Zap } from 'lucide-react';

const waveformBars = Array.from({ length: 24 }, (_, i) => i);

export const VoiceWaveformHero = () => {
  return (
    <div className="relative py-12">
      {/* Animated Waveform */}
      <div className="flex items-center justify-center gap-1 mb-12">
        {waveformBars.map((i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-gradient-to-t from-primary to-primary/50 rounded-full"
            animate={{
              height: [20, Math.random() * 60 + 20, 20],
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
              <motion.div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <item.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </motion.div>
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
                  className="w-2 h-2 rounded-full bg-primary"
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
