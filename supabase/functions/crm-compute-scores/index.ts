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

    const { contact_id, compute_all = false } = await req.json();

    console.log("Computing scores:", { contact_id, compute_all });

    let contactIds: string[] = [];

    if (contact_id) {
      contactIds = [contact_id];
    } else if (compute_all) {
      const { data: contacts } = await supabase
        .from("crm_contacts")
        .select("id")
        .limit(1000);
      contactIds = contacts?.map((c) => c.id) || [];
    } else {
      return new Response(
        JSON.stringify({ error: "Either contact_id or compute_all is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Computing scores for ${contactIds.length} contacts`);

    const results = {
      processed: 0,
      triggers_fired: 0,
      tasks_created: 0,
      errors: [] as string[],
    };

    for (const cid of contactIds) {
      try {
        const scores = await computeScoresForContact(supabase, cid);
        results.processed++;

        // Trigger evaluation after computing scores
        const triggerResult = await evaluateAndExecuteTriggers(
          supabaseUrl,
          supabaseServiceKey,
          cid,
          scores
        );
        results.triggers_fired += triggerResult.triggersFired;
        results.tasks_created += triggerResult.tasksCreated;
      } catch (err) {
        const msg = `Error computing scores for ${cid}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(msg);
        results.errors.push(msg);
      }
    }

    console.log("Final results:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Score computation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function evaluateAndExecuteTriggers(
  supabaseUrl: string,
  supabaseServiceKey: string,
  contactId: string,
  scores: { intent: number; urgency: number; engagement: number; churn: number; ltv: number }
): Promise<{ triggersFired: number; tasksCreated: number }> {
  let triggersFired = 0;
  let tasksCreated = 0;

  try {
    // Call evaluate triggers
    console.log(`Evaluating triggers for contact ${contactId} with scores:`, scores);
    
    const evalResponse = await fetch(`${supabaseUrl}/functions/v1/crm-evaluate-triggers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_id: contactId,
        trigger_event: "score_update",
        event_data: {
          intent_score: scores.intent,
          urgency_score: scores.urgency,
          engagement_score: scores.engagement,
          churn_risk: scores.churn,
          ltv_prediction: scores.ltv,
        },
      }),
    });

    const evalResult = await evalResponse.json();
    console.log(`Trigger evaluation result for ${contactId}:`, evalResult);

    // Execute any matched actions
    if (evalResult.actions_to_execute?.length > 0) {
      triggersFired = evalResult.actions_to_execute.length;
      
      for (const actionItem of evalResult.actions_to_execute) {
        try {
          console.log(`Executing action for trigger: ${actionItem.trigger_name}`, actionItem.action);
          
          const execResponse = await fetch(`${supabaseUrl}/functions/v1/crm-execute-action`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contact_id: contactId,
              trigger_id: actionItem.trigger_id,
              trigger_name: actionItem.trigger_name,
              action: actionItem.action,
              matched_conditions: actionItem.matched_conditions,
            }),
          });

          const execResult = await execResponse.json();
          console.log(`Action execution result:`, execResult);
          
          if (execResult.success && execResult.action_type === "create_task") {
            tasksCreated++;
          }
        } catch (execError) {
          console.error(`Failed to execute action for ${actionItem.trigger_name}:`, execError);
        }
      }
    }
  } catch (triggerError) {
    console.error("Trigger evaluation/execution failed:", triggerError);
  }

  return { triggersFired, tasksCreated };
}

