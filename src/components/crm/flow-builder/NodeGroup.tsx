import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Ungroup } from 'lucide-react';
import { FlowNodeData } from './FlowNode';
import { cn } from '@/lib/utils';

export interface GroupData {
  id: string;
  name: string;
  nodeIds: string[];
  color: string;
  collapsed: boolean;
}

interface NodeGroupProps {
  group: GroupData;
  nodes: FlowNodeData[];
  isSelected: boolean;
  onSelect: () => void;
  onToggleCollapse: () => void;
  onUngroup: () => void;
  onRename: (name: string) => void;
}

export const NodeGroup: React.FC<NodeGroupProps> = ({
  group,
  nodes,
  isSelected,
  onSelect,
  onToggleCollapse,
  onUngroup
}) => {
  // Calculate bounds of all nodes in group
  const groupNodes = nodes.filter(n => group.nodeIds.includes(n.id));
  
  if (groupNodes.length === 0) return null;

  const padding = 20;
  const headerHeight = 32;
  
  const minX = Math.min(...groupNodes.map(n => n.position_x - 110)) - padding;
  const minY = Math.min(...groupNodes.map(n => n.position_y - 60)) - padding - headerHeight;
  const maxX = Math.max(...groupNodes.map(n => n.position_x + 110)) + padding;
  const maxY = Math.max(...groupNodes.map(n => n.position_y + 60)) + padding;

  const width = maxX - minX;
  const height = group.collapsed ? headerHeight : maxY - minY;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "absolute rounded-xl border-2 border-dashed transition-all cursor-pointer",
        isSelected ? "ring-2 ring-primary/50" : ""
      )}
      style={{
        left: minX,
        top: minY,
        width,
        height,
        borderColor: group.color,
        backgroundColor: `${group.color}08`,
        zIndex: 0
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Group Header */}
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg"
        style={{ backgroundColor: `${group.color}20` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="p-0.5 rounded hover:bg-white/50 transition-colors"
        >
          {group.collapsed ? (
            <ChevronRight className="w-4 h-4" style={{ color: group.color }} />
          ) : (
            <ChevronDown className="w-4 h-4" style={{ color: group.color }} />
          )}
        </button>
        <span 
          className="text-xs font-semibold flex-1"
          style={{ color: group.color }}
        >
          {group.name}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/50" style={{ color: group.color }}>
          {groupNodes.length} nodes
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUngroup();
          }}
          className="p-1 rounded hover:bg-white/50 transition-colors opacity-0 group-hover:opacity-100"
          title="Ungroup"
        >
          <Ungroup className="w-3 h-3" style={{ color: group.color }} />
        </button>
      </div>
    </motion.div>
  );
};

// Group colors palette
export const GROUP_COLORS = [
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f97316', // Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#eab308', // Yellow
  '#ef4444', // Red
];
