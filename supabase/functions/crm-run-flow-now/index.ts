import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RunFlowRequest {
  contact_id: string;
  flow_id: string;
  contact_flow_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { contact_id, flow_id, contact_flow_id }: RunFlowRequest = await req.json();

    console.log(`Starting manual flow execution: flow=${flow_id}, contact=${contact_id}`);

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('crm_flow_executions')
      .insert({
        contact_flow_id,
        contact_id,
        flow_id,
        status: 'running',
        triggered_by: 'manual',
        nodes_executed: []
      })
      .select()
      .single();

    if (execError) {
      console.error('Error creating execution record:', execError);
      throw execError;
    }

    console.log(`Created execution record: ${execution.id}`);

    // Load the flow
    const { data: flow, error: flowError } = await supabase
      .from('crm_agentic_flows')
      .select('*')
      .eq('id', flow_id)
      .single();

    if (flowError || !flow) {
      console.error('Error loading flow:', flowError);
      await updateExecution(supabase, execution.id, 'failed', [], 'Flow not found');
      throw new Error('Flow not found');
    }

    // Load flow nodes and edges
    const [nodesRes, edgesRes] = await Promise.all([
      supabase.from('crm_flow_nodes').select('*').eq('flow_id', flow_id),
      supabase.from('crm_flow_edges').select('*').eq('flow_id', flow_id)
    ]);

    const nodes = nodesRes.data || [];
    const edges = edgesRes.data || [];

    console.log(`Loaded ${nodes.length} nodes and ${edges.length} edges`);

    // Load contact data
    const { data: contact } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('id', contact_id)
      .single();

    const nodesExecuted: any[] = [];
    let hasError = false;
    let errorMessage = '';

    // Find start node (trigger node or first node)
    const triggerNode = nodes.find(n => n.node_type === 'trigger') || nodes[0];
    
    if (!triggerNode) {
      await updateExecution(supabase, execution.id, 'completed', [], 'No nodes to execute');
      return new Response(JSON.stringify({ success: true, message: 'No nodes to execute' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Execute nodes in order (BFS from trigger)
    const queue = [triggerNode];
    const visited = new Set<string>();

    while (queue.length > 0 && !hasError) {
      const currentNode = queue.shift()!;
      
      if (visited.has(currentNode.id)) continue;
      visited.add(currentNode.id);

      console.log(`Executing node: ${currentNode.label} (${currentNode.node_type})`);

      try {
        const result = await executeNode(supabase, currentNode, contact, contact_id);
        nodesExecuted.push({
          node_id: currentNode.id,
          node_type: currentNode.node_type,
          label: currentNode.label,
          status: 'completed',
          executed_at: new Date().toISOString(),
          result
        });
      } catch (nodeError: any) {
        console.error(`Error executing node ${currentNode.id}:`, nodeError);
        nodesExecuted.push({
          node_id: currentNode.id,
          node_type: currentNode.node_type,
          label: currentNode.label,
          status: 'failed',
          executed_at: new Date().toISOString(),
          error: nodeError.message
        });
        hasError = true;
        errorMessage = `Node "${currentNode.label}" failed: ${nodeError.message}`;
        break;
      }

      // Find next nodes via edges
      const outgoingEdges = edges.filter(e => e.source_node_id === currentNode.id);
      for (const edge of outgoingEdges) {
        const targetNode = nodes.find(n => n.id === edge.target_node_id);
        if (targetNode && !visited.has(targetNode.id)) {
          queue.push(targetNode);
        }
      }
    }

    // Update execution record
    const finalStatus = hasError ? 'failed' : 'completed';
    await updateExecution(supabase, execution.id, finalStatus, nodesExecuted, errorMessage || null);

    // Update contact_flow stats
    await supabase
      .from('crm_contact_flows')
      .update({
        last_executed_at: new Date().toISOString(),
        execution_count: (await supabase
          .from('crm_contact_flows')
          .select('execution_count')
          .eq('id', contact_flow_id)
          .single()).data?.execution_count + 1 || 1
      })
      .eq('id', contact_flow_id);

    console.log(`Flow execution completed: ${finalStatus}`);

    return new Response(JSON.stringify({
      success: !hasError,
      execution_id: execution.id,
      status: finalStatus,
      nodes_executed: nodesExecuted.length,
      error: errorMessage || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error running flow:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function updateExecution(
  supabase: any, 
  executionId: string, 
  status: string, 
  nodesExecuted: any[], 
  errorMessage: string | null
) {
  await supabase
    .from('crm_flow_executions')
    .update({
      status,
      completed_at: new Date().toISOString(),
      nodes_executed: nodesExecuted,
      error_message: errorMessage
    })
    .eq('id', executionId);
}

async function executeNode(supabase: any, node: any, contact: any, contactId: string) {
  const config = node.config || {};
  
  switch (node.node_type) {
    case 'trigger':
      // Trigger nodes just start the flow
      return { triggered: true };
      
    case 'action':
      return await executeActionNode(supabase, config, contact, contactId);
      
    case 'condition':
      // Evaluate condition
      return { evaluated: true, passed: evaluateCondition(config, contact) };
      
    case 'delay':
      // For manual runs, we skip delays
      return { skipped: true, reason: 'Delays skipped in manual execution' };
      
    case 'ai':
      // AI node - would call AI service
      return { ai_processed: true, note: 'AI processing simulated for manual run' };
      
    default:
      return { executed: true };
  }
}

async function executeActionNode(supabase: any, config: any, contact: any, contactId: string) {
  const actionType = config.action_type || config.type;
  
  switch (actionType) {
    case 'create_task':
      const { error: taskError } = await supabase.from('crm_tasks').insert({
        contact_id: contactId,
        title: config.task_title || config.title || 'Task from flow',
        description: config.task_description || config.description,
        priority: config.priority || 'medium',
        task_type: config.task_type || 'follow_up',
        ai_generated: true,
        ai_reason: 'Created by manual flow execution'
      });
      if (taskError) throw taskError;
      return { task_created: true };
      
    case 'update_lifecycle':
      const { error: lifecycleError } = await supabase
        .from('crm_contacts')
        .update({ lifecycle_stage: config.lifecycle_stage || config.stage })
        .eq('id', contactId);
      if (lifecycleError) throw lifecycleError;
      return { lifecycle_updated: true, new_stage: config.lifecycle_stage || config.stage };
      
    case 'add_tag':
      const currentTags = contact?.tags || [];
      const newTag = config.tag || config.tag_name;
      if (newTag && !currentTags.includes(newTag)) {
        const { error: tagError } = await supabase
          .from('crm_contacts')
          .update({ tags: [...currentTags, newTag] })
          .eq('id', contactId);
        if (tagError) throw tagError;
      }
      return { tag_added: newTag };
      
    case 'update_score':
      const scoreField = config.score_type || 'engagement_score';
      const scoreValue = config.score_value || config.value || 0;
      const { error: scoreError } = await supabase
        .from('crm_contacts')
        .update({ [scoreField]: scoreValue })
        .eq('id', contactId);
      if (scoreError) throw scoreError;
      return { score_updated: true, field: scoreField, value: scoreValue };
      
    default:
      return { action_type: actionType, note: 'Action type not fully implemented' };
  }
}

function evaluateCondition(config: any, contact: any): boolean {
  const field = config.field;
  const operator = config.operator;
  const value = config.value;
  
  if (!field || !operator) return true;
  
  const contactValue = contact?.[field];
  
  switch (operator) {
    case 'equals':
      return contactValue === value;
    case 'not_equals':
      return contactValue !== value;
    case 'greater_than':
      return Number(contactValue) > Number(value);
    case 'less_than':
      return Number(contactValue) < Number(value);
    case 'contains':
      return String(contactValue).includes(String(value));
    default:
      return true;
  }
}
