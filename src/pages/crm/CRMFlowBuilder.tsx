import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Play, MoreVertical, ChevronLeft, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { AgentChatPanel, ChatMessage } from '@/components/crm/flow-builder/AgentChatPanel';
import { AgenticFlowCanvas, FlowEdgeData } from '@/components/crm/flow-builder/AgenticFlowCanvas';
import { NodeConfigPanel } from '@/components/crm/flow-builder/NodeConfigPanel';
import { FlowNodeData } from '@/components/crm/flow-builder/FlowNode';

const CRMFlowBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { flowId } = useParams();
  
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [flowDescription, setFlowDescription] = useState('');
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [nodes, setNodes] = useState<FlowNodeData[]>([]);
  const [edges, setEdges] = useState<FlowEdgeData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isSaving, setIsSaving] = useState(false);

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
          session_id: sessionId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.type === 'flow_generated') {
        // Show thinking steps
        if (data.thinking_steps) {
          setThinkingSteps(data.thinking_steps);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Update flow
        setFlowName(data.flow_name || flowName);
        setGlobalPrompt(data.global_prompt || '');
        
        // Transform nodes with positions
        const newNodes = (data.nodes || []).map((n: any, i: number) => ({
          ...n,
          position_x: n.position_x || 400,
          position_y: n.position_y || 100 + i * 150
        }));
        
        setNodes(newNodes);
        setEdges(data.edges || []);

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
            <Button variant="outline" onClick={handleSaveFlow} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
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
                <DropdownMenuItem onClick={() => setNodes([])}>
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

          {/* Canvas */}
          <div className="flex-1 relative">
            <AgenticFlowCanvas
              nodes={nodes}
              edges={edges}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
              onNodeMove={handleNodeMove}
            />

            {/* Node Config Panel */}
            {selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNodeId(null)}
                onUpdate={handleNodeUpdate}
                onDelete={handleNodeDelete}
              />
            )}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
};

export default CRMFlowBuilder;
