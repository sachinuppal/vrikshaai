import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  Target, 
  FileCheck, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield
} from 'lucide-react';

const pillars = [
  { id: 'reliability', label: 'Reliability', icon: Activity, value: 94, color: 'hsl(var(--primary))' },
  { id: 'latency', label: 'Latency', icon: Clock, value: 88, color: 'hsl(142, 76%, 36%)' },
  { id: 'accuracy', label: 'Accuracy', icon: Target, value: 96, color: 'hsl(217, 91%, 60%)' },
  { id: 'adherence', label: 'Adherence', icon: FileCheck, value: 91, color: 'hsl(280, 87%, 55%)' },
  { id: 'outcome', label: 'Outcome', icon: TrendingUp, value: 85, color: 'hsl(38, 92%, 50%)' },
];

const complianceSections = [
  { name: 'Greeting', status: 'pass' },
  { name: 'Consent', status: 'pass' },
  { name: 'Identity', status: 'pass' },
  { name: 'Intent', status: 'pass' },
  { name: 'Buyer Flow', status: 'pass' },
  { name: 'Seller Flow', status: 'partial' },
  { name: 'Budget', status: 'pass' },
  { name: 'Timeline', status: 'pass' },
  { name: 'Location', status: 'pass' },
  { name: 'Property Type', status: 'pass' },
  { name: 'Financing', status: 'partial' },
  { name: 'Objection', status: 'pass' },
  { name: 'Callback', status: 'pass' },
  { name: 'Scheduling', status: 'pass' },
  { name: 'Confirmation', status: 'pass' },
  { name: 'Next Steps', status: 'pass' },
  { name: 'Compliance', status: 'fail' },
  { name: 'Closing', status: 'pass' },
];

const Ring = ({ value, color, size = 80, strokeWidth = 6, delay = 0, isVisible }: {
  value: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
  isVisible: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(0);
    }
  }, [isVisible, value, delay]);

  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay }}
      />
    </svg>
  );
};

export const ObservabilityDemo = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const [overallScore, setOverallScore] = useState(0);
  const [visibleCells, setVisibleCells] = useState(0);

  useEffect(() => {
    if (isInView) {
      // Animate overall score
      const scoreTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setOverallScore(prev => {
            if (prev < 91) return prev + 1;
            clearInterval(interval);
            return prev;
          });
        }, 30);
      }, 500);

      // Animate compliance cells
      const cellTimer = setInterval(() => {
        setVisibleCells(prev => {
          if (prev < complianceSections.length) return prev + 1;
          clearInterval(cellTimer);
          return prev;
        });
      }, 100);

      return () => {
        clearTimeout(scoreTimer);
        clearInterval(cellTimer);
      };
    } else {
      setOverallScore(0);
      setVisibleCells(0);
    }
  }, [isInView]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'partial':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'fail':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <div ref={containerRef} className="grid lg:grid-cols-2 gap-6 lg:gap-8">
      {/* 5 Pillars Ring Gauges */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">5 Pillars of Performance</h3>
            <p className="text-xs text-muted-foreground">Real-time call quality metrics</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isInView ? 1 : 0, opacity: isInView ? 1 : 0 }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <Ring
                    value={pillar.value}
                    color={pillar.color}
                    size={70}
                    strokeWidth={5}
                    delay={index * 0.2}
                    isVisible={isInView}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{isInView ? pillar.value : 0}%</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{pillar.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20"
        >
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Overall Quality Score</p>
            <p className="text-3xl font-bold text-primary">{overallScore}%</p>
          </div>
        </motion.div>
      </motion.div>

      {/* 18-Section Compliance Grid */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">18-Section Compliance</h3>
            <p className="text-xs text-muted-foreground">Script adherence verification</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {complianceSections.map((section, index) => (
            <motion.div
              key={section.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: index < visibleCells ? 1 : 0, 
                opacity: index < visibleCells ? 1 : 0 
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 20 
              }}
              className={`p-2 rounded-lg border text-center ${getStatusBg(section.status)}`}
            >
              <div className="flex justify-center mb-1">
                {getStatusIcon(section.status)}
              </div>
              <p className="text-[10px] font-medium truncate">{section.name}</p>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: 2 }}
          className="mt-6 flex items-center justify-center gap-6 text-xs"
        >
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span className="text-muted-foreground">Pass (15)</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span className="text-muted-foreground">Partial (2)</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-500" />
            <span className="text-muted-foreground">Fail (1)</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
