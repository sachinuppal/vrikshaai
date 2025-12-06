import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FlowNodeData } from './FlowNode';
import { NODE_TYPES } from './nodeTypes';
import { cn } from '@/lib/utils';

interface NodeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: FlowNodeData[];
  onNodeSelect: (nodeId: string) => void;
  onNodeFocus: (nodeId: string) => void;
}

export const NodeSearchModal: React.FC<NodeSearchModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onNodeSelect,
  onNodeFocus
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredNodes = useMemo(() => {
    if (!query.trim()) return nodes;
    
    const lowerQuery = query.toLowerCase();
    return nodes.filter(node => {
      const nodeType = NODE_TYPES[node.node_type];
      return (
        node.label.toLowerCase().includes(lowerQuery) ||
        node.node_type.toLowerCase().includes(lowerQuery) ||
        nodeType?.label.toLowerCase().includes(lowerQuery) ||
        nodeType?.category.toLowerCase().includes(lowerQuery) ||
        JSON.stringify(node.config).toLowerCase().includes(lowerQuery)
      );
    });
  }, [nodes, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredNodes.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredNodes[selectedIndex]) {
          handleSelect(filteredNodes[selectedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelect = (nodeId: string) => {
    onNodeSelect(nodeId);
    onNodeFocus(nodeId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search nodes by name, type, or config..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base"
            />
            <button 
              onClick={onClose}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredNodes.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No nodes found matching "{query}"
              </div>
            ) : (
              <div className="p-2">
                {filteredNodes.map((node, index) => {
                  const nodeType = NODE_TYPES[node.node_type];
                  const Icon = nodeType?.icon;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => handleSelect(node.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        index === selectedIndex 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                    >
                      {Icon && (
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: nodeType.bgColor }}
                        >
                          <Icon className="w-4 h-4" style={{ color: nodeType.color }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {node.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {nodeType?.label} • {nodeType?.category}
                        </p>
                      </div>
                      {index === selectedIndex && (
                        <CornerDownLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-1 py-0.5 rounded bg-muted">Esc</span>
              <span>Close</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
