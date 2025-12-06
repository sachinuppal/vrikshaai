import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert CRM automation flow builder. Your role is to help users create multi-channel communication workflows through natural conversation.

## Your Capabilities
You can create flows with these node types:

### Triggers (Start Points)
- api_trigger: Triggered by external API calls
- schedule_trigger: Triggered on a schedule
- event_trigger: Triggered by CRM events (new lead, score change, etc.)

### Routers (Decision Points)
- channel_router: Route based on preferred channel
- conditional: Route based on conditions
- score_router: Route based on engagement/intent scores

### Channel Actions
- sms_message: Send SMS
- whatsapp_message: Send WhatsApp message
- voice_call: Initiate voice call
- email_action: Send email

### AI Actions
- ai_conversation: AI-powered conversation
- ai_action: AI decision making
- ai_classify: Classify input

### Utility Actions
- counter: Track counts
- http_request: Make HTTP requests
- delay: Wait before continuing
- update_contact: Update contact fields

### End Points
- end_conversation: End the flow
- queue_transfer: Transfer to human agent

## Response Format
When the user describes a flow, respond with your thinking process, then generate the flow structure.

Always think step by step:
1. Understand the business goal
2. Identify required channels
3. Plan the flow structure
4. Generate nodes and edges

Be friendly and ask clarifying questions when needed.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'thinking';
  content: string;
}

interface FlowNode {
  id: string;
  node_type: string;
  label: string;
  config: Record<string, any>;
  position_x: number;
  position_y: number;
}

interface FlowEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  label?: string;
  condition?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, session_id, action } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build conversation history for the AI
    const conversationMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: ChatMessage) => ({
        role: m.role === 'thinking' ? 'assistant' : m.role,
        content: m.content
      }))
    ];

    // Call Lovable AI with tool calling for structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: conversationMessages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_flow',
              description: 'Generate a complete flow with nodes and edges based on the user requirements',
              parameters: {
                type: 'object',
                properties: {
                  thinking_steps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Step-by-step thinking process explaining the flow design'
                  },
                  flow_name: {
                    type: 'string',
                    description: 'Suggested name for the flow'
                  },
                  global_prompt: {
                    type: 'string',
                    description: 'Global system prompt for AI nodes in this flow'
                  },
                  nodes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        node_type: { 
                          type: 'string',
                          enum: [
                            'api_trigger', 'schedule_trigger', 'event_trigger',
                            'channel_router', 'conditional', 'score_router',
                            'sms_message', 'whatsapp_message', 'voice_call', 'email_action',
                            'ai_conversation', 'ai_action', 'ai_classify',
                            'counter', 'http_request', 'delay', 'update_contact',
                            'end_conversation', 'queue_transfer'
                          ]
                        },
                        label: { type: 'string' },
                        config: { type: 'object' },
                        position_x: { type: 'number' },
                        position_y: { type: 'number' }
                      },
                      required: ['id', 'node_type', 'label', 'position_x', 'position_y']
                    }
                  },
                  edges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        source_node_id: { type: 'string' },
                        target_node_id: { type: 'string' },
                        label: { type: 'string' },
                        condition: { type: 'object' }
                      },
                      required: ['id', 'source_node_id', 'target_node_id']
                    }
                  }
                },
                required: ['thinking_steps', 'flow_name', 'nodes', 'edges']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'ask_clarification',
              description: 'Ask the user for more details about their requirements',
              parameters: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional list of suggested options'
                  }
                },
                required: ['question']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'modify_flow',
              description: 'Modify an existing flow based on user feedback',
              parameters: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['add_node', 'remove_node', 'modify_node', 'add_edge', 'remove_edge']
                  },
                  target_id: { type: 'string' },
                  changes: { type: 'object' }
                },
                required: ['action']
              }
            }
          }
        ],
        tool_choice: 'auto'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    if (!choice) {
      throw new Error('No response from AI');
    }

    // Check if AI used a tool
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      if (toolName === 'generate_flow') {
        return new Response(JSON.stringify({
          type: 'flow_generated',
          thinking_steps: toolArgs.thinking_steps,
          flow_name: toolArgs.flow_name,
          global_prompt: toolArgs.global_prompt,
          nodes: toolArgs.nodes,
          edges: toolArgs.edges,
          message: `I've designed a flow called "${toolArgs.flow_name}" with ${toolArgs.nodes.length} steps. Would you like me to explain any part or make changes?`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (toolName === 'ask_clarification') {
        return new Response(JSON.stringify({
          type: 'clarification',
          question: toolArgs.question,
          options: toolArgs.options || [],
          message: toolArgs.question
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (toolName === 'modify_flow') {
        return new Response(JSON.stringify({
          type: 'flow_modified',
          action: toolArgs.action,
          target_id: toolArgs.target_id,
          changes: toolArgs.changes,
          message: `I'll ${toolArgs.action.replace('_', ' ')} as requested.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Regular text response
    return new Response(JSON.stringify({
      type: 'message',
      message: choice.message.content
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crm-agentic-builder:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
