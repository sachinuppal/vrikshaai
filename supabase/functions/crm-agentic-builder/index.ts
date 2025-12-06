import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an expert CRM automation flow builder. Your PRIMARY goal is to IMMEDIATELY generate complete, working flows based on user requests. Do NOT ask clarifying questions unless absolutely necessary.

## CRITICAL BEHAVIOR
- When a user describes ANY automation, IMMEDIATELY generate a complete flow using the generate_flow tool
- Make reasonable assumptions for missing details based on industry best practices
- Only use ask_clarification for truly ambiguous requests (rare)
- After generating a flow, offer to refine it

## Industry Knowledge & Patterns

### Lead Qualification (BANT Framework)
- Trigger: api_trigger (HTTP request with caller info)
- Use ai_conversation to gather: Budget, Authority, Need, Timeline
- Use conditional router to qualify/disqualify
- Use http_request to POST qualified leads to API
- End with appropriate outcome

### Appointment Booking
- Trigger: event_trigger (incoming call)
- Use ai_conversation to collect: name, date/time preference, contact info
- Use conditional to check availability
- Use http_request to book in calendar API
- Send sms_message confirmation

### Customer Support
- Trigger: event_trigger (incoming call)
- Use ai_conversation to identify issue
- Use ai_classify to categorize (billing, technical, general)
- Use conditional router based on category
- Either resolve with ai_conversation or queue_transfer

### E-Commerce Order Tracking
- Trigger: event_trigger (incoming call)
- Use ai_conversation to get order number/email
- Use http_request to fetch order status from Shopify
- Use ai_conversation to relay status
- Use sms_message to send tracking link

### Payment Reminders
- Trigger: api_trigger (HTTP with customer info, debt amount)
- Use voice_call to notify customer
- Use ai_conversation to discuss payment options
- Use http_request to log payment commitment
- Schedule follow-up with delay node

### Feedback Survey
- Trigger: api_trigger (HTTP with customer info)
- Use voice_call to initiate outbound call
- Use ai_conversation to conduct survey (ratings 1-5, open questions)
- Use http_request to POST survey results
- Thank and end conversation

### Interview & Screening
- Trigger: api_trigger (HTTP with candidate info)
- Use ai_conversation for eligibility questions
- Use conditional to check qualifications
- Use http_request to update ATS
- Either schedule interview or politely decline

## Node Types Available

### Triggers (Start Points)
- api_trigger: Triggered by external API calls with payload
- schedule_trigger: Triggered on a schedule (cron)
- event_trigger: Triggered by CRM events (incoming_call, new_lead, score_change)

### Routers (Decision Points)
- channel_router: Route based on preferred_channel field
- conditional: Route based on conditions (if/else)
- score_router: Route based on engagement/intent scores

### Channel Actions
- sms_message: Send SMS with template
- whatsapp_message: Send WhatsApp message
- voice_call: Initiate outbound voice call
- email_action: Send email

### AI Actions
- ai_conversation: Full AI-powered voice/text conversation (the main workhorse)
- ai_action: Single AI decision/action
- ai_classify: Classify input into categories

### Utility Actions
- counter: Track counts/attempts
- http_request: Make HTTP requests to external APIs
- delay: Wait X minutes/hours/days before continuing
- update_contact: Update contact fields in CRM

### End Points
- end_conversation: End the flow gracefully
- queue_transfer: Transfer to human agent queue

## Flow Generation Guidelines

1. ALWAYS start with a trigger node at position (400, 80)
2. Space nodes vertically by 140px
3. For branches, offset horizontally by 250px
4. Use meaningful labels (e.g., "Qualify Lead" not "Node 1")
5. Include a global_prompt that sets the AI persona for ai_conversation nodes
6. Generate complete flows with 4-10 nodes typically
7. Always end flows with end_conversation or queue_transfer

## Example Flow Structure
For "lead qualification flow":
1. api_trigger → Receives caller info
2. ai_conversation → Qualifies using BANT questions
3. conditional → Check if score >= 70
4. (Yes) http_request → POST to CRM API
5. (Yes) end_conversation → Thank qualified lead
6. (No) end_conversation → Thank and nurture

