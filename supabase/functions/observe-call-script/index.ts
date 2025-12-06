import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VRIKSHA_SCRIPT = `
Introduction and Objective
You are Vriksha, an AI assistant from Vriksha.ai, India's first AI Venture Studio and Accelerator. Your role is to understand the caller's intent, identify their role, capture their details, and guide them to the right Vriksha.ai product or the accelerator.

Response Guidelines
- If the caller expresses confusion or frustration, offer to connect them with a human representative.
- Always maintain a polite and professional tone, ensuring the caller feels heard and understood.
- Provide clear and concise information about Vriksha.ai's products and services.

Beyond Context Guardrail
- Never answer anything outside the current context to the user.
- Never use any knowledge or context from outside the input script and user-provided requirements.
- If the user insists continuously on asking things outside the context, apologise and disconnect the call.

Task Flow:
ENTRY: Classify user type (founder / developer / enterprise / investor / general)

STEP 1: UNIVERSAL IDENTITY CAPTURE
- Ask for name (full_name)
- Ask for contact method - phone or email

HYBRID LOGIC: If user is BOTH Founder & Developer, handle developer background first then startup.

DEVELOPER SECTION:
- developer_role, skills, experience_years, is_independent_or_freelancer, biggest_challenge (technical)

FOUNDER SECTION:
- business_stage, product_or_idea, unique_value, has_company/company_name, sector, team_size
- is_technical_founder, biggest_challenge (founder), mrr_or_arr, current_users
- funding_history, amount_seeking, equity_expectation, founder_goal, timeline_to_start

ENTERPRISE SECTION:
- company_name, position_of_caller, interest_area, use_case_or_problem, sector, founder_goal, timeline_to_start

INVESTOR SECTION:
- investor_type, sector_preference, typical_check_size, investment_range, geography_preference
- interest_in_vriksha_model, decision_timeline

GENERAL USER SECTION:
- interest_area, capture freeform

FINAL STEPS FOR ALL USERS:
- needs_demo, needs_human_followup, follow_up_preference, followup_time_preference

CLOSING LINE:
"Perfect, thank you for sharing all of this. I'll pass your details to the right team and we'll reach out soon. Have a wonderful day."
`;

interface TranscriptEntry {
  role?: string;
  content?: string;
  timestamp?: string;
  bot?: string;
  user?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { call_id, transcript } = await req.json();

