import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, FileSpreadsheet, Mail, MessageSquare, Database, AlertCircle, Sparkles } from 'lucide-react';

const chaosTools = [
  { icon: Phone, label: 'Telephony', rotation: -15, x: -120, y: -60 },
  { icon: FileSpreadsheet, label: 'Excel Sheets', rotation: 8, x: 100, y: -80 },
  { icon: Mail, label: 'Email Client', rotation: -5, x: -80, y: 40 },
  { icon: MessageSquare, label: 'WhatsApp Web', rotation: 12, x: 130, y: 20 },
  { icon: Database, label: 'Legacy CRM', rotation: -8, x: -30, y: 100 },
  { icon: AlertCircle, label: 'Missed Calls', rotation: 5, x: 80, y: 90 },
];

export const BeforeAfterVoice = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Transform values based on scroll
  const chaosOpacity = useTransform(scrollYProgress, [0.2, 0.5], [1, 0]);
  const chaosScale = useTransform(scrollYProgress, [0.2, 0.5], [1, 0.5]);
  const unifiedOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const unifiedScale = useTransform(scrollYProgress, [0.4, 0.7], [0.8, 1]);

  return (
    <div ref={containerRef} className="relative min-h-[600px] flex items-center justify-center py-20">
      {/* Chaos State - Before */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: chaosOpacity, scale: chaosScale }}
      >
        <div className="relative w-full max-w-lg h-80">
          {/* Chaos label */}
          <motion.div
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            ❌ Traditional Setup: Chaos & Inefficiency
          </motion.div>

          {/* Scattered tool cards */}
          {chaosTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={index}
                className="absolute left-1/2 top-1/2 w-28 p-3 rounded-xl bg-card border border-destructive/30 shadow-lg"
                style={{
                  x: tool.x,
                  y: tool.y,
                  rotate: tool.rotation,
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                animate={{
                  y: [tool.y, tool.y + Math.random() * 10 - 5, tool.y],
                  rotate: [tool.rotation, tool.rotation + 2, tool.rotation - 2, tool.rotation],
                }}
                // @ts-ignore - framer-motion accepts this but TS doesn't recognize it
                transition={{
                  y: { repeat: Infinity, duration: 2 + Math.random(), ease: 'easeInOut' },
                  rotate: { repeat: Infinity, duration: 3 + Math.random(), ease: 'easeInOut' },
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium truncate">{tool.label}</p>
              </motion.div>
            );
          })}

          {/* Connection lines (messy) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {chaosTools.map((_, i) =>
              chaosTools.slice(i + 1).map((_, j) => (
                <motion.line
                  key={`${i}-${j}`}
                  x1={`${50 + chaosTools[i].x / 4}%`}
                  y1={`${50 + chaosTools[i].y / 3}%`}
                  x2={`${50 + chaosTools[i + j + 1].x / 4}%`}
                  y2={`${50 + chaosTools[i + j + 1].y / 3}%`}
                  stroke="hsl(var(--destructive) / 0.2)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + (i + j) * 0.1 }}
                />
              ))
            )}
          </svg>
        </div>
      </motion.div>

      {/* Unified State - After */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: unifiedOpacity, scale: unifiedScale }}
      >
        <div className="text-center">
          {/* Success label */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Vriksha Voice AI: Unified & Intelligent
          </motion.div>

          {/* Unified card */}
          <motion.div
            className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-orange-500/10 border border-primary/30 shadow-2xl max-w-md mx-auto"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-orange-500/20 blur-xl -z-10" />
            
            <motion.div
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mb-6"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(249, 115, 22, 0.3)',
                  '0 0 40px rgba(249, 115, 22, 0.5)',
                  '0 0 20px rgba(249, 115, 22, 0.3)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Phone className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold mb-2">One Platform</h3>
            <p className="text-muted-foreground mb-6">All channels. Zero chaos.</p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              {['Voice AI', 'CRM Sync', 'Omnichannel', 'Analytics', 'Automation'].map((feature, i) => (
                <motion.span
                  key={feature}
                  className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="flex justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {[
              { value: '10x', label: 'Efficiency' },
              { value: '0', label: 'Manual Work' },
              { value: '24/7', label: 'Coverage' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5], y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        ↓ Scroll to transform
      </motion.div>
    </div>
  );
};
