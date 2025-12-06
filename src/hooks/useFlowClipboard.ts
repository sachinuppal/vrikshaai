import { useState, useCallback } from 'react';
import { FlowNodeData } from '@/components/crm/flow-builder/FlowNode';
import { FlowEdgeData } from '@/components/crm/flow-builder/AgenticFlowCanvas';

interface ClipboardData {
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
  timestamp: number;
}

export const useFlowClipboard = () => {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  const copy = useCallback((nodes: FlowNodeData[], edges: FlowEdgeData[]) => {
    if (nodes.length === 0) return;
    
    // Get edges that connect only the selected nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const relevantEdges = edges.filter(
      e => nodeIds.has(e.source_node_id) && nodeIds.has(e.target_node_id)
    );

    const data: ClipboardData = {
      nodes: nodes.map(n => ({ ...n })),
      edges: relevantEdges.map(e => ({ ...e })),
      timestamp: Date.now()
    };

    setClipboard(data);
    
    // Also copy to system clipboard as JSON for cross-tab support
    try {
      navigator.clipboard.writeText(JSON.stringify(data));
    } catch (e) {
      // Fallback - just use internal state
    }
  }, []);

  const cut = useCallback((
    nodes: FlowNodeData[], 
    edges: FlowEdgeData[],
    onDelete: (nodeIds: string[]) => void
  ) => {
    copy(nodes, edges);
    onDelete(nodes.map(n => n.id));
  }, [copy]);

  const paste = useCallback((
    position: { x: number; y: number },
    existingNodes: FlowNodeData[],
    existingEdges: FlowEdgeData[],
    onAdd: (nodes: FlowNodeData[], edges: FlowEdgeData[]) => void
  ) => {
    if (!clipboard || clipboard.nodes.length === 0) return;

    // Calculate center of copied nodes
    const centerX = clipboard.nodes.reduce((sum, n) => sum + n.position_x, 0) / clipboard.nodes.length;
    const centerY = clipboard.nodes.reduce((sum, n) => sum + n.position_y, 0) / clipboard.nodes.length;

    // Create ID mapping for new nodes
    const idMap = new Map<string, string>();
    
    const newNodes: FlowNodeData[] = clipboard.nodes.map(node => {
      const newId = crypto.randomUUID();
      idMap.set(node.id, newId);
      
      return {
        ...node,
        id: newId,
        label: `${node.label} (copy)`,
        position_x: node.position_x - centerX + position.x + 50,
        position_y: node.position_y - centerY + position.y + 50
      };
    });

    const newEdges: FlowEdgeData[] = clipboard.edges.map(edge => ({
      ...edge,
      id: crypto.randomUUID(),
      source_node_id: idMap.get(edge.source_node_id) || edge.source_node_id,
      target_node_id: idMap.get(edge.target_node_id) || edge.target_node_id
    }));

    onAdd(newNodes, newEdges);
  }, [clipboard]);

  const canPaste = clipboard !== null && clipboard.nodes.length > 0;

  return { copy, cut, paste, canPaste, clipboard };
};
