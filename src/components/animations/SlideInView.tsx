import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface SlideInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "left" | "right" | "up" | "down";
  distance?: number;
}

export const SlideInView = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "left",
  distance = 50,
}: SlideInViewProps) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "left":
        return { x: -distance, y: 0 };
      case "right":
        return { x: distance, y: 0 };
      case "up":
        return { x: 0, y: distance };
      case "down":
        return { x: 0, y: -distance };
    }
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
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
