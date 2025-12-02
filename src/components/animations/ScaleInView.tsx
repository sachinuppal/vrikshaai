import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface ScaleInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initialScale?: number;
}

export const ScaleInView = ({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  initialScale = 0.9,
}: ScaleInViewProps) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale: initialScale,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
};
