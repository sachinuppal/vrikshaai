import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Play, MoreVertical, ChevronLeft, FileText, TestTube2, LayoutTemplate } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { AgentChatPanel, ChatMessage } from '@/components/crm/flow-builder/AgentChatPanel';
import { AgenticFlowCanvas, FlowEdgeData } from '@/components/crm/flow-builder/AgenticFlowCanvas';
import { NodeConfigPanel } from '@/components/crm/flow-builder/NodeConfigPanel';
import { NodePalette } from '@/components/crm/flow-builder/NodePalette';
import { FlowTestingPanel } from '@/components/crm/flow-builder/FlowTestingPanel';
import { FlowTemplatesModal } from '@/components/crm/flow-builder/FlowTemplatesModal';
import { FlowNodeData, ConnectionPoint } from '@/components/crm/flow-builder/FlowNode';
import { NODE_TYPES } from '@/components/crm/flow-builder/nodeTypes';

const CRMFlowBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { flowId } = useParams();
  
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [flowDescription, setFlowDescription] = useState('');
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [nodes, setNodes] = useState<FlowNodeData[]>([]);
  const [edges, setEdges] = useState<FlowEdgeData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isSaving, setIsSaving] = useState(false);
  
  // Panel states
  const [isTestingOpen, setIsTestingOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  // Undo/Redo history
  const [history, setHistory] = useState<{ nodes: FlowNodeData[]; edges: FlowEdgeData[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback((newNodes: FlowNodeData[], newEdges: FlowEdgeData[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: newNodes, edges: newEdges });
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  // Load existing flow if editing
  useEffect(() => {
    if (flowId) {
      loadFlow(flowId);
    }
  }, [flowId]);

  const loadFlow = async (id: string) => {
    try {
      const { data: flow, error } = await supabase
        .from('crm_agentic_flows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (flow) {
        setFlowName(flow.name);
        setFlowDescription(flow.description || '');
        setGlobalPrompt(flow.global_prompt || '');
        
        const flowJson = flow.flow_json as { nodes?: FlowNodeData[]; edges?: FlowEdgeData[] } || {};
        setNodes(flowJson.nodes || []);
        setEdges(flowJson.edges || []);
      }
    } catch (error) {
      console.error('Error loading flow:', error);
      toast.error('Failed to load flow');
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setThinkingSteps([]);

    try {
      const response = await supabase.functions.invoke('crm-agentic-builder', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          session_id: sessionId,
          force_generate: messages.length === 0 // Force flow generation on first message
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.type === 'flow_generated') {
        // Animate thinking steps one by one
        if (data.thinking_steps && data.thinking_steps.length > 0) {
          for (let i = 0; i < data.thinking_steps.length; i++) {
            setThinkingSteps(prev => [...prev, data.thinking_steps[i]]);
            await new Promise(resolve => setTimeout(resolve, 400));
          }
          await new Promise(resolve => setTimeout(resolve, 600));
        }

        // Update flow with animation
        setFlowName(data.flow_name || flowName);
        setFlowDescription(data.flow_description || '');
        setGlobalPrompt(data.global_prompt || '');
        
        // Add nodes one by one with animation
        const newNodes = (data.nodes || []).map((n: any, i: number) => ({
          ...n,
          position_x: n.position_x || 400,
          position_y: n.position_y || 80 + i * 140
        }));
        
        // Animate nodes appearing
        for (let i = 0; i < newNodes.length; i++) {
          setNodes(prev => [...prev.filter(p => !newNodes.slice(0, i + 1).find((n: FlowNodeData) => n.id === p.id)), ...newNodes.slice(0, i + 1)]);
          setHighlightedNodeId(newNodes[i].id);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        setEdges(data.edges || []);
        setHighlightedNodeId(null);

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: {
            type: 'flow_generated',
            thinking_steps: data.thinking_steps
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
        
      } else if (data.type === 'flow_modified') {
        // Handle flow modifications
        if (data.action === 'add_node' && data.new_nodes) {
          const nodesToAdd = data.new_nodes.map((n: any, i: number) => ({
            ...n,
            id: n.id || crypto.randomUUID(),
            position_x: n.position_x || 400,
            position_y: n.position_y || (nodes.length + i) * 140 + 80
          }));
          setNodes(prev => [...prev, ...nodesToAdd]);
        }
        
        if (data.action === 'remove_node' && data.target_id) {
          setNodes(prev => prev.filter(n => n.id !== data.target_id));
          setEdges(prev => prev.filter(e => 
            e.source_node_id !== data.target_id && e.target_node_id !== data.target_id
          ));
        }
        
        if (data.new_edges) {
          setEdges(prev => [...prev, ...data.new_edges]);
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: { type: 'message' }
        };
        setMessages(prev => [...prev, assistantMessage]);
        
      } else if (data.type === 'clarification') {
        const clarificationMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: {
            type: 'clarification',
            options: data.options
          }
        };
        setMessages(prev => [...prev, clarificationMessage]);
      } else {
        // Regular message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message || 'I understand. How can I help you refine the flow?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error calling agent:', error);
      toast.error('Failed to process your request');
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setThinkingSteps([]);
    }
  };

  const handleOptionSelect = (option: string) => {
    handleSendMessage(option);
  };

  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, position_x: x, position_y: y } : n
    ));
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<FlowNodeData>) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, ...updates } : n
    ));
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => 
      e.source_node_id !== nodeId && e.target_node_id !== nodeId
    ));
    setSelectedNodeId(null);
    toast.success('Node deleted');
  }, []);

  const handleNodeAdd = useCallback((nodeType: string, x: number, y: number) => {
    const nodeConfig = NODE_TYPES[nodeType];
    if (!nodeConfig) return;

    const newNode: FlowNodeData = {
      id: crypto.randomUUID(),
      node_type: nodeType,
      label: nodeConfig.label,
      config: {},
      position_x: x,
      position_y: y
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    toast.success(`Added ${nodeConfig.label} node`);
  }, []);

  const handleEdgeAdd = useCallback((sourceNodeId: string, targetNodeId: string, sourcePoint: ConnectionPoint) => {
    // Check if edge already exists
    const edgeExists = edges.some(
      e => e.source_node_id === sourceNodeId && e.target_node_id === targetNodeId
    );
    
    if (edgeExists) {
      toast.error('Connection already exists');
      return;
    }

    const newEdge: FlowEdgeData = {
      id: crypto.randomUUID(),
      source_node_id: sourceNodeId,
      target_node_id: targetNodeId,
      source_point: sourcePoint,
      label: sourcePoint === 'output-left' ? 'Condition A' : sourcePoint === 'output-right' ? 'Condition B' : undefined
    };

    setEdges(prev => [...prev, newEdge]);
    toast.success('Connection created');
  }, [edges]);

  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    toast.success('Connection deleted');
  }, []);

  const handleTemplateSelect = useCallback((templateNodes: FlowNodeData[], templateEdges: FlowEdgeData[], name: string) => {
    setNodes(templateNodes);
    setEdges(templateEdges);
    setFlowName(name);
    toast.success(`Loaded "${name}" template`);
  }, []);

  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      const flowJson = JSON.parse(JSON.stringify({ nodes, edges }));

      if (flowId) {
        const { error } = await supabase
          .from('crm_agentic_flows')
          .update({
            name: flowName,
            description: flowDescription,
            global_prompt: globalPrompt,
            flow_json: flowJson,
            status: 'draft'
          })
          .eq('id', flowId);

        if (error) throw error;
        toast.success('Flow saved');
      } else {
        const { data, error } = await supabase
          .from('crm_agentic_flows')
          .insert({
            name: flowName,
            description: flowDescription,
            global_prompt: globalPrompt,
            flow_json: flowJson,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;
        toast.success('Flow created');
        navigate(`/crm/flow-builder/${data.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save flow');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      if (!flowId) {
        await handleSaveFlow();
      }

      const { error } = await supabase
        .from('crm_agentic_flows')
        .update({ status: 'published' })
        .eq('id', flowId);

      if (error) throw error;
      toast.success('Flow published!');
    } catch (error) {
      console.error('Error publishing flow:', error);
      toast.error('Failed to publish flow');
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <CRMLayout>
      <div className="h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/crm/triggers')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <Input
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="border-none bg-transparent font-semibold text-lg h-auto p-0 focus-visible:ring-0"
                placeholder="Flow name..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsTemplatesOpen(true)}
              className="hidden sm:flex"
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsTestingOpen(true)}
              disabled={nodes.length === 0}
            >
              <TestTube2 className="w-4 h-4 mr-2" />
              Test
            </Button>
            <Button variant="outline" onClick={handleSaveFlow} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handlePublish} disabled={nodes.length === 0}>
              <Play className="w-4 h-4 mr-2" />
              Publish
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsTemplatesOpen(true)}>
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Browse Templates
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setNodes([]); setEdges([]); }}>
                  Clear Canvas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMessages([])}>
                  Clear Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          <div className="w-[350px] flex-shrink-0">
            <AgentChatPanel
              messages={messages}
              isLoading={isLoading}
              thinkingSteps={thinkingSteps}
              onSendMessage={handleSendMessage}
              onOptionSelect={handleOptionSelect}
            />
          </div>

          {/* Node Palette */}
          <NodePalette />

          {/* Canvas */}
          <div className="flex-1 relative">
            <AgenticFlowCanvas
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              highlightedNodeId={highlightedNodeId}
              onNodeSelect={setSelectedNodeId}
              onNodeMove={handleNodeMove}
              onNodeAdd={handleNodeAdd}
              onEdgeAdd={handleEdgeAdd}
              onEdgeDelete={handleEdgeDelete}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />

            {/* Node Config Panel */}
            {selectedNode && !isTestingOpen && (
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNodeId(null)}
                onUpdate={handleNodeUpdate}
                onDelete={handleNodeDelete}
              />
            )}

            {/* Flow Testing Panel */}
            <FlowTestingPanel
              nodes={nodes}
              edges={edges}
              isOpen={isTestingOpen}
              onClose={() => {
                setIsTestingOpen(false);
                setHighlightedNodeId(null);
              }}
              onHighlightNode={setHighlightedNodeId}
            />
          </div>
        </div>
      </div>

      {/* Flow Templates Modal */}
      <FlowTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </CRMLayout>
  );
};

export default CRMFlowBuilder;
