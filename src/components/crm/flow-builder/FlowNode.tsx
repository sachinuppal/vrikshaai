import React from 'react';
import { motion } from 'framer-motion';
import { NODE_TYPES } from './nodeTypes';
import { cn } from '@/lib/utils';

export interface FlowNodeData {
  id: string;
  node_type: string;
  label: string;
  config: Record<string, any>;
  position_x: number;
  position_y: number;
}

interface FlowNodeProps {
  node: FlowNodeData;
  isSelected: boolean;
  onClick: () => void;
}

export const FlowNode: React.FC<FlowNodeProps> = ({
  node,
  isSelected,
  onClick
}) => {
  const nodeType = NODE_TYPES[node.node_type];
  
  if (!nodeType) {
    return null;
  }

  const Icon = nodeType.icon;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "absolute cursor-pointer select-none",
        "min-w-[160px] rounded-xl border-2 bg-card shadow-lg",
        "transition-all duration-200",
        isSelected 
          ? "border-primary ring-2 ring-primary/30 shadow-xl" 
          : "border-border hover:border-primary/50 hover:shadow-xl"
      )}
      style={{
        left: node.position_x,
        top: node.position_y,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
    >
      {/* Node Header */}
      <div 
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{ backgroundColor: nodeType.bgColor }}
      >
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: nodeType.color }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {nodeType.label}
        </span>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-foreground truncate">
          {node.label}
        </p>
        {node.config && Object.keys(node.config).length > 0 && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {Object.keys(node.config).length} settings
          </p>
        )}
      </div>

      {/* Connection Points */}
      {nodeType.category !== 'trigger' && (
        <div 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-border bg-background"
          style={{ borderColor: nodeType.color }}
        />
      )}
      {nodeType.category !== 'end' && (
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-border bg-background"
          style={{ borderColor: nodeType.color }}
        />
      )}

      {/* Multiple outputs for routers */}
      {nodeType.category === 'router' && (
        <>
          <div 
            className="absolute -bottom-2 left-1/4 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 bg-background"
            style={{ borderColor: nodeType.color }}
          />
          <div 
            className="absolute -bottom-2 left-3/4 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 bg-background"
            style={{ borderColor: nodeType.color }}
          />
        </>
      )}
    </motion.div>
  );
};
