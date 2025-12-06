import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, GripVertical } from 'lucide-react';
import { NODE_TYPES } from './nodeTypes';
import { cn } from '@/lib/utils';

export interface FlowNodeData {
  id: string;
  node_type: string;
  label: string;
  config: Record<string, any>;
  position_x: number;
  position_y: number;
  description?: string;
}

export type ConnectionPoint = 'input' | 'output' | 'output-left' | 'output-right';

interface FlowNodeProps {
  node: FlowNodeData;
  isSelected: boolean;
  isHighlighted?: boolean;
  onClick: (e?: React.MouseEvent) => void;
  onConnectionStart?: (nodeId: string, point: ConnectionPoint) => void;
  onConnectionEnd?: (nodeId: string, point: ConnectionPoint) => void;
  isConnecting?: boolean;
}

export const FlowNode: React.FC<FlowNodeProps> = ({
  node,
  isSelected,
  isHighlighted = false,
  onClick,
  onConnectionStart,
  onConnectionEnd,
  isConnecting = false
}) => {
  const nodeType = NODE_TYPES[node.node_type];
  
  if (!nodeType) {
    return null;
  }

  const Icon = nodeType.icon;

  const handleConnectionMouseDown = (point: ConnectionPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionStart?.(node.id, point);
  };

  const handleConnectionMouseUp = (point: ConnectionPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectionEnd?.(node.id, point);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e);
  };

  const getNodeDescription = () => {
    if (node.description) return node.description;
    
    const config = node.config || {};
    if (config.template) return config.template.substring(0, 50) + '...';
    if (config.prompt) return config.prompt.substring(0, 50) + '...';
    if (config.endpoint) return `${config.method || 'POST'} ${config.endpoint}`;
    if (config.cron) return `Cron: ${config.cron}`;
    if (config.event_type) return `Event: ${config.event_type}`;
    
    return nodeType.configFields?.[0]?.placeholder || 'Configure this node';
  };

  const connectionPointClasses = cn(
    "absolute transform -translate-x-1/2 rounded-full border-2 transition-all duration-200",
    "hover:scale-150 cursor-crosshair z-10",
    isConnecting && "animate-pulse scale-125"
  );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isHighlighted ? 1.02 : 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        "absolute cursor-pointer select-none group",
        "w-[220px] rounded-xl bg-white shadow-md",
        "transition-all duration-200 border",
        isHighlighted
          ? "border-primary ring-4 ring-primary/30 shadow-xl scale-102"
          : isSelected 
            ? "border-primary/60 ring-2 ring-primary/20 shadow-lg" 
            : "border-slate-200 hover:border-primary/40 hover:shadow-lg"
      )}
      style={{
        left: node.position_x,
        top: node.position_y,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={handleClick}
    >
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform">
          <Pencil className="w-3 h-3" />
        </div>
      </div>

      <div 
        className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm"
        style={{ backgroundColor: nodeType.color }}
      >
        {nodeType.category}
      </div>

      <div className="p-4 pt-5">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: nodeType.bgColor, border: `1px solid ${nodeType.color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: nodeType.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-slate-800 truncate">{node.label}</h4>
            <p className="text-xs text-slate-500">{nodeType.label}</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[32px]">{getNodeDescription()}</p>

        {node.config && Object.keys(node.config).length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-slate-400">{Object.keys(node.config).length} configured</span>
          </div>
        )}
      </div>

      {nodeType.category !== 'trigger' && (
        <div 
          className={cn(connectionPointClasses, "-top-3 left-1/2 w-5 h-5 bg-white shadow-md")}
          style={{ borderColor: nodeType.color }}
          onMouseDown={(e) => handleConnectionMouseDown('input', e)}
          onMouseUp={(e) => handleConnectionMouseUp('input', e)}
          title="Drop connection here"
        >
          <div className="absolute inset-1 rounded-full" style={{ backgroundColor: nodeType.color }} />
        </div>
      )}

      {nodeType.category !== 'end' && nodeType.category !== 'router' && (
        <div 
          className={cn(connectionPointClasses, "-bottom-3 left-1/2 w-5 h-5 bg-white shadow-md")}
          style={{ borderColor: nodeType.color }}
          onMouseDown={(e) => handleConnectionMouseDown('output', e)}
          onMouseUp={(e) => handleConnectionMouseUp('output', e)}
          title="Drag to connect"
        >
          <div className="absolute inset-1 rounded-full" style={{ backgroundColor: nodeType.color }} />
        </div>
      )}

      {nodeType.category === 'router' && (
        <>
          <div 
            className={cn(connectionPointClasses, "-bottom-3 left-1/4 w-4 h-4 bg-white shadow-md")}
            style={{ borderColor: nodeType.color }}
            onMouseDown={(e) => handleConnectionMouseDown('output-left', e)}
            onMouseUp={(e) => handleConnectionMouseUp('output-left', e)}
            title="Path A"
          >
            <div className="absolute inset-0.5 rounded-full" style={{ backgroundColor: nodeType.color }} />
          </div>
          <div 
            className={cn(connectionPointClasses, "-bottom-3 left-1/2 w-5 h-5 bg-white shadow-md")}
            style={{ borderColor: nodeType.color }}
            onMouseDown={(e) => handleConnectionMouseDown('output', e)}
            onMouseUp={(e) => handleConnectionMouseUp('output', e)}
            title="Default path"
          >
            <div className="absolute inset-1 rounded-full" style={{ backgroundColor: nodeType.color }} />
          </div>
          <div 
            className={cn(connectionPointClasses, "-bottom-3 left-3/4 w-4 h-4 bg-white shadow-md")}
            style={{ borderColor: nodeType.color }}
            onMouseDown={(e) => handleConnectionMouseDown('output-right', e)}
            onMouseUp={(e) => handleConnectionMouseUp('output-right', e)}
            title="Path B"
          >
            <div className="absolute inset-0.5 rounded-full" style={{ backgroundColor: nodeType.color }} />
          </div>
        </>
      )}
    </motion.div>
  );
};
