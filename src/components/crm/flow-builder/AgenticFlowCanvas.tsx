import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, Undo2, Redo2, Map, Search, Magnet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContextMenuTrigger } from '@/components/ui/context-menu';
import { FlowNode, FlowNodeData, ConnectionPoint } from './FlowNode';
import { Minimap } from './Minimap';
import { SelectionBox } from './SelectionBox';
import { NodeGroup, GroupData } from './NodeGroup';
import { CanvasContextMenu } from './CanvasContextMenu';
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

interface SelectionState {
  isSelecting: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface AgenticFlowCanvasProps {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
  groups?: GroupData[];
  selectedNodeIds: Set<string>;
  highlightedNodeId?: string | null;
  onNodeSelect: (nodeIds: Set<string>) => void;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeAdd?: (nodeType: string, x: number, y: number) => void;
  onNodesAdd?: (nodes: FlowNodeData[], edges: FlowEdgeData[]) => void;
  onNodesDelete?: (nodeIds: string[]) => void;
  onNodesAlign?: (nodeIds: string[], direction: 'horizontal' | 'vertical') => void;
  onEdgeAdd?: (sourceNodeId: string, targetNodeId: string, sourcePoint: ConnectionPoint) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onGroupCreate?: (nodeIds: string[]) => void;
  onGroupDelete?: (groupId: string) => void;
  onGroupToggle?: (groupId: string) => void;
  onOpenSearch?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: (position: { x: number; y: number }) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canPaste?: boolean;
}

export const AgenticFlowCanvas: React.FC<AgenticFlowCanvasProps> = ({
  nodes,
  edges,
  groups = [],
  selectedNodeIds,
  highlightedNodeId,
  onNodeSelect,
  onNodeMove,
  onNodeAdd,
  onNodesDelete,
  onNodesAlign,
  onEdgeAdd,
  onEdgeDelete,
  onEdgeClick,
  onUndo,
  onRedo,
  onGroupCreate,
  onGroupDelete,
  onGroupToggle,
  onOpenSearch,
  onCopy,
  onCut,
  onPaste,
  canUndo = false,
  canRedo = false,
  canPaste = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastPanPosition = useRef({ x: 0, y: 0 });

  // Grid size for snapping (matches visual grid)
  const GRID_SIZE = 20;
  
  // Snap coordinates to grid
  const snapToGridCoord = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, [snapToGrid]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? onRedo?.() : onUndo?.();
        return;
      }
      if (isMeta && e.key === 'y') {
        e.preventDefault();
        onRedo?.();
        return;
      }
      if (isMeta && e.key === 'c') {
        e.preventDefault();
        onCopy?.();
        return;
      }
      if (isMeta && e.key === 'x') {
        e.preventDefault();
        onCut?.();
        return;
      }
      if (isMeta && e.key === 'v') {
        e.preventDefault();
        onPaste?.(contextPosition);
        return;
      }
      if (isMeta && e.key === 'd') {
        e.preventDefault();
        onCopy?.();
        setTimeout(() => onPaste?.({ x: contextPosition.x + 50, y: contextPosition.y + 50 }), 50);
        return;
      }
      if (isMeta && e.key === 'a') {
        e.preventDefault();
        onNodeSelect(new Set(nodes.map(n => n.id)));
        return;
      }
      if (isMeta && e.key === 'g') {
        e.preventDefault();
        if (e.shiftKey && selectedGroupId) {
          onGroupDelete?.(selectedGroupId);
        } else if (selectedNodeIds.size > 1) {
          onGroupCreate?.(Array.from(selectedNodeIds));
        }
        return;
      }
      if (isMeta && e.key === 'f') {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEdgeId) {
          onEdgeDelete?.(selectedEdgeId);
          setSelectedEdgeId(null);
        } else if (selectedNodeIds.size > 0) {
          onNodesDelete?.(Array.from(selectedNodeIds));
          onNodeSelect(new Set());
        }
        return;
      }
      if (e.key === 'Escape') {
        setConnectionState(null);
        setSelectedEdgeId(null);
        setSelectionState(null);
        onNodeSelect(new Set());
        return;
      }
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setZoom(z => Math.min(z + 0.15, 2));
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(z - 0.15, 0.25));
        return;
      }
      if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 50, y: 50 });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, selectedNodeIds, selectedGroupId, contextPosition, nodes, onEdgeDelete, onNodeSelect, onNodesDelete, onUndo, onRedo, onCopy, onCut, onPaste, onGroupCreate, onGroupDelete, onOpenSearch]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.min(Math.max(z + delta, 0.25), 2));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.25));
  const handleResetView = () => { setZoom(1); setPan({ x: 50, y: 50 }); };

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom };
  }, [pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (connectionState) return;
    
    const target = e.target as HTMLElement;
    // Check if clicking on an interactive element (node, button, connection point, edge)
    const isInteractiveElement = target.closest('[data-node-id]') || 
                                 target.closest('button') || 
                                 target.closest('.node-connection-point') ||
                                 target.closest('[data-edge-id]');
    
    // If not clicking on an interactive element, treat as canvas click for panning
    if (!isInteractiveElement) {
      if (e.shiftKey && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setSelectionState({
          isSelecting: true,
          startX: e.clientX - rect.left,
          startY: e.clientY - rect.top,
          endX: e.clientX - rect.left,
          endY: e.clientY - rect.top
        });
      } else {
        setIsPanning(true);
        lastPanPosition.current = { x: e.clientX, y: e.clientY };
        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
          onNodeSelect(new Set());
        }
      }
      setSelectedEdgeId(null);
      setContextPosition(screenToCanvas(e.clientX, e.clientY));
    }
  }, [onNodeSelect, connectionState, screenToCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setContextPosition(screenToCanvas(e.clientX, e.clientY));

    if (connectionState && canvasRef.current) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setConnectionState(prev => prev ? { ...prev, currentX: pos.x, currentY: pos.y } : null);
      return;
    }

    if (selectionState?.isSelecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setSelectionState(prev => prev ? { ...prev, endX: e.clientX - rect.left, endY: e.clientY - rect.top } : null);
      return;
    }
    
    if (isPanning) {
      const dx = e.clientX - lastPanPosition.current.x;
      const dy = e.clientY - lastPanPosition.current.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPosition.current = { x: e.clientX, y: e.clientY };
    }
  }, [isPanning, connectionState, selectionState, screenToCanvas]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (connectionState) setConnectionState(null);

    if (selectionState?.isSelecting) {
      const left = Math.min(selectionState.startX, selectionState.endX);
      const top = Math.min(selectionState.startY, selectionState.endY);
      const right = Math.max(selectionState.startX, selectionState.endX);
      const bottom = Math.max(selectionState.startY, selectionState.endY);

      const selectedIds = new Set<string>();
      nodes.forEach(node => {
        const nodeScreenX = node.position_x * zoom + pan.x;
        const nodeScreenY = node.position_y * zoom + pan.y;
        if (nodeScreenX >= left && nodeScreenX <= right && nodeScreenY >= top && nodeScreenY <= bottom) {
          selectedIds.add(node.id);
        }
      });

      if (selectedIds.size > 0) onNodeSelect(selectedIds);
      setSelectionState(null);
    }
  }, [connectionState, selectionState, nodes, zoom, pan, onNodeSelect]);

  const handleNodeClick = useCallback((nodeId: string, e?: React.MouseEvent) => {
    if (e?.shiftKey || e?.metaKey || e?.ctrlKey) {
      const newSelection = new Set(selectedNodeIds);
      newSelection.has(nodeId) ? newSelection.delete(nodeId) : newSelection.add(nodeId);
      onNodeSelect(newSelection);
    } else {
      onNodeSelect(new Set([nodeId]));
    }
  }, [selectedNodeIds, onNodeSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const pos = screenToCanvas(e.clientX, e.clientY);
    const snappedX = snapToGridCoord(pos.x);
    const snappedY = snapToGridCoord(pos.y);
    
    const newNodeType = e.dataTransfer.getData('newNodeType');
    
    if (newNodeType && onNodeAdd) {
      onNodeAdd(newNodeType, snappedX, snappedY);
      return;
    }
    
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId) onNodeMove(nodeId, snappedX, snappedY);
  }, [screenToCanvas, onNodeMove, onNodeAdd, snapToGridCoord]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleConnectionStart = useCallback((nodeId: string, point: ConnectionPoint) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || point === 'input') return;
    setConnectionState({ sourceNodeId: nodeId, sourcePoint: point, currentX: node.position_x, currentY: node.position_y + 60 });
  }, [nodes]);

  const handleConnectionEnd = useCallback((nodeId: string, point: ConnectionPoint) => {
    if (!connectionState || point !== 'input' || connectionState.sourceNodeId === nodeId) {
      setConnectionState(null);
      return;
    }
    onEdgeAdd?.(connectionState.sourceNodeId, nodeId, connectionState.sourcePoint);
    setConnectionState(null);
  }, [connectionState, onEdgeAdd]);

  // Node dimensions: 220px width, ~140px height (with transform translate -50%, -50%)
  // Connection points are at -top-3 (input) and -bottom-3 (output) = ~12px from edge
  const getConnectionPointOffset = (point: ConnectionPoint, isSource: boolean): { x: number; y: number } => {
    const nodeHeight = 140;
    const halfHeight = nodeHeight / 2;
    const connectionOffset = 12; // -top-3 / -bottom-3 = 12px
    
    // Y offset: from center of node to connection point
    const yOffset = isSource ? halfHeight + connectionOffset : -(halfHeight + connectionOffset);
    
    // X offsets for router outputs
    const nodeWidth = 220;
    const quarterWidth = nodeWidth / 4; // 55px
    
    if (point === 'output-left') return { x: -quarterWidth, y: yOffset };
    if (point === 'output-right') return { x: quarterWidth, y: yOffset };
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

  const contextActions = {
    onCopy: () => onCopy?.(),
    onCut: () => onCut?.(),
    onPaste: (pos: { x: number; y: number }) => onPaste?.(pos),
    onDelete: () => {
      if (selectedNodeIds.size > 0) {
        onNodesDelete?.(Array.from(selectedNodeIds));
        onNodeSelect(new Set());
      }
    },
    onSelectAll: () => onNodeSelect(new Set(nodes.map(n => n.id))),
    onDuplicate: () => {
      onCopy?.();
      setTimeout(() => onPaste?.({ x: contextPosition.x + 50, y: contextPosition.y + 50 }), 50);
    },
    onGroup: () => { if (selectedNodeIds.size > 1) onGroupCreate?.(Array.from(selectedNodeIds)); },
    onUngroup: () => { if (selectedGroupId) onGroupDelete?.(selectedGroupId); },
    onAlignHorizontal: () => onNodesAlign?.(Array.from(selectedNodeIds), 'horizontal'),
    onAlignVertical: () => onNodesAlign?.(Array.from(selectedNodeIds), 'vertical'),
    onAddNode: (type: string, pos: { x: number; y: number }) => onNodeAdd?.(type, pos.x, pos.y),
    onEdit: () => {}
  };

  const getContextType = (): 'canvas' | 'single-node' | 'multi-node' | 'group' => {
    if (selectedGroupId) return 'group';
    if (selectedNodeIds.size > 1) return 'multi-node';
    if (selectedNodeIds.size === 1) return 'single-node';
    return 'canvas';
  };

  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source_node_id);
      const targetNode = nodes.find(n => n.id === edge.target_node_id);
      if (!sourceNode || !targetNode) return null;

      const sourceType = NODE_TYPES[sourceNode.node_type];
      const sourceOffset = getConnectionPointOffset(edge.source_point || 'output', true);
      const targetOffset = getConnectionPointOffset('input', false);
      const isSelected = selectedEdgeId === edge.id;
      const isHovered = hoveredEdgeId === edge.id;
      
      // Calculate precise start and end points
      const startX = sourceNode.position_x + sourceOffset.x;
      const startY = sourceNode.position_y + sourceOffset.y;
      const endX = targetNode.position_x + targetOffset.x;
      const endY = targetNode.position_y + targetOffset.y;
      
      // Smart Bezier curve calculation
      const dx = endX - startX;
      const dy = endY - startY;
      const absDy = Math.abs(dy);
      const absDx = Math.abs(dx);
      
      // Minimum offset ensures clean curves even when nodes are close
      const minOffset = 60;
      // Control offset scales with distance but has min/max bounds
      const controlOffsetY = Math.max(Math.min(absDy * 0.4, 150), minOffset);
      
      // Adjust control points for horizontal movement to prevent weird curves
      const horizontalAdjust = Math.min(absDx * 0.1, 30);
      
      // Create smooth S-curve path
      const path = `M ${startX} ${startY} C ${startX + (dx > 0 ? horizontalAdjust : -horizontalAdjust)} ${startY + controlOffsetY}, ${endX + (dx > 0 ? -horizontalAdjust : horizontalAdjust)} ${endY - controlOffsetY}, ${endX} ${endY}`;
      
      const edgeColor = sourceType?.color || 'hsl(var(--primary))';
      
      // Calculate midpoint for label positioning (offset slightly from path)
      const midX = (startX + endX) / 2 - 45;
      const midY = (startY + endY) / 2;
      
      // Arrow dimensions (smaller and cleaner)
      const arrowSize = 5;
      const arrowHeight = arrowSize * 1.8;

      return (
        <g 
          key={edge.id} 
          data-edge-id={edge.id}
          onClick={(e) => handleEdgeClick(edge.id, e)} 
          onMouseEnter={() => setHoveredEdgeId(edge.id)} 
          onMouseLeave={() => setHoveredEdgeId(null)} 
          className="cursor-pointer"
        >
          {/* Invisible wider path for easier clicking */}
          <path d={path} fill="none" stroke="transparent" strokeWidth={24} />
          
          {/* Glow effect on hover/select */}
          {(isSelected || isHovered) && (
            <path 
              d={path} 
              fill="none" 
              stroke={isSelected ? 'hsl(var(--destructive))' : edgeColor} 
              strokeWidth={10} 
              strokeLinecap="round" 
              opacity={0.15}
              style={{ filter: 'blur(2px)' }}
            />
          )}
          
          {/* Main edge path */}
          <motion.path 
            d={path} 
            fill="none" 
            stroke={isSelected ? 'hsl(var(--destructive))' : edgeColor} 
            strokeWidth={isSelected || isHovered ? 2.5 : 2} 
            strokeLinecap="round"
            initial={{ pathLength: 0 }} 
            animate={{ pathLength: 1 }} 
            transition={{ duration: 0.5, ease: 'easeOut' }} 
          />
          
          {/* Animated dot flowing along the path */}
          {!isSelected && (
            <circle r={2.5} fill={edgeColor} opacity={0.8}>
              <animateMotion dur="3s" repeatCount="indefinite" path={path} />
            </circle>
          )}
          
          {/* Arrow head at target connection point */}
          <motion.polygon 
            points={`${endX},${endY} ${endX - arrowSize},${endY - arrowHeight} ${endX + arrowSize},${endY - arrowHeight}`} 
            fill={isSelected ? 'hsl(var(--destructive))' : edgeColor}
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
          />
          
          {/* Edge label with background */}
          {edge.label && (
            <g style={{ pointerEvents: 'none' }}>
              <rect 
                x={midX - 2} 
                y={midY - 10} 
                width={Math.min(edge.label.length * 7 + 16, 90)} 
                height={20} 
                rx={10} 
                fill="white" 
                stroke={edgeColor} 
                strokeWidth={1}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
              />
              <text 
                x={midX + Math.min(edge.label.length * 7 + 16, 90) / 2 - 2} 
                y={midY + 4} 
                textAnchor="middle" 
                className="text-[10px] font-medium" 
                fill={edgeColor}
              >
                {edge.label.length > 10 ? edge.label.substring(0, 10) + '...' : edge.label}
              </text>
            </g>
          )}
          
          {/* Delete indicator when selected */}
          {isSelected && (
            <motion.g 
              initial={{ scale: 0, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <circle 
                cx={(startX + endX) / 2} 
                cy={(startY + endY) / 2} 
                r={14} 
                fill="hsl(var(--destructive))"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
              <text 
                x={(startX + endX) / 2} 
                y={(startY + endY) / 2 + 4} 
                textAnchor="middle" 
                className="text-xs fill-white font-bold pointer-events-none"
              >
                ×
              </text>
            </motion.g>
          )}
        </g>
      );
    });
  };

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
    
    // Use same curve calculation as renderEdges for consistency
    const dx = endX - startX;
    const dy = endY - startY;
    const absDy = Math.abs(dy);
    const absDx = Math.abs(dx);
    const minOffset = 60;
    const controlOffsetY = Math.max(Math.min(absDy * 0.4, 150), minOffset);
    const horizontalAdjust = Math.min(absDx * 0.1, 30);
    
    const path = `M ${startX} ${startY} C ${startX + (dx > 0 ? horizontalAdjust : -horizontalAdjust)} ${startY + controlOffsetY}, ${endX + (dx > 0 ? -horizontalAdjust : horizontalAdjust)} ${endY - controlOffsetY}, ${endX} ${endY}`;
    const color = sourceType?.color || 'hsl(var(--primary))';

    return (
      <g className="pointer-events-none">
        <motion.path 
          d={path} 
          fill="none" 
          stroke={color} 
          strokeWidth={2} 
          strokeLinecap="round" 
          strokeDasharray="8 6" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
        />
        <motion.circle 
          cx={endX} 
          cy={endY} 
          r={6} 
          fill={color} 
          fillOpacity={0.4}
          stroke={color}
          strokeWidth={2}
          initial={{ scale: 0 }} 
          animate={{ scale: [1, 1.15, 1] }} 
          transition={{ repeat: Infinity, duration: 0.8 }} 
        />
      </g>
    );
  };

  return (
    <CanvasContextMenu position={contextPosition} context={getContextType()} selectedCount={selectedNodeIds.size} canPaste={canPaste} hasGroup={selectedGroupId !== null} actions={contextActions}>
      <ContextMenuTrigger asChild>
        <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border overflow-hidden" onWheel={handleWheel}>
          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border shadow-sm p-1">
            <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="h-8 w-8" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="h-8 w-8" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={onOpenSearch} className="h-8 w-8" title="Search (Ctrl+F)"><Search className="w-4 h-4" /></Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8"><ZoomOut className="w-4 h-4" /></Button>
            <span className="text-xs text-muted-foreground min-w-[40px] text-center font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8"><ZoomIn className="w-4 h-4" /></Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={handleResetView} className="h-8 w-8" title="Reset view"><Maximize2 className="w-4 h-4" /></Button>
            <Button variant={showGrid ? "secondary" : "ghost"} size="icon" onClick={() => setShowGrid(!showGrid)} className="h-8 w-8" title="Toggle grid"><Grid3X3 className="w-4 h-4" /></Button>
            <Button variant={snapToGrid ? "secondary" : "ghost"} size="icon" onClick={() => setSnapToGrid(!snapToGrid)} className="h-8 w-8" title="Snap to grid"><Magnet className="w-4 h-4" /></Button>
            <Button variant={showMinimap ? "secondary" : "ghost"} size="icon" onClick={() => setShowMinimap(!showMinimap)} className="h-8 w-8" title="Toggle minimap"><Map className="w-4 h-4" /></Button>
          </div>

          {/* Selection Badge */}
          <AnimatePresence>
            {selectedNodeIds.size > 1 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-lg">
                {selectedNodeIds.size} nodes selected
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connection Mode */}
          <AnimatePresence>
            {connectionState && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-4 left-4 z-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Connecting... Release on input
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas */}
          <div
            ref={canvasRef}
            className={`w-full h-full canvas-bg ${connectionState ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              backgroundImage: showGrid ? `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)` : 'none',
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
            {selectionState?.isSelecting && <SelectionBox startX={selectionState.startX} startY={selectionState.startY} endX={selectionState.endX} endY={selectionState.endY} />}

            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', width: '100%', height: '100%', position: 'relative' }}>
              {groups.map(group => (
                <NodeGroup key={group.id} group={group} nodes={nodes} isSelected={selectedGroupId === group.id} onSelect={() => setSelectedGroupId(group.id)} onToggleCollapse={() => onGroupToggle?.(group.id)} onUngroup={() => onGroupDelete?.(group.id)} onRename={() => {}} />
              ))}

              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                <g className="pointer-events-auto">{renderEdges()}</g>
                {renderConnectionLine()}
              </svg>

              {nodes.map(node => (
                <FlowNode key={node.id} node={node} isSelected={selectedNodeIds.has(node.id)} isHighlighted={highlightedNodeId === node.id} onClick={(e) => handleNodeClick(node.id, e)} onConnectionStart={handleConnectionStart} onConnectionEnd={handleConnectionEnd} isConnecting={!!connectionState} />
              ))}

              {nodes.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
                    <Grid3X3 className="w-10 h-10 text-primary/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start Building Your Flow</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">Drag nodes from the palette or describe your flow in chat</p>
                </motion.div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showMinimap && nodes.length > 0 && <Minimap nodes={nodes} edges={edges} zoom={zoom} pan={pan} onPanChange={setPan} canvasRef={canvasRef} />}
          </AnimatePresence>
        </div>
      </ContextMenuTrigger>
    </CanvasContextMenu>
  );
};
