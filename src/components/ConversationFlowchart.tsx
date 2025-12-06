import { motion } from "framer-motion";
import { 
  User, 
  Building2, 
  Code, 
  Briefcase, 
  HelpCircle,
  ArrowDown,
  CheckCircle,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserType = 'founder' | 'developer' | 'enterprise' | 'investor' | 'general' | 'hybrid';

interface ConversationFlowchartProps {
  detectedUserType?: UserType;
  applicableSections?: string[];
}

const userTypeNodes: Record<UserType, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  founder: { 
    icon: <Briefcase className="h-4 w-4" />, 
    label: "Founder", 
    color: "border-purple-500 text-purple-500",
    bgColor: "bg-purple-500"
  },
  developer: { 
    icon: <Code className="h-4 w-4" />, 
    label: "Developer", 
    color: "border-blue-500 text-blue-500",
    bgColor: "bg-blue-500"
  },
  enterprise: { 
    icon: <Building2 className="h-4 w-4" />, 
    label: "Enterprise", 
    color: "border-emerald-500 text-emerald-500",
    bgColor: "bg-emerald-500"
  },
  investor: { 
    icon: <Briefcase className="h-4 w-4" />, 
    label: "Investor", 
    color: "border-amber-500 text-amber-500",
    bgColor: "bg-amber-500"
  },
  general: { 
    icon: <User className="h-4 w-4" />, 
    label: "General", 
    color: "border-gray-500 text-gray-500",
    bgColor: "bg-gray-500"
  },
  hybrid: { 
    icon: <Code className="h-4 w-4" />, 
    label: "Hybrid", 
    color: "border-indigo-500 text-indigo-500",
    bgColor: "bg-indigo-500"
  },
};

const FlowNode = ({ 
  label, 
  isActive, 
  isSkipped, 
  icon,
  color,
  delay = 0 
}: { 
  label: string; 
  isActive: boolean; 
  isSkipped?: boolean;
  icon?: React.ReactNode;
  color?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    className={cn(
      "relative px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all",
      isActive && !isSkipped && "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20",
      isSkipped && "border-muted bg-muted/30 text-muted-foreground opacity-50",
      !isActive && !isSkipped && "border-border bg-card text-muted-foreground",
      color && isActive && !isSkipped && color
    )}
  >
    <div className="flex items-center gap-1.5">
      {icon}
      <span>{label}</span>
    </div>
    {isActive && !isSkipped && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1"
      >
        <CheckCircle className="h-4 w-4 text-green-500 fill-green-500/20" />
      </motion.div>
    )}
  </motion.div>
);

const FlowArrow = ({ isActive, delay = 0 }: { isActive: boolean; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.2 }}
    className="flex justify-center py-1"
  >
    <ArrowDown className={cn(
      "h-4 w-4 transition-colors",
      isActive ? "text-primary" : "text-muted-foreground/30"
    )} />
  </motion.div>
);

const BranchConnector = ({ 
  activeIndex, 
  totalBranches,
  delay = 0 
}: { 
  activeIndex: number; 
  totalBranches: number;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="relative flex justify-center py-2"
  >
    <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-muted-foreground/30" />
    <div className="absolute top-2 left-[10%] right-[10%] h-0.5 bg-muted-foreground/30" />
    <div className="absolute top-2 flex justify-between w-[80%]">
      {Array.from({ length: totalBranches }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "w-0.5 h-4",
            i === activeIndex ? "bg-primary" : "bg-muted-foreground/30"
          )} 
        />
      ))}
    </div>
  </motion.div>
);

export const ConversationFlowchart = ({ 
  detectedUserType, 
  applicableSections = [] 
}: ConversationFlowchartProps) => {
  const userTypes: UserType[] = ['founder', 'developer', 'enterprise', 'investor', 'general'];
  const activeIndex = detectedUserType ? userTypes.indexOf(detectedUserType === 'hybrid' ? 'founder' : detectedUserType) : -1;
  
  const isActive = (section: string) => 
    applicableSections.some(s => s.toLowerCase().includes(section.toLowerCase()));

  return (
    <div className="relative p-4 bg-muted/30 rounded-xl border border-border overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="flow-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#flow-grid)" />
        </svg>
      </div>

      <div className="relative space-y-1">
        {/* Start node */}
        <div className="flex justify-center">
          <FlowNode 
            label="Call Started" 
            isActive={true} 
            icon={<Circle className="h-3 w-3 fill-current" />}
            delay={0}
          />
        </div>
        
        <FlowArrow isActive={true} delay={0.1} />
        
        {/* Introduction */}
        <div className="flex justify-center">
          <FlowNode 
            label="Introduction & Objective" 
            isActive={isActive('introduction')} 
            delay={0.15}
          />
        </div>
        
        <FlowArrow isActive={isActive('introduction')} delay={0.2} />
        
        {/* Entry Classification */}
        <div className="flex justify-center">
          <FlowNode 
            label="Entry Classification" 
            isActive={isActive('entry') || isActive('classification')} 
            delay={0.25}
          />
        </div>
        
        <FlowArrow isActive={true} delay={0.3} />
        
        {/* Identity Capture */}
        <div className="flex justify-center">
          <FlowNode 
            label="Universal Identity Capture" 
            isActive={isActive('identity') || isActive('universal')} 
            delay={0.35}
          />
        </div>

        {/* Branch connector */}
        <BranchConnector 
          activeIndex={activeIndex} 
          totalBranches={5} 
          delay={0.4}
        />

        {/* User type branches */}
        <div className="flex justify-between gap-1 px-2 mt-4">
          {userTypes.map((type, i) => {
            const node = userTypeNodes[type];
            const isTypeActive = detectedUserType === type || (detectedUserType === 'hybrid' && (type === 'founder' || type === 'developer'));
            return (
              <FlowNode
                key={type}
                label={node.label}
                isActive={isTypeActive}
                isSkipped={!isTypeActive && detectedUserType !== undefined}
                icon={node.icon}
                color={isTypeActive ? node.color : undefined}
                delay={0.45 + i * 0.05}
              />
            );
          })}
        </div>

        {/* Converge lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="relative flex justify-center py-2"
        >
          <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-muted-foreground/30" />
          <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-primary" />
        </motion.div>

        {/* Final Steps */}
        <div className="flex justify-center mt-2">
          <FlowNode 
            label="Final Steps (Demo/Follow-up)" 
            isActive={isActive('final')} 
            delay={0.75}
          />
        </div>
        
        <FlowArrow isActive={isActive('final') || isActive('closing')} delay={0.8} />
        
        {/* Closing */}
        <div className="flex justify-center">
          <FlowNode 
            label="Closing Line" 
            isActive={isActive('closing')} 
            delay={0.85}
          />
        </div>
        
        <FlowArrow isActive={isActive('closing')} delay={0.9} />
        
        {/* End node */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.95, duration: 0.3 }}
            className={cn(
              "px-3 py-2 rounded-lg border-2 text-xs font-medium",
              isActive('closing') 
                ? "border-green-500 bg-green-500/10 text-green-500" 
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3" />
              <span>Call Ended</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.3 }}
        className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3 text-xs"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-primary bg-primary/10" />
          <span className="text-muted-foreground">Active Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-muted bg-muted/30 opacity-50" />
          <span className="text-muted-foreground">Skipped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-muted-foreground">Covered</span>
        </div>
      </motion.div>
    </div>
  );
};
