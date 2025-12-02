import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.1,
  delayChildren = 0.1,
}: StaggerContainerProps) => {
  const customContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={customContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }: StaggerItemProps) => {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
};
