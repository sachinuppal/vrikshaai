import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, Undo2, Redo2, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowNode, FlowNodeData, ConnectionPoint } from './FlowNode';
import { Minimap } from './Minimap';
import { NODE_TYPES } from './nodeTypes';

export interface FlowEdgeData {
  id: string;
  source_node_id: string;
  target_node_id: string;
  source_point?: ConnectionPoint;
  label?: string;
  condition?: Record<string, any>;
}

interface ConnectionState {
  sourceNodeId: string;
  sourcePoint: ConnectionPoint;
  currentX: number;
  currentY: number;
}

interface HistoryState {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
}

interface AgenticFlowCanvasProps {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
  selectedNodeId: string | null;
  highlightedNodeId?: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeAdd?: (nodeType: string, x: number, y: number) => void;
  onEdgeAdd?: (sourceNodeId: string, targetNodeId: string, sourcePoint: ConnectionPoint) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const AgenticFlowCanvas: React.FC<AgenticFlowCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  highlightedNodeId,
  onNodeSelect,
  onNodeMove,
  onNodeAdd,
  onEdgeAdd,
  onEdgeDelete,
  onEdgeClick,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        onRedo?.();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEdgeId) {
          onEdgeDelete?.(selectedEdgeId);
          setSelectedEdgeId(null);
        }
      }
      if (e.key === 'Escape') {
        setConnectionState(null);
        setSelectedEdgeId(null);
        onNodeSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, onEdgeDelete, onNodeSelect, onUndo, onRedo]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.min(Math.max(z + delta, 0.25), 2));
    } else {
      // Pan with scroll
      setPan(p => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY
      }));
    }
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 50, y: 50 });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (connectionState) return;
    
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setIsPanning(true);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      onNodeSelect(null);
      setSelectedEdgeId(null);
    }
  }, [onNodeSelect, connectionState]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectionState && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setConnectionState(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
      return;
    }
    
    if (isPanning) {
      const dx = e.clientX - lastPanPosition.current.x;
      const dy = e.clientY - lastPanPosition.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
    }
  }, [isPanning, connectionState, pan, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (connectionState) {
      setConnectionState(null);
    }
  }, [connectionState]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    const newNodeType = e.dataTransfer.getData('newNodeType');
    if (newNodeType && onNodeAdd) {
      onNodeAdd(newNodeType, x, y);
      return;
    }
    
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId) {
      onNodeMove(nodeId, x, y);
    }
  }, [pan, zoom, onNodeMove, onNodeAdd]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleConnectionStart = useCallback((nodeId: string, point: ConnectionPoint) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (point === 'input') return;

    const startX = node.position_x;
    const startY = node.position_y + 60;

    setConnectionState({
      sourceNodeId: nodeId,
      sourcePoint: point,
      currentX: startX,
      currentY: startY
    });
  }, [nodes]);

  const handleConnectionEnd = useCallback((nodeId: string, point: ConnectionPoint) => {
    if (!connectionState) return;
    
    if (point !== 'input') {
      setConnectionState(null);
      return;
    }

    if (connectionState.sourceNodeId === nodeId) {
      setConnectionState(null);
      return;
    }

    onEdgeAdd?.(connectionState.sourceNodeId, nodeId, connectionState.sourcePoint);
    setConnectionState(null);
  }, [connectionState, onEdgeAdd]);

  const getConnectionPointOffset = (point: ConnectionPoint, isSource: boolean) => {
    const yOffset = isSource ? 60 : -60;
    
    if (point === 'output-left') return { x: -55, y: yOffset };
    if (point === 'output-right') return { x: 55, y: yOffset };
    return { x: 0, y: yOffset };
  };

  const handleEdgeClick = (edgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedEdgeId === edgeId) {
      onEdgeDelete?.(edgeId);
      setSelectedEdgeId(null);
    } else {
      setSelectedEdgeId(edgeId);
      onEdgeClick?.(edgeId);
    }
  };

  // Render beautiful curved edges
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source_node_id);
      const targetNode = nodes.find(n => n.id === edge.target_node_id);
      
      if (!sourceNode || !targetNode) return null;

      const sourceType = NODE_TYPES[sourceNode.node_type];
      const sourceOffset = getConnectionPointOffset(edge.source_point || 'output', true);
      const isSelected = selectedEdgeId === edge.id;
      const isHovered = hoveredEdgeId === edge.id;
      
      const startX = sourceNode.position_x + sourceOffset.x;
      const startY = sourceNode.position_y + sourceOffset.y;
      const endX = targetNode.position_x;
      const endY = targetNode.position_y - 60;

      // Smooth bezier curve
      const dx = endX - startX;
      const dy = endY - startY;
      const controlOffset = Math.min(Math.abs(dy) * 0.5, 100);
      
      const path = `M ${startX} ${startY} 
                    C ${startX} ${startY + controlOffset}, 
                      ${endX} ${endY - controlOffset}, 
                      ${endX} ${endY}`;

      const edgeColor = sourceType?.color || 'hsl(var(--primary))';
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      return (
        <g 
          key={edge.id} 
          onClick={(e) => handleEdgeClick(edge.id, e)} 
          onMouseEnter={() => setHoveredEdgeId(edge.id)}
          onMouseLeave={() => setHoveredEdgeId(null)}
          className="cursor-pointer"
        >
          {/* Hit area */}
          <path
            d={path}
            fill="none"
            stroke="transparent"
            strokeWidth={20}
          />
          
          {/* Glow effect */}
          {(isSelected || isHovered) && (
            <path
              d={path}
              fill="none"
              stroke={isSelected ? 'hsl(var(--destructive))' : edgeColor}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={0.2}
              className="transition-opacity"
            />
          )}
          
          {/* Main edge line */}
          <motion.path
            d={path}
            fill="none"
            stroke={isSelected ? 'hsl(var(--destructive))' : edgeColor}
            strokeWidth={isSelected || isHovered ? 3 : 2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* Animated flow dots */}
          {!isSelected && (
            <circle r={3} fill={edgeColor}>
              <animateMotion dur="2s" repeatCount="indefinite" path={path} />
            </circle>
          )}
          
          {/* Arrow marker */}
          <motion.polygon
            points={`${endX},${endY} ${endX - 8},${endY - 14} ${endX + 8},${endY - 14}`}
            fill={isSelected ? 'hsl(var(--destructive))' : edgeColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
          
          {/* Edge label */}
          {edge.label && (
            <g>
              <rect
                x={midX - 40}
                y={midY - 12}
                width={80}
                height={24}
                rx={12}
                fill="white"
                stroke={edgeColor}
                strokeWidth={1}
                className="shadow-sm"
              />
              <text
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                className="text-xs font-medium pointer-events-none"
                fill={edgeColor}
              >
                {edge.label}
              </text>
            </g>
          )}
          
          {/* Delete indicator */}
          {isSelected && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <circle
                cx={midX}
                cy={midY}
                r={16}
                fill="hsl(var(--destructive))"
                className="shadow-lg"
              />
              <text
                x={midX}
                y={midY + 5}
                textAnchor="middle"
                className="text-sm fill-white font-bold pointer-events-none"
              >
                ×
              </text>
            </motion.g>
          )}
        </g>
      );
    });
  };

  // Render connection line being drawn
  const renderConnectionLine = () => {
    if (!connectionState) return null;

    const sourceNode = nodes.find(n => n.id === connectionState.sourceNodeId);
    if (!sourceNode) return null;

    const sourceType = NODE_TYPES[sourceNode.node_type];
    const sourceOffset = getConnectionPointOffset(connectionState.sourcePoint, true);
    
    const startX = sourceNode.position_x + sourceOffset.x;
    const startY = sourceNode.position_y + sourceOffset.y;
    const endX = connectionState.currentX;
    const endY = connectionState.currentY;

    const controlOffset = Math.min(Math.abs(endY - startY) * 0.5, 100);
    const path = `M ${startX} ${startY} 
                  C ${startX} ${startY + controlOffset}, 
                    ${endX} ${endY - controlOffset}, 
                    ${endX} ${endY}`;

    const color = sourceType?.color || 'hsl(var(--primary))';

    return (
      <g className="pointer-events-none">
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="8 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.circle
          cx={endX}
          cy={endY}
          r={8}
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </g>
    );
  };

  return (
    <div 
      className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border shadow-sm p-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-muted-foreground min-w-[40px] text-center font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button variant="ghost" size="icon" onClick={handleResetView} className="h-8 w-8" title="Reset view">
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button 
          variant={showGrid ? "secondary" : "ghost"} 
          size="icon" 
          onClick={() => setShowGrid(!showGrid)}
          className="h-8 w-8"
          title="Toggle grid"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
        <Button 
          variant={showMinimap ? "secondary" : "ghost"} 
          size="icon" 
          onClick={() => setShowMinimap(!showMinimap)}
          className="h-8 w-8"
          title="Toggle minimap"
        >
          <Map className="w-4 h-4" />
        </Button>
      </div>

      {/* Connection Mode Indicator */}
      <AnimatePresence>
        {connectionState && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-4 z-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-lg flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Connecting... Release on a node's input
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={`w-full h-full canvas-bg ${connectionState ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          backgroundImage: showGrid 
            ? `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          {/* Edges SVG Layer */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <g className="pointer-events-auto">
              {renderEdges()}
            </g>
            {renderConnectionLine()}
          </svg>

          {/* Nodes Layer */}
          {nodes.map(node => (
            <FlowNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isHighlighted={highlightedNodeId === node.id}
              onClick={() => onNodeSelect(node.id)}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              isConnecting={!!connectionState}
            />
          ))}

          {/* Empty State */}
          {nodes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                <Grid3X3 className="w-10 h-10 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start Building Your Flow
              </h3>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Drag nodes from the palette or describe your flow in chat to get started
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Minimap */}
      <AnimatePresence>
        {showMinimap && nodes.length > 0 && (
          <Minimap
            nodes={nodes}
            edges={edges}
            zoom={zoom}
            pan={pan}
            onPanChange={setPan}
            canvasRef={canvasRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
