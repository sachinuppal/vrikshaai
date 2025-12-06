import React from 'react';
import { motion } from 'framer-motion';

interface SelectionBoxProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  startX,
  startY,
  endX,
  endY
}) => {
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width < 5 && height < 5) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute pointer-events-none z-50"
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        border: '1px dashed hsl(var(--primary))',
        borderRadius: '4px'
      }}
    />
  );
};
