import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, TrendingDown, Clock, Calendar } from 'lucide-react';

const metrics = [
  {
    icon: Phone,
    value: 1000,
    suffix: 's+',
    label: 'Simultaneous Calls',
    description: 'Handle without increasing headcount',
    color: 'from-primary to-orange-500',
  },
  {
    icon: TrendingDown,
    value: 80,
    suffix: '%',
    prefix: '60-',
    label: 'Workload Reduction',
    description: 'Automation of L1/L2 calls',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Clock,
    value: 24,
    suffix: '/7',
    label: 'Availability',
    description: 'Never miss a lead or call',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Calendar,
    value: 6,
    suffix: ' mo',
    prefix: '3-',
    label: 'ROI Timeline',
    description: 'Visible returns',
    color: 'from-purple-500 to-pink-500',
  },
];

const CountUp = ({ 
  target, 
  duration = 2000, 
  prefix = '', 
  suffix = '' 
}: { 
  target: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
};

export const AnimatedROIMetrics = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <div ref={containerRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <motion.div
            key={index}
            className="relative p-6 rounded-2xl bg-card border border-border overflow-hidden group hover:-translate-y-1 transition-transform duration-200 will-change-transform"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.15, duration: 0.5 }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            {/* Icon */}
            <motion.div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4`}
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ delay: index * 0.15 + 0.2, type: 'spring', stiffness: 200 }}
            >
              <Icon className="w-7 h-7 text-white" />
            </motion.div>

            {/* Value */}
            <motion.div
              className="text-4xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: index * 0.15 + 0.3 }}
            >
              <CountUp 
                target={metric.value} 
                prefix={metric.prefix} 
                suffix={metric.suffix}
                duration={1500 + index * 200}
              />
            </motion.div>

            {/* Label */}
            <h3 className="font-semibold text-lg mb-1">{metric.label}</h3>
            <p className="text-sm text-muted-foreground">{metric.description}</p>

            {/* Decorative circle */}
            <motion.div
              className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${metric.color} opacity-10`}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: index * 0.15 + 0.4, duration: 0.5 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
