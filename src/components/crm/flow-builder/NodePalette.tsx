import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { NODE_TYPES, NODE_CATEGORIES } from './nodeTypes';
import { cn } from '@/lib/utils';

interface NodePaletteProps {
  className?: string;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ className }) => {
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

  return (
    <div className={cn("w-[240px] bg-card border-r overflow-hidden flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm">Node Palette</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag nodes to canvas
        </p>
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
    </div>
  );
};
