import { motion } from 'framer-motion';
import { Shield, Zap, Target, ClipboardCheck, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PillarData {
  reliability: number;
  latency: number | null;
  accuracy: number;
  adherence: number;
  outcome: { score: number; status: string };
}

interface FivePillarsDashboardProps {
  pillars: PillarData;
}

const PillarRing = ({ 
  value, 
  label, 
  icon: Icon, 
  color,
  isNA = false 
}: { 
  value: number | null; 
  label: string; 
  icon: React.ElementType; 
  color: string;
  isNA?: boolean;
}) => {
  const displayValue = isNA || value === null ? 'N/A' : `${Math.round(value)}%`;
  const percentage = isNA || value === null ? 0 : value;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = (val: number | null) => {
    if (val === null) return 'text-muted-foreground';
    if (val >= 80) return 'text-green-500';
    if (val >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={`w-6 h-6 ${getStatusColor(value)}`} />
        </div>
      </div>
      <span className={`mt-2 text-xl font-bold ${getStatusColor(value)}`}>
        {displayValue}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
};

export function FivePillarsDashboard({ pillars }: FivePillarsDashboardProps) {
  const pillarConfigs = [
    { key: 'reliability', label: 'Reliability', icon: Shield, color: '#22c55e' },
    { key: 'latency', label: 'Latency', icon: Zap, color: '#eab308', isNA: true },
    { key: 'accuracy', label: 'Accuracy', icon: Target, color: '#3b82f6' },
    { key: 'adherence', label: 'Adherence', icon: ClipboardCheck, color: '#8b5cf6' },
    { key: 'outcome', label: 'Outcome', icon: CheckCircle, color: '#06b6d4' },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          5-Pillar Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-8">
          {pillarConfigs.map((config) => {
            const value = config.key === 'outcome' 
              ? pillars.outcome?.score 
              : pillars[config.key as keyof PillarData] as number | null;
            
            return (
              <PillarRing
                key={config.key}
                value={value}
                label={config.label}
                icon={config.icon}
                color={config.color}
                isNA={config.isNA}
              />
            );
          })}
        </div>
        
        {pillars.outcome && (
          <div className="mt-4 text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              pillars.outcome.status === 'success' ? 'bg-green-500/20 text-green-400' :
              pillars.outcome.status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              Outcome: {pillars.outcome.status.charAt(0).toUpperCase() + pillars.outcome.status.slice(1)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
