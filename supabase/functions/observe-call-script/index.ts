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

    // Call Lovable AI (Gemini) for analysis
    const analysisPrompt = `You are an AI Call Quality Analyst for Vriksha.ai. Your task is to compare a call transcript against the expected script/prompt to evaluate how well the AI agent followed the script.

EXPECTED SCRIPT/PROMPT:
${VRIKSHA_SCRIPT}

ACTUAL CALL TRANSCRIPT:
${transcriptText}

Analyze the call and return a JSON response with EXACTLY this structure:
{
  "overall_score": <number 0-100>,
  "status": "<'compliant' if score >= 80, 'partial' if score 50-79, 'non_compliant' if score < 50>",
  "sections_covered": [
    {
      "section": "<section name like 'Entry Classification', 'Identity Capture', 'Founder Section', etc.>",
      "covered": <boolean>,
      "compliance_score": <number 0-100>,
      "questions_asked": ["<list of questions that were asked>"],
      "questions_missed": ["<list of questions that should have been asked but weren't>"]
    }
  ],
  "tone_analysis": {
    "professional": <boolean>,
    "empathetic": <boolean>,
    "clear": <boolean>
  },
  "guardrail_violations": ["<list any instances where the agent answered outside context or violated guidelines>"],
  "language_compliance": <boolean - did agent maintain consistent language>,
  "strengths": ["<list of things done well>"],
  "improvements": ["<list of actionable improvements>"],
  "summary": "<2-3 sentence summary of the call quality>"
}

Important:
- Be thorough but fair in your assessment
- Only mark sections as not covered if they were relevant to the user type
- Consider the flow and natural conversation when evaluating
- Return ONLY valid JSON, no markdown or extra text`;

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
