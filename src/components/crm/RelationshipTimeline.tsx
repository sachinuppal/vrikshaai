import { motion } from "framer-motion";
import { 
  Shield, 
  Phone, 
  MessageSquare, 
  Mail, 
  Banknote, 
  Paintbrush, 
  Home,
  Brain,
  TrendingUp
} from "lucide-react";

const timelineEvents = [
  {
    icon: Shield,
    title: "Consent Captured",
    description: "Web form consent logged with timestamp",
    timestamp: "Day 1, 10:23 AM",
    aiDecision: "Compliance: Verified",
    side: "left" as const,
  },
  {
    icon: Phone,
    title: "AI Voice Call",
    description: "3BHK interest qualified, budget ₹1.5Cr, timeline 60 days",
    timestamp: "Day 1, 10:45 AM",
    aiDecision: "High Intent Score: 85",
    side: "right" as const,
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Follow-up",
    description: "Property brochure sent, site visit scheduled",
    timestamp: "Day 2, 9:00 AM",
    aiDecision: "Next: Site Visit Reminder",
    side: "left" as const,
  },
  {
    icon: Mail,
    title: "Email Proposal",
    description: "Customized property comparison with pricing",
    timestamp: "Day 3, 2:30 PM",
    aiDecision: "Opened: 3 times",
    side: "right" as const,
  },
  {
    icon: Banknote,
    title: "Loan Partner Triggered",
    description: "Home loan pre-qualification initiated",
    timestamp: "Day 5, 11:00 AM",
    aiDecision: "Partner: HDFC Bank",
    side: "left" as const,
  },
  {
    icon: Paintbrush,
    title: "Interior Lead Generated",
    description: "Interior designer referral activated",
    timestamp: "Day 8, 3:15 PM",
    aiDecision: "Cross-sell: Active",
    side: "right" as const,
  },
  {
    icon: Home,
    title: "Deal Closed",
    description: "Property booked, documentation in progress",
    timestamp: "Day 45",
    aiDecision: "Revenue: ₹1.5Cr",
    side: "left" as const,
  },
  {
    icon: TrendingUp,
    title: "Lifecycle Continues",
    description: "AMC, renovation, smart home opportunities tracked",
    timestamp: "Ongoing",
    aiDecision: "LTV Expansion: Active",
    side: "right" as const,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export const RelationshipTimeline = () => {
  return (
    <div className="relative py-8">
      {/* Central Spine */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block">
        <motion.div
          className="w-full bg-gradient-to-b from-primary via-secondary to-primary"
          initial={{ height: 0 }}
          whileInView={{ height: "100%" }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      {/* Mobile Spine (left aligned) */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 md:hidden">
        <motion.div
          className="w-full bg-gradient-to-b from-primary via-secondary to-primary"
          initial={{ height: 0 }}
          whileInView={{ height: "100%" }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      {/* Timeline Events */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="relative"
      >
        {timelineEvents.map((event, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={`flex items-center gap-4 mb-8 last:mb-0 ${
              event.side === "left" 
                ? "md:flex-row md:justify-end md:pr-[52%]" 
                : "md:flex-row-reverse md:justify-end md:pl-[52%]"
            }`}
          >
            {/* Event Card */}
            <motion.div
              className={`flex-1 ml-14 md:ml-0 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors ${
                event.side === "left" ? "md:text-right" : "md:text-left"
              }`}
              whileHover={{ 
                y: -4, 
                boxShadow: "0 8px 30px hsl(var(--primary) / 0.15)" 
              }}
              transition={{ duration: 0.2 }}
            >
              <div className={`flex items-center gap-2 mb-2 ${
                event.side === "left" ? "md:justify-end" : "md:justify-start"
              }`}>
                <span className="text-xs text-muted-foreground">{event.timestamp}</span>
              </div>
              <h4 className="font-semibold text-foreground mb-1">{event.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
              
              {/* AI Decision Badge */}
              <motion.div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium ${
                  event.side === "left" ? "md:ml-auto" : ""
                }`}
                animate={{
                  boxShadow: [
                    "0 0 0 0 hsl(var(--primary) / 0)",
                    "0 0 8px 2px hsl(var(--primary) / 0.2)",
                    "0 0 0 0 hsl(var(--primary) / 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-3 h-3" />
                {event.aiDecision}
              </motion.div>
            </motion.div>

            {/* Center Node (Desktop) */}
            <motion.div
              className="absolute left-6 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10"
              whileHover={{ scale: 1.2 }}
              animate={{
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0.3)",
                  "0 0 15px 5px hsl(var(--primary) / 0.15)",
                  "0 0 0 0 hsl(var(--primary) / 0.3)",
                ],
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity, delay: index * 0.1 }
              }}
            >
              <event.icon className="w-5 h-5 text-primary" />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default RelationshipTimeline;
