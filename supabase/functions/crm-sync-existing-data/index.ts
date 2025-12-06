import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoiceWidgetCall {
  id: string;
  name: string;
  phone: string;
  country_code: string;
  full_phone: string;
  page_url: string | null;
  call_status: string | null;
  call_duration: number | null;
  recording_url: string | null;
  transcript: any;
  client_analysis: any;
  platform_analysis: any;
  observability_analysis: any;
  created_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { dry_run = false } = await req.json().catch(() => ({}));

    console.log("Starting CRM data sync from voice_widget_calls...", { dry_run });

    // Fetch all voice_widget_calls
    const { data: calls, error: callsError } = await supabase
      .from("voice_widget_calls")
      .select("*")
      .order("created_at", { ascending: true });

    if (callsError) {
      throw new Error(`Failed to fetch voice_widget_calls: ${callsError.message}`);
    }

    console.log(`Found ${calls?.length || 0} voice widget calls to process`);

    const stats = {
      total_calls: calls?.length || 0,
      contacts_created: 0,
      contacts_updated: 0,
      interactions_created: 0,
      variables_extracted: 0,
      errors: [] as string[],
    };

    for (const call of calls || []) {
      try {
        await processCall(supabase, call as VoiceWidgetCall, stats, dry_run);
      } catch (err) {
        const errorMsg = `Error processing call ${call.id}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    // Also sync lead_submissions
    const { data: leads, error: leadsError } = await supabase
      .from("lead_submissions")
      .select("*")
      .order("created_at", { ascending: true });

    if (!leadsError && leads) {
      console.log(`Found ${leads.length} lead submissions to process`);
      for (const lead of leads) {
        try {
          await processLead(supabase, lead, stats, dry_run);
        } catch (err) {
          const errorMsg = `Error processing lead ${lead.id}: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          stats.errors.push(errorMsg);
        }
      }
    }

    console.log("CRM sync completed", stats);

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CRM sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processCall(
  supabase: any,
  call: VoiceWidgetCall,
  stats: any,
  dryRun: boolean
) {
  const phone = call.full_phone || call.phone;
  if (!phone) {
    console.log(`Skipping call ${call.id}: no phone number`);
    return;
  }

  // Extract data from client_analysis
  const clientAnalysis = call.client_analysis || {};
  const platformAnalysis = call.platform_analysis || {};
  const observabilityAnalysis = call.observability_analysis || {};

  // Determine user type and industry from analysis
  const userType = detectUserType(clientAnalysis, observabilityAnalysis);
  const industry = detectIndustry(clientAnalysis, observabilityAnalysis);

  // Build contact data
  const contactData = {
    full_name: clientAnalysis.full_name || clientAnalysis.name || call.name || null,
    email: clientAnalysis.email || null,
    phone: phone,
    country_code: call.country_code,
    company_name: clientAnalysis.company_name || clientAnalysis.organization || null,
    user_type: userType,
    primary_industry: industry,
    lifecycle_stage: "lead",
    source: "voice_widget",
    source_id: call.id,
    base_profile: {
      original_name: call.name,
      page_url: call.page_url,
      ...clientAnalysis,
    },
    last_interaction_at: call.created_at,
    last_channel: "voice_ai",
    total_interactions: 1,
  };

  if (dryRun) {
    console.log(`[DRY RUN] Would create/update contact:`, contactData);
    stats.contacts_created++;
    return;
  }

  // Upsert contact by phone
  const { data: existingContact } = await supabase
    .from("crm_contacts")
    .select("id, total_interactions")
    .eq("phone", phone)
    .maybeSingle();

  let contactId: string;

  if (existingContact) {
    // Update existing contact
    const { error: updateError } = await supabase
      .from("crm_contacts")
      .update({
        ...contactData,
        total_interactions: (existingContact.total_interactions || 0) + 1,
      })
      .eq("id", existingContact.id);

    if (updateError) throw updateError;
    contactId = existingContact.id;
    stats.contacts_updated++;
    console.log(`Updated contact ${contactId} for phone ${phone}`);
  } else {
    // Create new contact
    const { data: newContact, error: insertError } = await supabase
      .from("crm_contacts")
      .insert(contactData)
      .select("id")
      .single();

    if (insertError) throw insertError;
    contactId = newContact.id;
    stats.contacts_created++;
    console.log(`Created contact ${contactId} for phone ${phone}`);
  }

  // Create interaction record
  const interactionData = {
    contact_id: contactId,
    channel: "voice_ai",
    direction: "inbound",
    summary: observabilityAnalysis.call_summary || platformAnalysis.summary || null,
    raw_content: call.transcript,
    sentiment: observabilityAnalysis.sentiment_analysis?.overall_sentiment || null,
    sentiment_score: observabilityAnalysis.sentiment_analysis?.score || null,
    intent_detected: observabilityAnalysis.intents || [],
    entities_extracted: observabilityAnalysis.entities || {},
    ai_insights: {
      client_analysis: clientAnalysis,
      platform_analysis: platformAnalysis,
      observability_analysis: observabilityAnalysis,
    },
    duration_seconds: call.call_duration ? Math.round(Number(call.call_duration)) : null,
    recording_url: call.recording_url,
    source_type: "voice_widget_call",
    source_id: call.id,
    occurred_at: call.created_at,
  };

  const { data: interaction, error: interactionError } = await supabase
    .from("crm_interactions")
    .insert(interactionData)
    .select("id")
    .single();

  if (interactionError) {
    console.error(`Failed to create interaction for call ${call.id}:`, interactionError);
  } else {
    stats.interactions_created++;
    console.log(`Created interaction ${interaction.id} for contact ${contactId}`);

    // Extract variables from the call analysis
    await extractVariables(supabase, contactId, interaction.id, call, stats);
  }
}

