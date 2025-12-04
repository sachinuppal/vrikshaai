import { motion } from "framer-motion";
import { 
  Home, 
  Banknote, 
  Scale, 
  Paintbrush, 
  Ruler, 
  UtensilsCrossed,
  Wind,
  Droplets,
  Palette,
  Smartphone,
  Truck
} from "lucide-react";
import { useState } from "react";

const satellites = [
  { icon: Banknote, label: "Home Loan", trigger: "Loan Partner Outreach", angle: 0 },
  { icon: Scale, label: "Legal Services", trigger: "Document Verification", angle: 36 },
  { icon: Paintbrush, label: "Interior Designer", trigger: "Design Consultation", angle: 72 },
  { icon: Ruler, label: "Architect", trigger: "Layout Planning", angle: 108 },
  { icon: UtensilsCrossed, label: "Modular Kitchen", trigger: "Kitchen Design Call", angle: 144 },
  { icon: Wind, label: "HVAC", trigger: "AC Installation Quote", angle: 180 },
  { icon: Droplets, label: "Plumbing", trigger: "Plumbing Assessment", angle: 216 },
  { icon: Palette, label: "Painting", trigger: "Color Consultation", angle: 252 },
  { icon: Smartphone, label: "Smart Home", trigger: "Automation Setup", angle: 288 },
  { icon: Truck, label: "Moving Services", trigger: "Relocation Quote", angle: 324 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const satelliteVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

export const IndustryGraph = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const radius = 160; // Distance from center

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* SVG Lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {satellites.map((sat, index) => {
          const angleRad = (sat.angle * Math.PI) / 180;
          const x = 200 + Math.cos(angleRad) * radius;
          const y = 200 + Math.sin(angleRad) * radius;
          
          return (
            <motion.line
              key={index}
              x1="200"
              y1="200"
              x2={x}
              y2={y}
              stroke="url(#lineGradient)"
              strokeWidth={hoveredIndex === index ? 3 : 2}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: 0.3 + index * 0.05,
                ease: "easeOut"
              }}
            />
          );
        })}
      </svg>

      {/* Center Node */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center text-primary-foreground z-20"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        animate={{
          boxShadow: [
            "0 0 0 0 hsl(var(--primary) / 0.4)",
            "0 0 30px 15px hsl(var(--primary) / 0.2)",
            "0 0 0 0 hsl(var(--primary) / 0.4)",
          ],
        }}
      >
        <Home className="w-8 h-8 mb-1" />
        <span className="text-xs font-semibold text-center leading-tight">3BHK Buyer</span>
      </motion.div>

      {/* Satellite Nodes */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="absolute inset-0"
      >
        {satellites.map((sat, index) => {
          const angleRad = (sat.angle * Math.PI) / 180;
          const x = 50 + (Math.cos(angleRad) * radius / 4) * 100 / 200;
          const y = 50 + (Math.sin(angleRad) * radius / 4) * 100 / 200;
          
          return (
            <motion.div
              key={index}
              variants={satelliteVariants}
              className="absolute"
              style={{
                left: `${50 + (Math.cos(angleRad) * 40)}%`,
                top: `${50 + (Math.sin(angleRad) * 40)}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  hoveredIndex === index 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card border-2 border-primary/30 text-foreground"
                }`}
                whileHover={{ 
                  scale: 1.15,
                  boxShadow: "0 0 25px hsl(var(--primary) / 0.4)",
                }}
                transition={{ duration: 0.2 }}
              >
                <sat.icon className="w-5 h-5 md:w-6 md:h-6 mb-0.5" />
                <span className="text-[9px] md:text-[10px] font-medium text-center leading-tight px-1">
                  {sat.label}
                </span>
              </motion.div>

              {/* Tooltip */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 -top-12 px-3 py-2 bg-foreground text-background text-xs rounded-lg whitespace-nowrap z-30"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  y: hoveredIndex === index ? 0 : 10,
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-primary-foreground">AI Trigger:</span> {sat.trigger}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default IndustryGraph;