REMEMBER: Generate flows IMMEDIATELY. Be decisive. Make smart defaults.`;

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
    const { messages, session_id, force_generate } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing request with', messages.length, 'messages');

    // Build conversation history for the AI
    const conversationMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: ChatMessage) => ({
        role: m.role === 'thinking' ? 'assistant' : m.role,
        content: m.content
      }))
    ];

    // Determine if this is the first real user message (should force flow generation)
    const userMessages = messages.filter((m: ChatMessage) => m.role === 'user');
    const isFirstUserMessage = userMessages.length === 1;
    const shouldForceGenerate = isFirstUserMessage || force_generate;

    console.log('First user message:', isFirstUserMessage, 'Force generate:', shouldForceGenerate);

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
              description: 'Generate a complete flow with nodes and edges. USE THIS IMMEDIATELY when user describes any automation. Do not ask questions first.',
              parameters: {
                type: 'object',
                properties: {
                  thinking_steps: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Brief step-by-step thinking (3-5 steps max)'
                  },
                  flow_name: {
                    type: 'string',
                    description: 'Descriptive name for the flow'
                  },
                  flow_description: {
                    type: 'string',
                    description: 'One-line description of what the flow does'
                  },
                  global_prompt: {
                    type: 'string',
                    description: 'System prompt for AI nodes - defines the AI persona and behavior for voice/text conversations'
                  },
                  nodes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', description: 'Unique ID like node_1, node_2' },
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
                        label: { type: 'string', description: 'Human-readable label for the node' },
                        config: { 
                          type: 'object',
                          description: 'Node-specific configuration (prompts, URLs, conditions, etc.)'
                        },
                        position_x: { type: 'number', description: 'X position on canvas (start at 400)' },
                        position_y: { type: 'number', description: 'Y position on canvas (start at 80, increment by 140)' }
                      },
                      required: ['id', 'node_type', 'label', 'position_x', 'position_y']
                    }
                  },
                  edges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', description: 'Unique edge ID like edge_1' },
                        source_node_id: { type: 'string' },
                        target_node_id: { type: 'string' },
                        label: { type: 'string', description: 'Label for conditional branches (e.g., "Yes", "No", "Qualified")' },
                        condition: { type: 'object', description: 'Condition for this edge path' }
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
              description: 'ONLY use this if the request is completely ambiguous. Prefer generating a flow with reasonable defaults instead.',
              parameters: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Quick-select options (2-4 options)'
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
              description: 'Modify an existing flow based on user feedback after a flow has been generated',
              parameters: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    enum: ['add_node', 'remove_node', 'modify_node', 'add_edge', 'remove_edge', 'regenerate']
                  },
                  target_id: { type: 'string' },
                  changes: { type: 'object' },
                  new_nodes: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'New nodes to add (for add_node action)'
                  },
                  new_edges: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'New edges to add'
                  }
                },
                required: ['action']
              }
            }
          }
        ],
        // Force generate_flow on first message
        tool_choice: shouldForceGenerate 
          ? { type: 'function', function: { name: 'generate_flow' } }
          : 'auto'
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

    console.log('AI response received, tool_calls:', choice.message.tool_calls?.length || 0);

    // Check if AI used a tool
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const toolName = toolCall.function.name;
      
      let toolArgs;
      try {
        toolArgs = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error('Failed to parse tool arguments:', e);
        throw new Error('Invalid tool response from AI');
      }

      console.log('Tool used:', toolName);

      if (toolName === 'generate_flow') {
        // Ensure proper positioning if not provided
        const nodes = (toolArgs.nodes || []).map((n: any, i: number) => ({
          ...n,
          id: n.id || `node_${i + 1}`,
          config: n.config || {},
          position_x: n.position_x ?? 400,
          position_y: n.position_y ?? (80 + i * 140)
        }));

        const edges = (toolArgs.edges || []).map((e: any, i: number) => ({
          ...e,
          id: e.id || `edge_${i + 1}`
        }));

        console.log('Generated flow with', nodes.length, 'nodes and', edges.length, 'edges');

        return new Response(JSON.stringify({
          type: 'flow_generated',
          thinking_steps: toolArgs.thinking_steps || [],
          flow_name: toolArgs.flow_name || 'New Flow',
          flow_description: toolArgs.flow_description || '',
          global_prompt: toolArgs.global_prompt || '',
          nodes,
          edges,
          message: `I've created "${toolArgs.flow_name}" with ${nodes.length} steps. The flow is ready on the canvas. Want me to adjust anything?`
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
          new_nodes: toolArgs.new_nodes,
          new_edges: toolArgs.new_edges,
          message: `I'll ${toolArgs.action.replace(/_/g, ' ')} as requested. Check the canvas for updates.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Regular text response (shouldn't happen often with forced tool_choice)
    return new Response(JSON.stringify({
      type: 'message',
      message: choice.message.content || 'I understand. Let me help you build that flow. Could you describe what you want the automation to do?'
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