async function extractVariables(
  supabase: any,
  contactId: string,
  interactionId: string,
  call: VoiceWidgetCall,
  stats: any
) {
  const variables: Array<{
    contact_id: string;
    variable_name: string;
    variable_value: string;
    variable_type: string;
    source_channel: string;
    source_interaction_id: string;
    confidence: number;
  }> = [];

  const clientAnalysis = call.client_analysis || {};
  const observabilityAnalysis = call.observability_analysis || {};

  // Extract known fields as variables
  const fieldMappings: Array<{ field: string; name: string; type: string }> = [
    { field: "budget", name: "budget", type: "text" },
    { field: "timeline", name: "timeline", type: "text" },
    { field: "requirement", name: "requirement", type: "text" },
    { field: "pain_points", name: "pain_point", type: "text" },
    { field: "interest_areas", name: "interest_area", type: "text" },
    { field: "location_preference", name: "location", type: "text" },
    { field: "property_type", name: "property_type", type: "text" },
    { field: "investment_range", name: "investment_range", type: "text" },
    { field: "funding_stage", name: "funding_stage", type: "text" },
    { field: "team_size", name: "team_size", type: "number" },
    { field: "use_case", name: "use_case", type: "text" },
  ];

  for (const mapping of fieldMappings) {
    const value = clientAnalysis[mapping.field] || observabilityAnalysis[mapping.field];
    if (value && String(value).trim()) {
      variables.push({
        contact_id: contactId,
        variable_name: mapping.name,
        variable_value: String(value),
        variable_type: mapping.type,
        source_channel: "voice_ai",
        source_interaction_id: interactionId,
        confidence: 0.8,
      });
    }
  }

  // Extract entities from observability analysis
  const entities = observabilityAnalysis.entities || {};
  for (const [key, value] of Object.entries(entities)) {
    if (value && String(value).trim()) {
      variables.push({
        contact_id: contactId,
        variable_name: `entity_${key}`,
        variable_value: String(value),
        variable_type: "text",
        source_channel: "voice_ai",
        source_interaction_id: interactionId,
        confidence: 0.7,
      });
    }
  }

  if (variables.length > 0) {
    const { error } = await supabase.from("crm_variables").insert(variables);
    if (error) {
      console.error(`Failed to insert variables for contact ${contactId}:`, error);
    } else {
      stats.variables_extracted += variables.length;
      console.log(`Extracted ${variables.length} variables for contact ${contactId}`);
    }
  }
}

