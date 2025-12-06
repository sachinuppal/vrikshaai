import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IngestRequest {
  // Contact identification (at least one required)
  phone?: string;
  email?: string;
  contact_id?: string;

  // Interaction details
  channel: string; // voice_ai, voice_human, whatsapp, sms, email, telegram, web, meeting
  direction: string; // inbound, outbound
  content: string; // raw message/transcript
  summary?: string;

  // Optional metadata
  duration_seconds?: number;
  recording_url?: string;
  occurred_at?: string;
  source_type?: string;
  source_id?: string;

  // Contact updates (optional)
  contact_updates?: {
    full_name?: string;
    company_name?: string;
    user_type?: string;
    primary_industry?: string;
  };

  // Variables to extract (optional - will use AI if not provided)
  variables?: Array<{
    name: string;
    value: string;
    type?: string;
    confidence?: number;
  }>;

  // Skip AI analysis
  skip_ai_analysis?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: IngestRequest = await req.json();

    console.log("Ingesting interaction:", {
      channel: body.channel,
      direction: body.direction,
      contact_id: body.contact_id,
      phone: body.phone,
      email: body.email,
    });

    // Validate required fields
    if (!body.channel || !body.direction || !body.content) {
      return new Response(
        JSON.stringify({ error: "channel, direction, and content are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.contact_id && !body.phone && !body.email) {
      return new Response(
        JSON.stringify({ error: "At least one of contact_id, phone, or email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find or create contact
    let contactId = body.contact_id;
    let isNewContact = false;

    if (!contactId) {
      // Try to find by phone first, then email
      if (body.phone) {
        const { data } = await supabase
          .from("crm_contacts")
          .select("id")
          .eq("phone", body.phone)
          .maybeSingle();
        if (data) contactId = data.id;
      }

      if (!contactId && body.email) {
        const { data } = await supabase
          .from("crm_contacts")
          .select("id")
          .eq("email", body.email)
          .maybeSingle();
        if (data) contactId = data.id;
      }

      // Create new contact if not found
      if (!contactId) {
        const newContactData = {
          phone: body.phone || null,
          email: body.email || null,
          full_name: body.contact_updates?.full_name || null,
          company_name: body.contact_updates?.company_name || null,
          user_type: body.contact_updates?.user_type || "general",
          primary_industry: body.contact_updates?.primary_industry || null,
          lifecycle_stage: "lead",
          source: body.channel,
          last_interaction_at: body.occurred_at || new Date().toISOString(),
          last_channel: body.channel,
          total_interactions: 1,
        };

        const { data: newContact, error: createError } = await supabase
          .from("crm_contacts")
          .insert(newContactData)
          .select("id")
          .single();

        if (createError) {
          throw new Error(`Failed to create contact: ${createError.message}`);
        }

        contactId = newContact.id;
        isNewContact = true;
        console.log("Created new contact:", contactId);
      }
    }

    // Run AI analysis if not skipped
    let aiAnalysis: any = null;
    let sentiment: string | null = null;
    let sentimentScore: number | null = null;
    let intentDetected: string[] = [];
    let entitiesExtracted: any = {};

    if (!body.skip_ai_analysis && body.content.length > 20) {
      try {
        aiAnalysis = await analyzeInteraction(body.content, body.channel);
        sentiment = aiAnalysis.sentiment;
        sentimentScore = aiAnalysis.sentiment_score;
        intentDetected = aiAnalysis.intents || [];
        entitiesExtracted = aiAnalysis.entities || {};
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        // Continue without AI analysis
      }
    }

    // Create interaction
    const interactionData = {
      contact_id: contactId,
      channel: body.channel,
      direction: body.direction,
      summary: body.summary || aiAnalysis?.summary || null,
      raw_content: { text: body.content },
      sentiment,
      sentiment_score: sentimentScore,
      intent_detected: intentDetected,
      entities_extracted: entitiesExtracted,
      ai_insights: aiAnalysis,
      duration_seconds: body.duration_seconds,
      recording_url: body.recording_url,
      source_type: body.source_type,
      source_id: body.source_id,
      occurred_at: body.occurred_at || new Date().toISOString(),
    };

    const { data: interaction, error: interactionError } = await supabase
      .from("crm_interactions")
      .insert(interactionData)
      .select("id")
      .single();

    if (interactionError) {
      throw new Error(`Failed to create interaction: ${interactionError.message}`);
    }

    console.log("Created interaction:", interaction.id);

    // Extract and store variables
    const variablesToStore = body.variables || extractVariablesFromAnalysis(aiAnalysis);
    if (variablesToStore.length > 0) {
      const variableRecords = variablesToStore.map((v) => ({
        contact_id: contactId,
        variable_name: v.name,
        variable_value: v.value,
        variable_type: v.type || "text",
        source_channel: body.channel,
        source_interaction_id: interaction.id,
        confidence: v.confidence || 0.8,
      }));

      // Mark old variables as superseded
      const variableNames = variablesToStore.map((v) => v.name);
      await supabase
        .from("crm_variables")
        .update({ is_current: false })
        .eq("contact_id", contactId)
        .in("variable_name", variableNames);

      // Insert new variables
      await supabase.from("crm_variables").insert(variableRecords);
      console.log(`Stored ${variableRecords.length} variables`);
    }

    // Update contact
    const contactUpdate: any = {
      last_interaction_at: body.occurred_at || new Date().toISOString(),
      last_channel: body.channel,
      updated_at: new Date().toISOString(),
    };

    if (body.contact_updates) {
      Object.assign(contactUpdate, body.contact_updates);
    }

    // Increment total_interactions
    const { data: currentContact } = await supabase
      .from("crm_contacts")
      .select("total_interactions")
      .eq("id", contactId)
      .single();

    contactUpdate.total_interactions = (currentContact?.total_interactions || 0) + 1;

    await supabase.from("crm_contacts").update(contactUpdate).eq("id", contactId);

    // TODO: Trigger score recomputation
    // TODO: Evaluate triggers

    return new Response(
      JSON.stringify({
        success: true,
        contact_id: contactId,
        interaction_id: interaction.id,
        is_new_contact: isNewContact,
        variables_extracted: variablesToStore.length,
        ai_analysis_performed: !!aiAnalysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Ingestion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeInteraction(content: string, channel: string): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const systemPrompt = `You are an AI assistant analyzing customer interactions for a CRM system.
Analyze the following ${channel} interaction and extract:
1. Overall sentiment (positive, negative, neutral, mixed) and a score from -1 to 1
2. Customer intents (e.g., inquiry, complaint, purchase_intent, support, feedback, scheduling)
3. Key entities mentioned (names, dates, amounts, products, locations, companies)
4. A brief summary (1-2 sentences)
5. Any variables that should be tracked (budget, timeline, requirements, pain_points)

Return JSON with this structure:
{
  "sentiment": "positive|negative|neutral|mixed",
  "sentiment_score": 0.5,
  "intents": ["inquiry", "purchase_intent"],
  "entities": { "budget": "$50k", "timeline": "Q1 2024" },
  "summary": "Customer inquired about...",
  "variables": [
    { "name": "budget", "value": "$50k", "confidence": 0.9 },
    { "name": "timeline", "value": "Q1 2024", "confidence": 0.8 }
  ]
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this ${channel} interaction:\n\n${content}` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const result = await response.json();
  const analysisText = result.choices?.[0]?.message?.content;

  try {
    return JSON.parse(analysisText);
  } catch {
    return { summary: "Analysis parsing failed" };
  }
}

function extractVariablesFromAnalysis(analysis: any): Array<{ name: string; value: string; type?: string; confidence?: number }> {
  if (!analysis?.variables) return [];
  return analysis.variables.filter((v: any) => v.name && v.value);
}
