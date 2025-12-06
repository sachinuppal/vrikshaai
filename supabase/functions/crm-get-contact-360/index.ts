import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const contactId = url.searchParams.get("id");

    if (!contactId) {
      return new Response(
        JSON.stringify({ error: "Contact ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching 360° view for contact:", contactId);

    // Fetch contact base data
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (contactError || !contact) {
      return new Response(
        JSON.stringify({ error: "Contact not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all data in parallel
    const [
      variablesResult,
      interactionsResult,
      scoresResult,
      predictionsResult,
      tasksResult,
      industryResult,
    ] = await Promise.all([
      // Variables (current only)
      supabase
        .from("crm_variables")
        .select("*")
        .eq("contact_id", contactId)
        .eq("is_current", true)
        .order("created_at", { ascending: false }),

      // Interactions (timeline)
      supabase
        .from("crm_interactions")
        .select("*")
        .eq("contact_id", contactId)
        .order("occurred_at", { ascending: false })
        .limit(50),

      // Recent scores
      supabase
        .from("crm_scores")
        .select("*")
        .eq("contact_id", contactId)
        .order("computed_at", { ascending: false })
        .limit(20),

      // Active predictions
      supabase
        .from("crm_predictions")
        .select("*")
        .eq("contact_id", contactId)
        .eq("is_active", true)
        .order("generated_at", { ascending: false }),

      // Pending tasks
      supabase
        .from("crm_tasks")
        .select("*")
        .eq("contact_id", contactId)
        .in("status", ["pending", "in_progress"])
        .order("due_at", { ascending: true }),

      // Industry info
      contact.primary_industry
        ? supabase
            .from("crm_industry_nodes")
            .select("*, crm_allied_industries!crm_allied_industries_primary_industry_id_fkey(*, allied:crm_industry_nodes!crm_allied_industries_allied_industry_id_fkey(*))")
            .eq("name", contact.primary_industry)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    // Group variables by name for easy access
    const variablesByName: Record<string, any> = {};
    for (const v of variablesResult.data || []) {
      variablesByName[v.variable_name] = v;
    }

    // Build score history by type
    const scoreHistory: Record<string, Array<{ value: number; date: string }>> = {};
    for (const s of scoresResult.data || []) {
      if (!scoreHistory[s.score_type]) {
        scoreHistory[s.score_type] = [];
      }
      scoreHistory[s.score_type].push({
        value: s.score_value,
        date: s.computed_at,
      });
    }

    // Build channel breakdown from interactions
    const channelBreakdown: Record<string, number> = {};
    for (const i of interactionsResult.data || []) {
      channelBreakdown[i.channel] = (channelBreakdown[i.channel] || 0) + 1;
    }

    // Get allied industries for upsell/cross-sell opportunities
    const alliedIndustries = industryResult.data?.crm_allied_industries?.map((ai: any) => ({
      id: ai.allied.id,
      name: ai.allied.name,
      display_name: ai.allied.display_name,
      relationship_type: ai.relationship_type,
      relationship_strength: ai.relationship_strength,
      trigger_stage: ai.trigger_stage,
    })) || [];

    const response = {
      contact,
      variables: variablesResult.data || [],
      variables_by_name: variablesByName,
      interactions: interactionsResult.data || [],
      timeline_summary: {
        total_interactions: interactionsResult.data?.length || 0,
        channel_breakdown: channelBreakdown,
        first_interaction: interactionsResult.data?.[interactionsResult.data.length - 1]?.occurred_at,
        last_interaction: interactionsResult.data?.[0]?.occurred_at,
      },
      scores: {
        current: {
          intent: contact.intent_score,
          urgency: contact.urgency_score,
          engagement: contact.engagement_score,
          ltv_prediction: contact.ltv_prediction,
          churn_risk: contact.churn_risk,
        },
        history: scoreHistory,
      },
      predictions: predictionsResult.data || [],
      tasks: tasksResult.data || [],
      industry: {
        primary: industryResult.data
          ? {
              id: industryResult.data.id,
              name: industryResult.data.name,
              display_name: industryResult.data.display_name,
            }
          : null,
        allied: alliedIndustries,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching contact 360:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
