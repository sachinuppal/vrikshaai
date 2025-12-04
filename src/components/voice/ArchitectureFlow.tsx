import { motion } from 'framer-motion';
import { 
  Mic, 
  Brain, 
  GitBranch, 
  Database, 
  Share2, 
  BarChart3, 
  Shield 
} from 'lucide-react';

const architectureLayers = [
  {
    icon: Mic,
    title: "Speech-to-Text",
    description: "High-accuracy voice recognition with multi-language support",
    color: "from-orange-500 to-amber-400",
  },
  {
    icon: Brain,
    title: "NLU Engine",
    description: "Intent detection, entity extraction, context handling",
    color: "from-purple-500 to-violet-400",
  },
  {
    icon: GitBranch,
    title: "Business Logic",
    description: "Workflow rules, routing, escalation handling",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Database,
    title: "CRM Integration",
    description: "Real-time profile updates, data persistence",
    color: "from-green-500 to-emerald-400",
  },
  {
    icon: Share2,
    title: "Omnichannel",
    description: "Voice, SMS, WhatsApp, Email orchestration",
    color: "from-pink-500 to-rose-400",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Real-time dashboards, metrics, insights",
    color: "from-indigo-500 to-blue-400",
  },
  {
    icon: Shield,
    title: "Compliance",
    description: "Logging, encryption, audit trails",
    color: "from-slate-500 to-gray-400",
  },
];

export const ArchitectureFlow = () => {
  return (
    <div className="relative py-8">
      {/* Connection Line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2 hidden lg:block" />
      
      {/* Animated Pulse on Line */}
      <motion.div
        className="absolute top-1/2 h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50 -translate-y-1/2 hidden lg:block"
        animate={{ x: ["0%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ left: "5%" }}
      />

      {/* Architecture Nodes */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
        {architectureLayers.map((layer, index) => (
          <motion.div
            key={layer.title}
            className="flex flex-col items-center text-center group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <motion.div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg mb-3 cursor-pointer`}
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <layer.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            
            <h4 className="font-semibold text-foreground text-sm md:text-base mb-1">
              {layer.title}
            </h4>
            
            <motion.p
              className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[120px]"
              initial={{ y: 5 }}
              whileHover={{ y: 0 }}
            >
              {layer.description}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Flow Direction Indicator */}
      <div className="flex justify-center mt-8">
        <motion.div
          className="flex items-center gap-2 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <span>Voice Input</span>
          <motion.div
            className="flex items-center gap-1"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span>→</span>
            <span>→</span>
            <span>→</span>
          </motion.div>
          <span>Automated Actions</span>
        </motion.div>
      </div>
    </div>
  );
};