    if (!call_id || !transcript) {
      return new Response(
        JSON.stringify({ error: "Missing call_id or transcript" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format transcript for analysis - handle both Ringg bot/user format and role/content format
    let transcriptText = "";
    if (Array.isArray(transcript)) {
      transcriptText = transcript
        .map((entry: TranscriptEntry) => {
          // Handle Ringg's bot/user format
          if (entry.bot) {
            return `Bot: ${entry.bot}`;
          }
          if (entry.user) {
            return `User: ${entry.user}`;
          }
          // Fallback to role/content format
          if (entry.role && entry.content) {
            return `${entry.role}: ${entry.content}`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n");
    } else if (typeof transcript === "string") {
      transcriptText = transcript;
    } else {
      transcriptText = JSON.stringify(transcript, null, 2);
    }

    // Validate transcript is not empty
    if (!transcriptText || transcriptText.trim().length === 0) {
      console.error("Transcript is empty after parsing:", JSON.stringify(transcript));
      throw new Error("Failed to parse transcript - no content found");
    }

    console.log("Analyzing transcript for call:", call_id);
    console.log("Transcript length:", transcriptText.length);

    // Update status to analyzing
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase
      .from("voice_widget_calls")
      .update({ observability_status: "analyzing" })
      .eq("id", call_id);

    // Call Lovable AI (Gemini) for analysis with conditional path detection and semantic matching
    const analysisPrompt = `You are an AI Call Quality Analyst for Vriksha.ai. Your task is to analyze a call transcript using CONDITIONAL PATH DETECTION and SEMANTIC MATCHING.

=== EXPECTED SCRIPT/PROMPT ===
${VRIKSHA_SCRIPT}

=== ACTUAL CALL TRANSCRIPT ===
${transcriptText}

=== ANALYSIS INSTRUCTIONS ===

STEP 1: DETECT USER TYPE
First, analyze the transcript to determine what type of user the caller is:
- "founder" - startup founder, entrepreneur, building a company
- "developer" - software developer, engineer, technical person
- "enterprise" - corporate representative, enterprise customer, procurement, business development
- "investor" - VC, angel investor, LP, fund manager
- "general" - doesn't fit other categories, general inquiry
- "hybrid" - both founder AND developer (technical founder)

Look for explicit mentions or contextual clues:
- "I'm the CTO at..." → enterprise or developer
- "I'm building a startup..." → founder
- "I work at [big company]..." → enterprise
- "I'm a developer looking for..." → developer
- "I'm interested in investing..." → investor

STEP 2: DETERMINE APPLICABLE SECTIONS
Based on user type, only these sections should be evaluated:

MANDATORY FOR ALL:
- Introduction and Objective
- Entry Classification
- Universal Identity Capture
- Final Steps for All Users
- Closing Line

CONDITIONAL (only if user type matches):
- Founder Section → ONLY for "founder" or "hybrid"
- Developer Section → ONLY for "developer" or "hybrid"
- Enterprise Section → ONLY for "enterprise"
- Investor Section → ONLY for "investor"
- General User Section → ONLY for "general"

STEP 3: SEMANTIC MATCHING (CRITICAL!)
Do NOT do exact phrase matching. Use SEMANTIC analysis:

✅ CREDIT the agent if:
- The ESSENCE of a question was conveyed (different wording is fine)
- User VOLUNTEERED information without being asked
- Data point was CAPTURED through natural conversation
- Question was asked differently but achieved same goal

Example matches:
- Script: "Ask for company_name" → Agent: "Which organization are you calling from?" → ✅ MATCH
- Script: "Ask for position_of_caller" → User volunteers "I'm the Head of Procurement" → ✅ MATCH (user-initiated)
- Script: "Ask for use_case_or_problem" → Agent: "What challenges are you looking to solve?" → ✅ MATCH

❌ DO NOT penalize if:
- Section is not applicable to user type
- Information was obtained through natural flow
- Question wording differs but intent matches

STEP 4: RETURN JSON RESPONSE
Return ONLY this JSON structure:

{
  "detected_user_type": "<founder|developer|enterprise|investor|general|hybrid>",
  "user_type_evidence": "<brief explanation of why this user type was detected>",
  "applicable_sections": ["<list of section names that SHOULD be evaluated based on user type>"],
  "skipped_sections": [
    {"section": "<section name>", "reason": "<why it was skipped - e.g., 'User is enterprise, not a founder'>"}
  ],
  "overall_score": <number 0-100 - calculated ONLY from applicable sections>,
  "status": "<'compliant' if score >= 80, 'partial' if score 50-79, 'non_compliant' if score < 50>",
  "sections_covered": [
    {
      "section": "<section name>",
      "applicable": true,
      "covered": <boolean - was the section addressed>,
      "compliance_score": <number 0-100>,
      "semantic_match": <boolean - did agent capture intent/essence>,
      "key_intents_captured": ["<list of data points/intents that were successfully captured>"],
      "key_intents_missed": ["<list of data points/intents that were NOT captured>"],
      "notes": "<optional brief explanation>"
    }
  ],
  "tone_analysis": {
    "professional": <boolean>,
    "empathetic": <boolean>,
    "clear": <boolean>
  },
  "guardrail_violations": ["<list any instances where agent answered outside context>"],
  "language_compliance": <boolean>,
  "strengths": ["<list of things done well>"],
  "improvements": ["<list of actionable improvements - only for APPLICABLE sections>"],
  "summary": "<2-3 sentence summary focusing on applicable sections and semantic performance>"
}

IMPORTANT SCORING RULES:
- Calculate overall_score ONLY from applicable sections (ignore skipped sections)
- Use semantic matching - give credit for intent, not exact wording
- If user volunteered info, credit the agent for capturing it
- Short calls with limited scope should still score well if they handled what was covered correctly
- Do NOT mark skipped sections as 0% - they should NOT be in sections_covered

Return ONLY valid JSON, no markdown or extra text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        await supabase
          .from("voice_widget_calls")
          .update({ observability_status: "error" })
          .eq("id", call_id);
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response received, parsing...");

    // Parse the JSON response
    let analysis;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      analysis = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI analysis response");
    }

    // Store the analysis in the database
    const { error: updateError } = await supabase
      .from("voice_widget_calls")
      .update({
        observability_analysis: analysis,
        observability_status: analysis.status || "partial",
      })
      .eq("id", call_id);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(`Failed to store analysis: ${updateError.message}`);
    }

    console.log("Analysis stored successfully for call:", call_id);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in observe-call-script:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
