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
        className="absolute top-1/2 h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary/50 -translate-y-1/2 hidden lg:block"
        animate={{ left: ["7%", "93%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
      />

      {/* Architecture Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
        {architectureLayers.map((layer, index) => (
          <motion.div
            key={layer.title}
            className={`flex flex-col items-center text-center group ${
              // Center the last item when odd number on mobile
              index === architectureLayers.length - 1 ? 'col-span-2 sm:col-span-1' : ''
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <motion.div
              className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg mb-3 cursor-pointer transition-transform duration-200 hover:scale-110 hover:rotate-3`}
            >
              <layer.icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            
            <h4 className="font-semibold text-foreground text-xs sm:text-sm md:text-base mb-1">
              {layer.title}
            </h4>
            
            <p className="text-xs text-muted-foreground opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 max-w-[100px] sm:max-w-[120px]">
              {layer.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Flow Direction Indicator */}
      <div className="flex justify-center mt-8">
        <motion.div
          className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm"
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