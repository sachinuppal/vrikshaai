import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface BentoCard3DProps {
  children: ReactNode;
  className?: string;
}

export const BentoCard3D = ({ children, className = "" }: BentoCard3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const springConfig = { stiffness: 300, damping: 30 };
  
  const rotateX = useSpring(
    useTransform(mouseY, [0, 1], [12, -12]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [0, 1], [-12, 12]),
    springConfig
  );
  
  const glowX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig);
  const glowY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative h-full w-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ z: 30 }}
        transition={{ duration: 0.2 }}
      >
        {/* Spotlight glow effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, hsl(var(--primary) / 0.15) 0%, transparent 60%)`
            ),
          }}
        />
        
        {/* Shine effect on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, hsl(var(--primary) / 0.08) 0%, transparent 40%)`
            ),
          }}
        />
        
        {children}
      </motion.div>
    </motion.div>
  );
};
