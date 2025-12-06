import { useEffect, useState } from "react";
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
  Truck,
  Building,
  ShoppingCart,
  Car,
  GraduationCap,
  Heart,
  Plane,
  LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface IndustryNode {
  id: string;
  name: string;
  display_name: string;
  icon: string | null;
  description: string | null;
}

interface AlliedIndustry {
  id: string;
  allied_industry_id: string;
  relationship_type: string | null;
  relationship_strength: number;
  trigger_stage: string | null;
  allied_node: IndustryNode | null;
}

interface DynamicIndustryGraphProps {
  primaryIndustry?: string;
  contactId?: string;
}

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  banknote: Banknote,
  scale: Scale,
  paintbrush: Paintbrush,
  ruler: Ruler,
  utensils: UtensilsCrossed,
  wind: Wind,
  droplets: Droplets,
  palette: Palette,
  smartphone: Smartphone,
  truck: Truck,
  building: Building,
  cart: ShoppingCart,
  car: Car,
  education: GraduationCap,
  heart: Heart,
  plane: Plane,
};

const defaultSatellites = [
  { icon: Banknote, label: "Home Loan", trigger: "Loan Partner Outreach" },
  { icon: Scale, label: "Legal Services", trigger: "Document Verification" },
  { icon: Paintbrush, label: "Interior Designer", trigger: "Design Consultation" },
  { icon: Ruler, label: "Architect", trigger: "Layout Planning" },
  { icon: UtensilsCrossed, label: "Modular Kitchen", trigger: "Kitchen Design Call" },
  { icon: Wind, label: "HVAC", trigger: "AC Installation Quote" },
  { icon: Droplets, label: "Plumbing", trigger: "Plumbing Assessment" },
  { icon: Palette, label: "Painting", trigger: "Color Consultation" },
  { icon: Smartphone, label: "Smart Home", trigger: "Automation Setup" },
  { icon: Truck, label: "Moving Services", trigger: "Relocation Quote" },
];

export function DynamicIndustryGraph({ primaryIndustry, contactId }: DynamicIndustryGraphProps) {
  const [loading, setLoading] = useState(true);
  const [industryNode, setIndustryNode] = useState<IndustryNode | null>(null);
  const [alliedIndustries, setAlliedIndustries] = useState<AlliedIndustry[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (primaryIndustry) {
      fetchIndustryData();
    } else {
      setLoading(false);
    }
  }, [primaryIndustry]);

  const fetchIndustryData = async () => {
    try {
      // Find the industry node
      const { data: node } = await supabase
        .from("crm_industry_nodes")
        .select("*")
        .or(`name.eq.${primaryIndustry},display_name.ilike.%${primaryIndustry}%`)
        .limit(1)
        .maybeSingle();

      if (node) {
        setIndustryNode(node);

        // Fetch allied industries
        const { data: allied } = await supabase
          .from("crm_allied_industries")
          .select(`
            id,
            allied_industry_id,
            relationship_type,
            relationship_strength,
            trigger_stage,
            crm_industry_nodes!crm_allied_industries_allied_industry_id_fkey (
              id, name, display_name, icon, description
            )
          `)
          .eq("primary_industry_id", node.id)
          .eq("is_active", true)
          .order("relationship_strength", { ascending: false });

        if (allied) {
          setAlliedIndustries(
            allied.map((a: any) => ({
              ...a,
              allied_node: a.crm_industry_nodes,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching industry data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string | null): LucideIcon => {
    if (iconName && iconMap[iconName.toLowerCase()]) {
      return iconMap[iconName.toLowerCase()];
    }
    return Building;
  };

  // Use fetched data or fallback to defaults
  const satellites = alliedIndustries.length > 0
    ? alliedIndustries.map((allied, idx) => ({
        icon: getIcon(allied.allied_node?.icon || null),
        label: allied.allied_node?.display_name || "Partner",
        trigger: allied.relationship_type || "Partnership",
        angle: (360 / alliedIndustries.length) * idx,
        strength: allied.relationship_strength,
      }))
    : defaultSatellites.map((sat, idx) => ({
        ...sat,
        angle: (360 / defaultSatellites.length) * idx,
        strength: 0.5,
      }));

  const radius = 140;

  if (loading) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
        <Skeleton className="w-24 h-24 rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      {/* SVG Lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="lineGradientDynamic" x1="0%" y1="0%" x2="100%" y2="100%">
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
              stroke="url(#lineGradientDynamic)"
              strokeWidth={hoveredIndex === index ? 3 : 2}
              strokeOpacity={sat.strength || 0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.3 + index * 0.05,
                ease: "easeOut",
              }}
            />
          );
        })}
      </svg>

      {/* Center Node */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex flex-col items-center justify-center text-primary-foreground z-20 shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <Home className="w-7 h-7 mb-1" />
        <span className="text-xs font-semibold text-center leading-tight px-2">
          {industryNode?.display_name || primaryIndustry || "Real Estate"}
        </span>
      </motion.div>

      {/* Satellite Nodes */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.5 },
          },
        }}
        className="absolute inset-0"
      >
        {satellites.map((sat, index) => {
          const angleRad = (sat.angle * Math.PI) / 180;
          const SatIcon = sat.icon;

          return (
            <motion.div
              key={index}
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: {
                  scale: 1,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 200, damping: 20 },
                },
              }}
              className="absolute"
              style={{
                left: `${50 + Math.cos(angleRad) * 35}%`,
                top: `${50 + Math.sin(angleRad) * 35}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  hoveredIndex === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2 border-primary/30 text-foreground"
                }`}
                whileHover={{
                  scale: 1.15,
                  boxShadow: "0 0 20px hsl(var(--primary) / 0.4)",
                }}
                transition={{ duration: 0.2 }}
              >
                <SatIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[8px] md:text-[9px] font-medium text-center leading-tight px-1">
                  {sat.label}
                </span>
              </motion.div>

              {/* Tooltip */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 -top-10 px-2 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap z-30 pointer-events-none"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  y: hoveredIndex === index ? 0 : 10,
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-medium">{sat.trigger}</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default DynamicIndustryGraph;
