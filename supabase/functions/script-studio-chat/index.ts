import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCRIPT_SECTIONS = [
  { id: "identity_framing", name: "Identity & Framing" },
  { id: "objectives", name: "Objectives & Success Criteria" },
  { id: "conversation_contract", name: "Conversation Contract" },
  { id: "operating_context", name: "Operating Context" },
  { id: "stt_instructions", name: "STT Instructions" },
  { id: "tts_instructions", name: "TTS Instructions" },
  { id: "turn_taking", name: "Turn-Taking & Dialogue" },
  { id: "task_logic", name: "Task Logic" },
  { id: "core_flows", name: "Core Call Flows" },
  { id: "guardrails", name: "Guardrails & Safety" },
  { id: "knowledge_grounding", name: "Knowledge & Grounding" },
  { id: "faq_pack", name: "FAQ Pack" },
  { id: "compliance_policy", name: "Compliance & Policy" },
  { id: "ux_guidelines", name: "UX Guidelines" },
  { id: "output_formats", name: "Output Formats" },
  { id: "testing_config", name: "Testing & Evaluation" },
  { id: "deployment_config", name: "Deployment Config" },
  { id: "usage_guidelines", name: "Usage Guidelines" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, currentScript, messageHistory, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Script Studio Chat - Session:", sessionId);
    console.log("User message:", message);
    console.log("Action:", action);

    const isFlowchartGeneration = action === "generate_flowchart";

    // Detect if this is a raw script import (large text block)
    const isScriptImport = message.length > 500 && 
      (message.toLowerCase().includes("convert") || 
       message.toLowerCase().includes("existing script") ||
       message.toLowerCase().includes("parse") ||
       message.includes("If they say") ||
       message.includes("Agent:") ||
       message.includes("User:"));

    const systemPrompt = `You are an expert voice agent script builder assistant. Your role is to help users create comprehensive voice agent scripts following the 18-section framework.

## The 18 Sections Framework:
${SCRIPT_SECTIONS.map((s, i) => `${i + 1}. ${s.name} (id: "${s.id}")`).join("\n")}

### Section Content Guidelines:
For each section, provide COMPLETE and DETAILED content. Here's what each section should contain:

1. **identity_framing**: agent_name, role, brand_voice, persona_boundaries, greeting_template
2. **objectives**: primary_goal, secondary_goals, non_goals, success_metrics
3. **conversation_contract**: consent_script, privacy_notice, user_control_cues, opt_out_path
4. **operating_context**: available_tools, data_fields, environment_assumptions, integration_notes
5. **stt_instructions**: language_detection, entity_extraction, error_handling, accent_handling
6. **tts_instructions**: speaking_style, prosody, pronunciation_rules, pause_patterns
7. **turn_taking**: barge_in_policy, backchanneling, silence_threshold, interruption_handling
8. **task_logic**: intent_taxonomy, slot_schema, decision_tree, validation_rules
9. **core_flows**: happy_path, alternate_paths, edge_cases, escalation_triggers
10. **guardrails**: hard_bans, pii_rules, topic_restrictions, safety_responses
11. **knowledge_grounding**: knowledge_sources, citation_rules, fallback_responses
12. **faq_pack**: common_questions, objection_handling, clarification_responses
13. **compliance_policy**: regulatory_requirements, disclaimers, recording_notices
14. **ux_guidelines**: empathy_cues, clarity_rules, choice_architecture
15. **output_formats**: summary_template, handoff_format, logging_schema
16. **testing_config**: test_scenarios, evaluation_rubrics, edge_case_tests
17. **deployment_config**: voice_selection, latency_constraints, fallback_behavior
18. **usage_guidelines**: update_procedures, versioning_rules, team_access

## Your Capabilities:
- Generate complete scripts from use case descriptions
- Populate ALL 18 sections with detailed, actionable content
- Parse and convert existing unstructured scripts into the 18-section format
- Identify logical flaws in conversation flows
- Suggest improvements and best practices
- Create flowchart node structures for visualization

${isScriptImport ? `
## IMPORTANT - Script Import Mode:
The user is importing an existing script. You MUST:
1. Parse the entire content carefully
2. Extract and organize ALL information into the 18 sections
3. Fill in every section with relevant content from the script
4. For sections without explicit content, infer logical defaults
5. Generate a comprehensive flowchart from the conversation flows
6. Mark all sections as complete (isComplete: true) where you've added content
` : ""}

${isFlowchartGeneration ? `
## FLOWCHART GENERATION MODE - CRITICAL INSTRUCTIONS
You are generating a comprehensive flowchart based on the script content. Analyze ALL completed sections carefully.

Create nodes for each of these categories:
1. **start**: Opening/greeting from identity_framing section
2. **guardrail**: Consent, disclosures, safety checks from compliance_policy and guardrails sections
3. **decision**: All branch points and conditional logic from task_logic and core_flows sections
4. **action**: Operations and business logic from task_logic section
5. **tool**: API calls, database lookups, integrations from operating_context section
6. **step**: Conversation steps, dialogue turns from core_flows section
7. **end**: Wrap-up, goodbye, call termination points

Guidelines for node generation:
- Position nodes vertically (y increases by ~120 for sequence)
- Use x offset for parallel branches (left branch: x-100, right branch: x+100)
- Each node MUST have: id (unique), type, label, position {x, y}, connections (array of target node ids)
- Create at least 10-15 nodes for a comprehensive flowchart
- Include error handling paths and fallback nodes
- Connect all nodes properly - every node except 'end' should have at least one connection

IMPORTANT: Focus ONLY on generating flowchartNodes. Include a brief message but put all effort into creating a detailed, accurate flowchart based on the script content.
` : ""}

## Response Format:
Always respond with valid JSON containing:
{
  "message": "Your conversational response to the user",
  "scriptUpdates": {
    "name": "Script name",
    "description": "Script description",
    "useCase": "Use case category",
    "industry": "Industry",
    "sections": [
      {
        "id": "section_id",
        "name": "Section Name",
        "content": { 
          // Section-specific fields with COMPLETE content
        },
        "isComplete": true
      }
    ]
  },
  "flowchartNodes": [
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

CRITICAL: When generating sections, ALWAYS include the "name" field for each section, and set "isComplete": true when you've added meaningful content.

Current Script State:
${JSON.stringify(currentScript, null, 2)}

Be helpful, specific, and always think about edge cases and safety when building voice agent scripts. Generate COMPLETE content for all relevant sections.`;

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

    console.log("AI Response received, length:", aiContent.length);

    let parsed;
    try {
      parsed = JSON.parse(aiContent);
      
      // Ensure sections have proper structure
      if (parsed.scriptUpdates?.sections) {
        parsed.scriptUpdates.sections = parsed.scriptUpdates.sections.map((section: any) => {
          const sectionDef = SCRIPT_SECTIONS.find(s => s.id === section.id);
          return {
            ...section,
            name: section.name || sectionDef?.name || section.id,
            isComplete: section.isComplete ?? (section.content && Object.keys(section.content).length > 0),
          };
        });
      }
    } catch (e) {
      console.error("JSON parse error:", e);
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
