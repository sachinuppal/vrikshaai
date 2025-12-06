import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NODE_TYPES } from './nodeTypes';
import { FlowNodeData } from './FlowNode';
import { FlowEdgeData } from './AgenticFlowCanvas';

interface MinimapProps {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const Minimap: React.FC<MinimapProps> = ({
  nodes,
  edges,
  zoom,
  pan,
  onPanChange,
  canvasRef
}) => {
  const MINIMAP_WIDTH = 180;
  const MINIMAP_HEIGHT = 120;
  const PADDING = 20;

  // Calculate bounds of all nodes
  const bounds = useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 800, width: 1000, height: 800 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.position_x - 110);
      minY = Math.min(minY, node.position_y - 60);
      maxX = Math.max(maxX, node.position_x + 110);
      maxY = Math.max(maxY, node.position_y + 60);
    });

    // Add padding
    minX -= PADDING;
    minY -= PADDING;
    maxX += PADDING;
    maxY += PADDING;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }, [nodes]);

  // Calculate scale to fit all nodes in minimap
  const scale = Math.min(
    MINIMAP_WIDTH / bounds.width,
    MINIMAP_HEIGHT / bounds.height
  );

  // Transform node position to minimap coordinates
  const toMinimapCoords = (x: number, y: number) => ({
    x: (x - bounds.minX) * scale,
    y: (y - bounds.minY) * scale
  });

  // Calculate viewport rectangle
  const viewportRect = useMemo(() => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const viewportWidth = rect.width / zoom;
    const viewportHeight = rect.height / zoom;
    
    const viewportX = -pan.x / zoom;
    const viewportY = -pan.y / zoom;

    return {
      x: (viewportX - bounds.minX) * scale,
      y: (viewportY - bounds.minY) * scale,
      width: viewportWidth * scale,
      height: viewportHeight * scale
    };
  }, [pan, zoom, bounds, scale, canvasRef]);

  // Handle minimap click to pan
  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coords back to canvas coords
    const canvasX = x / scale + bounds.minX;
    const canvasY = y / scale + bounds.minY;

    if (!canvasRef.current) return;
    const containerRect = canvasRef.current.getBoundingClientRect();

    // Center the viewport on the clicked point
    const newPanX = -canvasX * zoom + containerRect.width / 2;
    const newPanY = -canvasY * zoom + containerRect.height / 2;

    onPanChange({ x: newPanX, y: newPanY });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute bottom-4 right-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden"
    >
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="cursor-pointer"
        onClick={handleMinimapClick}
      >
        {/* Background */}
        <rect
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
          fill="hsl(var(--background))"
          opacity={0.8}
        />

        {/* Edges */}
        {edges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source_node_id);
          const targetNode = nodes.find(n => n.id === edge.target_node_id);
          
          if (!sourceNode || !targetNode) return null;

          const start = toMinimapCoords(sourceNode.position_x, sourceNode.position_y);
          const end = toMinimapCoords(targetNode.position_x, targetNode.position_y);

          return (
            <line
              key={edge.id}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const pos = toMinimapCoords(node.position_x, node.position_y);
          const nodeType = NODE_TYPES[node.node_type];
          
          return (
            <rect
              key={node.id}
              x={pos.x - 8}
              y={pos.y - 5}
              width={16}
              height={10}
              rx={2}
              fill={nodeType?.color || 'hsl(var(--primary))'}
            />
          );
        })}

        {/* Viewport rectangle */}
        {viewportRect && (
          <rect
            x={Math.max(0, viewportRect.x)}
            y={Math.max(0, viewportRect.y)}
            width={Math.min(viewportRect.width, MINIMAP_WIDTH - viewportRect.x)}
            height={Math.min(viewportRect.height, MINIMAP_HEIGHT - viewportRect.y)}
            fill="hsl(var(--primary))"
            fillOpacity={0.1}
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            rx={2}
          />
        )}
      </svg>
    </motion.div>
  );
};