async function computeScoresForContact(
  supabase: any,
  contactId: string
): Promise<{ intent: number; urgency: number; engagement: number; churn: number; ltv: number }> {
  // Fetch contact and related data
  const [contactResult, interactionsResult, variablesResult] = await Promise.all([
    supabase.from("crm_contacts").select("*").eq("id", contactId).single(),
    supabase
      .from("crm_interactions")
      .select("*")
      .eq("contact_id", contactId)
      .order("occurred_at", { ascending: false })
      .limit(20),
    supabase
      .from("crm_variables")
      .select("*")
      .eq("contact_id", contactId)
      .eq("is_current", true),
  ]);

  const contact = contactResult.data;
  const interactions = interactionsResult.data || [];
  const variables = variablesResult.data || [];

  if (!contact) {
    throw new Error("Contact not found");
  }

  // Compute scores
  const intentScore = computeIntentScore(interactions, variables);
  const urgencyScore = computeUrgencyScore(interactions, variables);
  const engagementScore = computeEngagementScore(contact, interactions);
  const ltvPrediction = computeLTVPrediction(contact, variables);
  const churnRisk = computeChurnRisk(contact, interactions);

  // Update contact with new scores
  await supabase
    .from("crm_contacts")
    .update({
      intent_score: intentScore.score,
      urgency_score: urgencyScore.score,
      engagement_score: engagementScore.score,
      ltv_prediction: ltvPrediction.value,
      churn_risk: churnRisk.score,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId);

  // Store score history
  const scoreRecords = [
    { contact_id: contactId, score_type: "intent", score_value: intentScore.score, factors: intentScore.factors },
    { contact_id: contactId, score_type: "urgency", score_value: urgencyScore.score, factors: urgencyScore.factors },
    { contact_id: contactId, score_type: "engagement", score_value: engagementScore.score, factors: engagementScore.factors },
    { contact_id: contactId, score_type: "churn_risk", score_value: churnRisk.score, factors: churnRisk.factors },
  ];

  await supabase.from("crm_scores").insert(scoreRecords);

  console.log(`Updated scores for contact ${contactId}:`, {
    intent: intentScore.score,
    urgency: urgencyScore.score,
    engagement: engagementScore.score,
    ltv: ltvPrediction.value,
    churn: churnRisk.score,
  });

  return {
    intent: intentScore.score,
    urgency: urgencyScore.score,
    engagement: engagementScore.score,
    churn: churnRisk.score,
    ltv: ltvPrediction.value,
  };
}

function computeIntentScore(interactions: any[], variables: any[]): { score: number; factors: any } {
  const factors: any = {};
  let score = 30;

  const recentInteractions = interactions.filter((i) => {
    const daysSince = (Date.now() - new Date(i.occurred_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });
  factors.recent_interactions = recentInteractions.length;
  score += Math.min(recentInteractions.length * 10, 30);

  const positiveInteractions = interactions.filter((i) => i.sentiment === "positive");
  factors.positive_sentiment_count = positiveInteractions.length;
  score += Math.min(positiveInteractions.length * 5, 15);

  const purchaseIntentCount = interactions.filter((i) =>
    i.intent_detected?.includes("purchase_intent")
  ).length;
  factors.purchase_intent_signals = purchaseIntentCount;
  score += purchaseIntentCount * 10;

  const hasBudget = variables.some((v) => v.variable_name === "budget" || v.variable_name === "investment_range");
  factors.budget_mentioned = hasBudget;
  if (hasBudget) score += 15;

  const hasTimeline = variables.some((v) => v.variable_name === "timeline");
  factors.timeline_mentioned = hasTimeline;
  if (hasTimeline) score += 10;

  return { score: Math.min(100, Math.max(0, score)), factors };
}

function computeUrgencyScore(interactions: any[], variables: any[]): { score: number; factors: any } {
  const factors: any = {};
  let score = 20;

  const interactionCount = interactions.length;
  factors.total_interactions = interactionCount;
  score += Math.min(interactionCount * 5, 25);

  const channels = new Set(interactions.map((i) => i.channel));
  factors.channels_used = channels.size;
  score += (channels.size - 1) * 10;

  const inboundCount = interactions.filter((i) => i.direction === "inbound").length;
  factors.inbound_ratio = interactionCount > 0 ? inboundCount / interactionCount : 0;
  score += factors.inbound_ratio * 20;

  const timelineVar = variables.find((v) => v.variable_name === "timeline");
  if (timelineVar) {
    const urgentKeywords = ["asap", "urgent", "immediately", "this week", "this month"];
    const hasUrgentTimeline = urgentKeywords.some((kw) =>
      timelineVar.variable_value.toLowerCase().includes(kw)
    );
    factors.urgent_timeline = hasUrgentTimeline;
    if (hasUrgentTimeline) score += 20;
  }

  return { score: Math.min(100, Math.max(0, score)), factors };
}

function computeEngagementScore(contact: any, interactions: any[]): { score: number; factors: any } {
  const factors: any = {};
  let score = 0;

  factors.total_interactions = contact.total_interactions || interactions.length;
  score += Math.min(factors.total_interactions * 8, 40);

  if (contact.last_interaction_at) {
    const daysSinceLastInteraction =
      (Date.now() - new Date(contact.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24);
    factors.days_since_last_interaction = Math.round(daysSinceLastInteraction);

    if (daysSinceLastInteraction < 1) score += 30;
    else if (daysSinceLastInteraction < 7) score += 20;
    else if (daysSinceLastInteraction < 30) score += 10;
    else if (daysSinceLastInteraction < 90) score += 5;
  }

  const outboundCount = interactions.filter((i) => i.direction === "outbound").length;
  const inboundCount = interactions.filter((i) => i.direction === "inbound").length;
  if (outboundCount > 0) {
    factors.response_rate = inboundCount / outboundCount;
    score += Math.min(factors.response_rate * 20, 20);
  }

  const channels = new Set(interactions.map((i) => i.channel));
  factors.channel_diversity = channels.size;
  score += (channels.size - 1) * 5;

  return { score: Math.min(100, Math.max(0, score)), factors };
}

function computeLTVPrediction(contact: any, variables: any[]): { value: number; factors: any } {
  const factors: any = {};
  let value = 0;

  const budgetVar = variables.find(
    (v) => v.variable_name === "budget" || v.variable_name === "investment_range"
  );
  if (budgetVar) {
    const budgetMatch = budgetVar.variable_value.match(/[\d,]+/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[0].replace(/,/g, ""));
      factors.stated_budget = budget;
      value = budget;
    }
  }

  const typeMultipliers: Record<string, number> = {
    enterprise: 2.0,
    investor: 1.5,
    founder: 1.2,
    developer: 0.8,
    general: 1.0,
  };
  const multiplier = typeMultipliers[contact.user_type] || 1.0;
  factors.user_type_multiplier = multiplier;
  value *= multiplier;

  const industryMultipliers: Record<string, number> = {
    real_estate: 1.5,
    fintech: 1.4,
    healthcare: 1.3,
    saas: 1.2,
    ecommerce: 1.1,
    edtech: 1.0,
    travel: 0.9,
    automotive: 1.0,
  };
  const industryMultiplier = industryMultipliers[contact.primary_industry] || 1.0;
  factors.industry_multiplier = industryMultiplier;
  value *= industryMultiplier;

  return { value: Math.round(value), factors };
}

function computeChurnRisk(contact: any, interactions: any[]): { score: number; factors: any } {
  const factors: any = {};
  let score = 20;

  if (contact.last_interaction_at) {
    const daysSince =
      (Date.now() - new Date(contact.last_interaction_at).getTime()) / (1000 * 60 * 60 * 24);
    factors.days_since_last_interaction = Math.round(daysSince);

    if (daysSince > 90) score += 50;
    else if (daysSince > 60) score += 35;
    else if (daysSince > 30) score += 20;
    else if (daysSince > 14) score += 10;
    else score -= 10;
  }

  const recentNegative = interactions
    .slice(0, 5)
    .filter((i) => i.sentiment === "negative").length;
  factors.recent_negative_interactions = recentNegative;
  score += recentNegative * 15;

  const complaintCount = interactions.filter((i) =>
    i.intent_detected?.includes("complaint")
  ).length;
  factors.complaint_count = complaintCount;
  score += complaintCount * 10;

  if (contact.total_interactions < 3) {
    factors.low_engagement = true;
    score += 15;
  }

  return { score: Math.min(100, Math.max(0, score)), factors };
}