async function processLead(supabase: any, lead: any, stats: any, dryRun: boolean) {
  const phone = lead.mobile ? `${lead.country_code || "+91"}${lead.mobile}` : null;
  const name = lead.name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim();

  if (!phone && !lead.email) {
    console.log(`Skipping lead ${lead.id}: no phone or email`);
    return;
  }

  const contactData = {
    full_name: name || null,
    email: lead.email || null,
    phone: phone,
    country_code: lead.country_code,
    user_type: detectUserTypeFromSource(lead.source),
    lifecycle_stage: "lead",
    source: "lead_form",
    source_id: lead.id,
    base_profile: {
      use_case: lead.use_case,
      source: lead.source,
      ai_calling_consent: lead.ai_calling_consent,
    },
    last_interaction_at: lead.created_at,
    last_channel: "web",
    total_interactions: 1,
  };

  if (dryRun) {
    console.log(`[DRY RUN] Would create/update lead contact:`, contactData);
    stats.contacts_created++;
    return;
  }

  // Check for existing contact by phone or email
  let existingContact = null;
  if (phone) {
    const { data } = await supabase
      .from("crm_contacts")
      .select("id, total_interactions")
      .eq("phone", phone)
      .maybeSingle();
    existingContact = data;
  }
  if (!existingContact && lead.email) {
    const { data } = await supabase
      .from("crm_contacts")
      .select("id, total_interactions")
      .eq("email", lead.email)
      .maybeSingle();
    existingContact = data;
  }

  if (existingContact) {
    stats.contacts_updated++;
    console.log(`Lead ${lead.id} already exists as contact ${existingContact.id}`);
  } else {
    const { error: insertError } = await supabase.from("crm_contacts").insert(contactData);
    if (insertError && !insertError.message.includes("duplicate")) {
      throw insertError;
    }
    stats.contacts_created++;
    console.log(`Created contact from lead ${lead.id}`);
  }
}

function detectUserType(clientAnalysis: any, observabilityAnalysis: any): string {
  const text = JSON.stringify({ ...clientAnalysis, ...observabilityAnalysis }).toLowerCase();

  if (text.includes("investor") || text.includes("invest") || text.includes("funding")) {
    return "investor";
  }
  if (text.includes("founder") || text.includes("startup") || text.includes("co-founder")) {
    return "founder";
  }
  if (text.includes("developer") || text.includes("engineer") || text.includes("technical")) {
    return "developer";
  }
  if (text.includes("enterprise") || text.includes("corporate") || text.includes("company")) {
    return "enterprise";
  }
  return "general";
}

function detectIndustry(clientAnalysis: any, observabilityAnalysis: any): string | null {
  const text = JSON.stringify({ ...clientAnalysis, ...observabilityAnalysis }).toLowerCase();

  const industryKeywords: Record<string, string[]> = {
    real_estate: ["property", "real estate", "builder", "apartment", "flat", "villa", "plot", "construction"],
    edtech: ["education", "school", "college", "course", "learning", "training", "student"],
    fintech: ["finance", "banking", "loan", "investment", "insurance", "payment"],
    healthcare: ["health", "hospital", "clinic", "doctor", "medical", "patient"],
    ecommerce: ["shop", "store", "ecommerce", "retail", "product", "order"],
    saas: ["software", "saas", "platform", "tool", "automation"],
    travel: ["travel", "hotel", "booking", "flight", "vacation", "tourism"],
    automotive: ["car", "vehicle", "auto", "bike", "dealer"],
  };

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return industry;
    }
  }
  return null;
}

function detectUserTypeFromSource(source: string): string {
  if (!source) return "general";
  const s = source.toLowerCase();
  if (s.includes("investor")) return "investor";
  if (s.includes("founder") || s.includes("accelerator")) return "founder";
  if (s.includes("enterprise")) return "enterprise";
  if (s.includes("voice")) return "general";
  return "general";
}
