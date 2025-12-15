import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCRIPT_SECTIONS = [
  "identity_framing",
  "objectives",
  "conversation_contract",
  "operating_context",
  "stt_instructions",
  "tts_instructions",
  "turn_taking",
  "task_logic",
  "core_flows",
  "guardrails",
  "knowledge_grounding",
  "faq_pack",
  "compliance_policy",
  "ux_guidelines",
  "output_formats",
  "testing_config",
  "deployment_config",
  "usage_guidelines",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, currentScript, messageHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Script Studio Chat - Session:", sessionId);
    console.log("User message:", message);

    const systemPrompt = `You are an expert voice agent script builder assistant. Your role is to help users create comprehensive voice agent scripts following the 18-section framework.

## The 18 Sections Framework:
1. Identity & Framing - Agent name, role, brand voice, persona boundaries
2. Objectives & Success Criteria - Primary/secondary goals, non-goals, success metrics
3. Conversation Contract - Consent, privacy, safety notes, user control cues
4. Operating Context - Tools/APIs, data fields, environment assumptions
5. STT Instructions - Language detection, entity extraction, error handling
6. TTS Instructions - Speaking style, prosody, pronunciation
7. Turn-Taking & Dialogue - Barge-in, backchanneling, silence policy
8. Task Logic - Intent taxonomy, slot schema, decision tree
9. Core Call Flows - Happy path, alternates, edge cases, escalation
10. Guardrails & Safety - Hard bans, PII rules, no-hallucination
11. Knowledge & Grounding - Knowledge sources, citation rules
12. FAQ Pack - Top FAQs, objection handling
13. Compliance & Policy - Regulatory requirements, disclaimers
14. UX Guidelines - Empathy, clarity, choice architecture
15. Output Formats - Structured outputs, summaries, templates
16. Testing & Evaluation - Test sets, rubrics
17. Deployment Config - Voice selection, latency constraints
18. Usage Guidelines - Team update rules, versioning

## Your Capabilities:
- Generate complete scripts from use case descriptions
- Populate specific sections based on user requests
- Identify logical flaws in conversation flows
- Suggest improvements and best practices
- Create flowchart node structures for visualization

## Response Format:
Always respond with JSON containing:
{
  "message": "Your conversational response to the user",
  "scriptUpdates": { // Optional: updates to script sections
    "name": "Script name if changed",
    "description": "Description if changed",
    "useCase": "Use case category",
    "industry": "Industry",
    "sections": [ // Array of section updates
      {
        "id": "section_id",
        "content": { ...section specific content },
        "isComplete": true/false
      }
    ]
  },
  "flowchartNodes": [ // Optional: flowchart structure
    {
      "id": "unique_id",
      "type": "start|end|step|decision|action|tool|guardrail",
      "label": "Node label",
      "description": "Optional description",
      "position": { "x": number, "y": number },
      "connections": ["target_node_ids"]
    }
  ],
  "metadata": {
    "type": "script_update|flowchart_update|recommendation|flaw_detected",
    "affectedSections": ["section_ids"]
  }
}

Current Script State:
${JSON.stringify(currentScript, null, 2)}

Be helpful, specific, and always think about edge cases and safety when building voice agent scripts.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...messageHistory.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from AI");
    }

    console.log("AI Response:", aiContent);

    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch (e) {
      // If JSON parsing fails, return as plain message
      parsed = {
        message: aiContent,
        metadata: { type: "general" },
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Script Studio Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
