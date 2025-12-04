import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, FileSpreadsheet, Mail, MessageSquare, Database, AlertCircle, Sparkles } from 'lucide-react';

const chaosTools = [
  { icon: Phone, label: 'Telephony', rotation: -15, x: -180, y: -100 },
  { icon: FileSpreadsheet, label: 'Excel Sheets', rotation: 8, x: 160, y: -120 },
  { icon: Mail, label: 'Email Client', rotation: -5, x: -140, y: 60 },
  { icon: MessageSquare, label: 'WhatsApp Web', rotation: 12, x: 200, y: 40 },
  { icon: Database, label: 'Legacy CRM', rotation: -8, x: -60, y: 140 },
  { icon: AlertCircle, label: 'Missed Calls', rotation: 5, x: 140, y: 120 },
];

export const BeforeAfterVoice = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Transform values based on scroll - slower chaos fade for more visibility
  const chaosOpacity = useTransform(scrollYProgress, [0.25, 0.55], [1, 0]);
  const chaosScale = useTransform(scrollYProgress, [0.25, 0.55], [1, 0.4]);
  const unifiedOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const unifiedScale = useTransform(scrollYProgress, [0.4, 0.7], [0.7, 1.05]);

  // Mobile-responsive position scaling
  const getResponsivePosition = (x: number, y: number) => ({
    x: `clamp(${x * 0.4}px, ${x * 0.5}px, ${x}px)`,
    y: `clamp(${y * 0.4}px, ${y * 0.5}px, ${y}px)`,
  });

  return (
    <div ref={containerRef} className="relative min-h-[600px] md:min-h-[800px] flex items-center justify-center py-12 md:py-20 overflow-hidden">
      {/* Chaos State - Before */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: chaosOpacity, scale: chaosScale }}
      >
        <div className="relative w-full max-w-sm sm:max-w-xl md:max-w-2xl h-[300px] sm:h-[350px] md:h-[400px]">
          {/* Chaos label */}
          <motion.div
            className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs md:text-base font-medium whitespace-nowrap"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            ❌ Traditional Setup: Chaos & Inefficiency
          </motion.div>

          {/* Scattered tool cards - responsive size */}
          {chaosTools.map((tool, index) => {
            const Icon = tool.icon;
            // Scale positions for mobile
            const mobileScale = 0.5;
            const tabletScale = 0.7;
            return (
              <motion.div
                key={index}
                className="absolute left-1/2 top-1/2 w-24 sm:w-28 md:w-36 p-2 sm:p-3 md:p-4 rounded-xl bg-card border border-destructive/30 shadow-lg"
                style={{
                  x: tool.x * mobileScale,
                  y: tool.y * mobileScale,
                  rotate: tool.rotation,
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                animate={{
                  y: [tool.y * mobileScale, tool.y * mobileScale + Math.random() * 10 - 5, tool.y * mobileScale],
                  rotate: [tool.rotation, tool.rotation + 2, tool.rotation - 2, tool.rotation],
                }}
                // @ts-ignore - framer-motion accepts this but TS doesn't recognize it
                transition={{
                  y: { repeat: Infinity, duration: 2 + Math.random(), ease: 'easeInOut' },
                  rotate: { repeat: Infinity, duration: 3 + Math.random(), ease: 'easeInOut' },
                }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-muted flex items-center justify-center mb-2 md:mb-3">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" />
                </div>
                <p className="text-xs sm:text-sm font-medium truncate">{tool.label}</p>
              </motion.div>
            );
          })}

          {/* Connection lines (messy) - hidden on mobile for performance */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block">
            {chaosTools.map((_, i) =>
              chaosTools.slice(i + 1).map((_, j) => (
                <motion.line
                  key={`${i}-${j}`}
                  x1={`${50 + chaosTools[i].x / 10}%`}
                  y1={`${50 + chaosTools[i].y / 8}%`}
                  x2={`${50 + chaosTools[i + j + 1].x / 10}%`}
                  y2={`${50 + chaosTools[i + j + 1].y / 8}%`}
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
        className="absolute inset-0 flex items-center justify-center px-4"
        style={{ opacity: unifiedOpacity, scale: unifiedScale }}
      >
        <div className="text-center w-full">
          {/* Success label */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm md:text-base font-medium mb-6 md:mb-10"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            Vriksha Voice AI: Unified & Intelligent
          </motion.div>

          {/* Unified card - responsive */}
          <motion.div
            className="relative p-6 md:p-10 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/10 via-card to-orange-500/10 border border-primary/30 shadow-2xl max-w-sm md:max-w-lg mx-auto"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {/* Enhanced glow effect */}
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/30 to-orange-500/30 blur-xl md:blur-2xl -z-10" />
            
            <motion.div
              className="w-16 h-16 md:w-24 md:h-24 mx-auto rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center mb-4 md:mb-8"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(249, 115, 22, 0.4)',
                  '0 0 40px rgba(249, 115, 22, 0.6)',
                  '0 0 20px rgba(249, 115, 22, 0.4)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2, type: 'tween' }}
            >
              <Phone className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </motion.div>

            <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">One Platform</h3>
            <p className="text-muted-foreground text-base md:text-lg mb-4 md:mb-8">All channels. Zero chaos.</p>

            {/* Feature pills - responsive */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
              {['Voice AI', 'CRM Sync', 'Omnichannel', 'Analytics', 'Automation'].map((feature, i) => (
                <motion.span
                  key={feature}
                  className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-primary/20 text-primary text-xs md:text-sm font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Stats row - responsive */}
          <motion.div
            className="flex justify-center gap-6 md:gap-12 mt-6 md:mt-10"
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
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 text-xs md:text-sm text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5], y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        ↓ Scroll to transform
      </motion.div>
    </div>
  );
};