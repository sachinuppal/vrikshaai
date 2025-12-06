import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, ChevronLeft, GripVertical, PanelLeftClose, PanelLeft } from 'lucide-react';
import { NODE_TYPES, NODE_CATEGORIES } from './nodeTypes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NodePaletteProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ 
  className,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    trigger: true,
    router: true,
    channel: false,
    ai: false,
    utility: false,
    end: false
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('newNodeType', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Group nodes by category
  const nodesByCategory = Object.entries(NODE_TYPES).reduce((acc, [type, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ type, ...config });
    return acc;
  }, {} as Record<string, Array<{ type: string; label: string; icon: React.ComponentType<any>; color: string; bgColor: string; category: string }>>);

  // Collapsed state - show only category icons
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <motion.div 
          initial={{ width: 240 }}
          animate={{ width: 48 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn("bg-card border-r flex flex-col items-center py-3", className)}
        >
          {/* Expand button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleCollapse}
                className="h-8 w-8 mb-3"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expand palette (⌘B)</p>
            </TooltipContent>
          </Tooltip>

          {/* Category icons */}
          <div className="flex-1 flex flex-col gap-2">
            {Object.entries(NODE_CATEGORIES).map(([categoryKey, categoryInfo]) => {
              const nodes = nodesByCategory[categoryKey] || [];
              if (nodes.length === 0) return null;

              // Get the first node's icon for the category
              const CategoryIcon = nodes[0].icon;

              return (
                <Tooltip key={categoryKey}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        onToggleCollapse?.();
                        setExpandedCategories(prev => ({ ...prev, [categoryKey]: true }));
                      }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
                      style={{ backgroundColor: `${nodes[0].bgColor}20` }}
                    >
                      <CategoryIcon className="w-4 h-4" style={{ color: nodes[0].color }} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{categoryInfo.label} ({nodes.length})</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </motion.div>
      </TooltipProvider>
    );
  }

  return (
    <motion.div 
      initial={{ width: 48 }}
      animate={{ width: 240 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn("bg-card border-r overflow-hidden flex flex-col", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div>
          <h3 className="font-semibold text-sm">Node Palette</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag nodes to canvas
          </p>
        </div>
        {onToggleCollapse && (
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8">
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(NODE_CATEGORIES).map(([categoryKey, categoryInfo]) => {
          const nodes = nodesByCategory[categoryKey] || [];
          if (nodes.length === 0) return null;

          const isExpanded = expandedCategories[categoryKey];

          return (
            <div key={categoryKey} className="border-b last:border-b-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{categoryInfo.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{nodes.length}</span>
              </button>

              {/* Category Nodes */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-2 space-y-1">
                      {nodes.map((node) => {
                        const Icon = node.icon;
                        return (
                          <div
                            key={node.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, node.type)}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 cursor-grab active:cursor-grabbing transition-colors group"
                          >
                            <GripVertical className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground" />
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: node.bgColor }}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                            </div>
                            <span className="text-xs font-medium truncate">
                              {node.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Footer Tip */}
      <div className="p-3 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          💡 Or describe your flow in chat
        </p>
      </div>
    </motion.div>
  );
};
