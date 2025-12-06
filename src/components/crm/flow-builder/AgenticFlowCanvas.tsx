import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlowNode, FlowNodeData, ConnectionPoint } from './FlowNode';
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

interface AgenticFlowCanvasProps {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeAdd?: (nodeType: string, x: number, y: number) => void;
  onEdgeAdd?: (sourceNodeId: string, targetNodeId: string, sourcePoint: ConnectionPoint) => void;
  onEdgeClick?: (edgeId: string) => void;
}

export const AgenticFlowCanvas: React.FC<AgenticFlowCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodeMove,
  onNodeAdd,
  onEdgeAdd,
  onEdgeClick
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (connectionState) return; // Don't pan while connecting
    
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setIsPanning(true);
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
      onNodeSelect(null);
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
    // Cancel connection if released on empty space
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
    
    // Check if dropping a new node from palette
    const newNodeType = e.dataTransfer.getData('newNodeType');
    if (newNodeType && onNodeAdd) {
      onNodeAdd(newNodeType, x, y);
      return;
    }
    
    // Otherwise, moving an existing node
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId) {
      onNodeMove(nodeId, x, y);
    }
  }, [pan, zoom, onNodeMove, onNodeAdd]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Connection handlers
  const handleConnectionStart = useCallback((nodeId: string, point: ConnectionPoint) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Only allow starting from output points
    if (point === 'input') return;

    const startX = node.position_x;
    const startY = node.position_y + 40; // Bottom of node

    setConnectionState({
      sourceNodeId: nodeId,
      sourcePoint: point,
      currentX: startX,
      currentY: startY
    });
  }, [nodes]);

  const handleConnectionEnd = useCallback((nodeId: string, point: ConnectionPoint) => {
    if (!connectionState) return;
    
    // Only allow ending on input points
    if (point !== 'input') {
      setConnectionState(null);
      return;
    }

    // Don't allow self-connections
    if (connectionState.sourceNodeId === nodeId) {
      setConnectionState(null);
      return;
    }

    // Create the edge
    onEdgeAdd?.(connectionState.sourceNodeId, nodeId, connectionState.sourcePoint);
    setConnectionState(null);
  }, [connectionState, onEdgeAdd]);

  // Get connection point position based on point type
  const getConnectionPointOffset = (point: ConnectionPoint, isSource: boolean) => {
    const yOffset = isSource ? 40 : -40; // Bottom for source, top for target
    
    if (point === 'output-left') return { x: -40, y: yOffset };
    if (point === 'output-right') return { x: 40, y: yOffset };
    return { x: 0, y: yOffset };
  };

  // Calculate edge paths
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source_node_id);
      const targetNode = nodes.find(n => n.id === edge.target_node_id);
      
      if (!sourceNode || !targetNode) return null;

      const sourceType = NODE_TYPES[sourceNode.node_type];
      const sourceOffset = getConnectionPointOffset(edge.source_point || 'output', true);
      
      const startX = sourceNode.position_x + sourceOffset.x;
      const startY = sourceNode.position_y + sourceOffset.y;
      const endX = targetNode.position_x;
      const endY = targetNode.position_y - 40; // Top of node

      // Calculate control points for smooth curve
      const midY = (startY + endY) / 2;
      const path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

      return (
        <g key={edge.id} onClick={() => onEdgeClick?.(edge.id)} className="cursor-pointer">
          {/* Edge shadow */}
          <path
            d={path}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={4}
            strokeLinecap="round"
          />
          {/* Edge line */}
          <path
            d={path}
            fill="none"
            stroke={sourceType?.color || 'hsl(var(--primary))'}
            strokeWidth={2}
            strokeLinecap="round"
            className="transition-all hover:stroke-[3px]"
          />
          {/* Arrow head */}
          <polygon
            points={`${endX},${endY} ${endX - 6},${endY - 10} ${endX + 6},${endY - 10}`}
            fill={sourceType?.color || 'hsl(var(--primary))'}
          />
          {/* Edge label */}
          {edge.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2 - 10}
              textAnchor="middle"
              className="text-xs fill-muted-foreground pointer-events-none"
            >
              {edge.label}
            </text>
          )}
        </g>
      );
    });
  };

  // Render the in-progress connection line
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

    const midY = (startY + endY) / 2;
    const path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

    return (
      <g className="pointer-events-none">
        {/* Connection line */}
        <path
          d={path}
          fill="none"
          stroke={sourceType?.color || 'hsl(var(--primary))'}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
        {/* End point indicator */}
        <circle
          cx={endX}
          cy={endY}
          r={6}
          fill={sourceType?.color || 'hsl(var(--primary))'}
          className="animate-pulse"
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-background rounded-lg border">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="outline" size="icon" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetView}>
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button 
          variant={showGrid ? "default" : "outline"} 
          size="icon" 
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>
      </div>

      {/* Connection Mode Indicator */}
      {connectionState && (
        <div className="absolute top-4 left-4 z-10 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium animate-pulse">
          🔗 Connecting... Release on a node's input
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={`w-full h-full canvas-bg ${connectionState ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        style={{
          backgroundImage: showGrid 
            ? `radial-gradient(circle, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)`
            : 'none',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Transformed content */}
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
              onClick={() => onNodeSelect(node.id)}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              isConnecting={!!connectionState}
            />
          ))}

          {/* Empty State */}
          {nodes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Grid3X3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No flow yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                Drag nodes from the palette or describe your flow in chat
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
