import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContactScoreRingProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  colorClass?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean; // For churn risk where lower is better
}

export function ContactScoreRing({
  value,
  label,
  icon,
  colorClass = "text-primary",
  size = "md",
  inverted = false,
}: ContactScoreRingProps) {
  const displayValue = Math.round(value || 0);
  const effectiveValue = inverted ? 100 - displayValue : displayValue;
  
  const getColor = () => {
    if (inverted) {
      if (displayValue <= 30) return "stroke-emerald-500";
      if (displayValue <= 60) return "stroke-amber-500";
      return "stroke-red-500";
    }
    if (displayValue >= 70) return "stroke-emerald-500";
    if (displayValue >= 40) return "stroke-amber-500";
    return "stroke-red-500";
  };

  const sizes = {
    sm: { ring: 48, stroke: 4, text: "text-sm", labelText: "text-[10px]" },
    md: { ring: 64, stroke: 5, text: "text-lg", labelText: "text-xs" },
    lg: { ring: 80, stroke: 6, text: "text-xl", labelText: "text-xs" },
  };

  const { ring, stroke, text, labelText } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: ring, height: ring }}>
        {/* Background Ring */}
        <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${ring} ${ring}`}>
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/30"
          />
          <motion.circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            className={cn(getColor())}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", text, colorClass)}>{displayValue}%</span>
        </div>
      </div>
      
      {/* Label */}
      <div className={cn("flex items-center gap-1 text-muted-foreground", labelText)}>
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
}
