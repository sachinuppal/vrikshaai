import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FlowNodeData } from './FlowNode';
import { FlowEdgeData } from './AgenticFlowCanvas';
import { NODE_TYPES } from './nodeTypes';
import { cn } from '@/lib/utils';

interface FlowTestingPanelProps {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
  isOpen: boolean;
  onClose: () => void;
  onHighlightNode: (nodeId: string | null) => void;
}

interface ExecutionStep {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  message?: string;
}

export const FlowTestingPanel: React.FC<FlowTestingPanelProps> = ({
  nodes,
  edges,
  isOpen,
  onClose,
  onHighlightNode
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [executionSpeed, setExecutionSpeed] = useState(1500); // ms per step

  // Build execution order from flow
  const buildExecutionOrder = (): string[] => {
    // Find trigger nodes (entry points)
    const triggerNodes = nodes.filter(n => NODE_TYPES[n.node_type]?.category === 'trigger');
    if (triggerNodes.length === 0 && nodes.length > 0) {
      // If no trigger, start from first node
      return nodes.map(n => n.id);
    }

    const visited = new Set<string>();
    const order: string[] = [];

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      order.push(nodeId);

      // Find outgoing edges
      const outgoingEdges = edges.filter(e => e.source_node_id === nodeId);
      for (const edge of outgoingEdges) {
        traverse(edge.target_node_id);
      }
    };

    for (const trigger of triggerNodes) {
      traverse(trigger.id);
    }

    // Add any unvisited nodes
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        order.push(node.id);
      }
    }

    return order;
  };

  const startTest = () => {
    const order = buildExecutionOrder();
    const steps: ExecutionStep[] = order.map(nodeId => ({
      nodeId,
      status: 'pending'
    }));
    
    setExecutionSteps(steps);
    setCurrentStepIndex(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTest = () => {
    setIsPaused(true);
  };

  const resumeTest = () => {
    setIsPaused(false);
  };

  const resetTest = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setExecutionSteps([]);
    onHighlightNode(null);
  };

  // Execute steps
  useEffect(() => {
    if (!isRunning || isPaused || currentStepIndex < 0) return;
    if (currentStepIndex >= executionSteps.length) {
      setIsRunning(false);
      onHighlightNode(null);
      return;
    }

    const step = executionSteps[currentStepIndex];
    
    // Highlight current node
    onHighlightNode(step.nodeId);
    
    // Update step status to running
    setExecutionSteps(prev => prev.map((s, i) => 
      i === currentStepIndex ? { ...s, status: 'running', startTime: new Date() } : s
    ));

    // Simulate execution time
    const timer = setTimeout(() => {
      // Complete current step
      setExecutionSteps(prev => prev.map((s, i) => 
        i === currentStepIndex ? { ...s, status: 'completed', endTime: new Date() } : s
      ));
      
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    }, executionSpeed);

    return () => clearTimeout(timer);
  }, [isRunning, isPaused, currentStepIndex, executionSteps.length, executionSpeed, onHighlightNode]);

  const progress = executionSteps.length > 0 
    ? (executionSteps.filter(s => s.status === 'completed').length / executionSteps.length) * 100
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="absolute top-0 right-0 w-[320px] h-full bg-card border-l shadow-xl z-20 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Flow Testing</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={startTest} disabled={nodes.length === 0} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Start Test
              </Button>
            ) : isPaused ? (
              <Button onClick={resumeTest} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button onClick={pauseTest} variant="secondary" className="flex-1">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={resetTest}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Speed</span>
              <span className="font-medium">
                {executionSpeed === 500 ? 'Fast' : executionSpeed === 1500 ? 'Normal' : 'Slow'}
              </span>
            </div>
            <div className="flex gap-2">
              {[500, 1500, 3000].map(speed => (
                <Button
                  key={speed}
                  variant={executionSpeed === speed ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setExecutionSpeed(speed)}
                >
                  {speed === 500 ? 'Fast' : speed === 1500 ? 'Normal' : 'Slow'}
                </Button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {executionSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Execution Log */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-sm font-medium mb-3">Execution Log</h4>
          
          {executionSteps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Click "Start Test" to simulate flow execution
            </div>
          ) : (
            <div className="space-y-2">
              {executionSteps.map((step, index) => {
                const node = nodes.find(n => n.id === step.nodeId);
                const nodeType = node ? NODE_TYPES[node.node_type] : null;
                const Icon = nodeType?.icon || Zap;
                
                return (
                  <motion.div
                    key={step.nodeId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg border transition-all",
                      step.status === 'running' && "bg-primary/10 border-primary animate-pulse",
                      step.status === 'completed' && "bg-green-500/10 border-green-500/30",
                      step.status === 'pending' && "bg-muted/30 border-border"
                    )}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: nodeType?.bgColor || 'hsl(var(--muted))' }}
                    >
                      <Icon 
                        className="w-4 h-4" 
                        style={{ color: nodeType?.color || 'hsl(var(--muted-foreground))' }} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{node?.label || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{step.status}</p>
                    </div>
                    {step.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    {step.status === 'running' && (
                      <Clock className="w-4 h-4 text-primary flex-shrink-0 animate-spin" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            🧪 This is a simulation. No real actions are executed.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
