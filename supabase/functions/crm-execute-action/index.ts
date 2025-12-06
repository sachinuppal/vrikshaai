import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExecuteRequest {
  contact_id: string;
  trigger_id: string;
  trigger_name: string;
  action: {
    type: string;
    config?: any;
    [key: string]: any;
  };
  matched_conditions: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ExecuteRequest = await req.json();
    const { contact_id, trigger_id, trigger_name, action, matched_conditions } = body;

    console.log("Executing action:", { contact_id, trigger_name, action_type: action.type, action });

    if (!contact_id || !trigger_id || !action?.type) {
      return new Response(
        JSON.stringify({ error: "contact_id, trigger_id, and action.type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Merge action.config into action for backward compatibility
    // This allows triggers to store config like { type: "create_task", config: { title: "...", priority: "..." } }
    const mergedAction = { ...action, ...action.config };
    console.log("Merged action:", mergedAction);

    let executionStatus = "success";
    let errorMessage: string | null = null;
    let actionResult: any = {};

    try {
      switch (mergedAction.type) {
        case "create_task":
          actionResult = await createTask(supabase, contact_id, mergedAction, trigger_name);
          break;

        case "update_lifecycle":
          actionResult = await updateLifecycle(supabase, contact_id, mergedAction);
          break;

        case "tag_contact":
          actionResult = await tagContact(supabase, contact_id, mergedAction);
          break;

        case "update_score":
          actionResult = await updateScore(supabase, contact_id, mergedAction);
          break;

        case "allied_industry_trigger":
          actionResult = await triggerAlliedIndustry(supabase, contact_id, mergedAction);
          break;

        case "send_notification":
          actionResult = await sendNotification(supabase, contact_id, mergedAction);
          break;

        default:
          throw new Error(`Unknown action type: ${mergedAction.type}`);
      }
    } catch (actionError) {
      executionStatus = "failed";
      errorMessage = actionError instanceof Error ? actionError.message : "Action execution failed";
      console.error("Action execution error:", actionError);
    }

    // Log the execution
    const { error: logError } = await supabase.from("crm_trigger_executions").insert({
      trigger_id,
      contact_id,
      execution_status: executionStatus,
      matched_conditions,
      actions_executed: { ...mergedAction, result: actionResult },
      error_message: errorMessage,
    });

    if (logError) {
      console.error("Failed to log trigger execution:", logError);
    }

    console.log("Action execution complete:", { success: executionStatus === "success", actionResult });

    return new Response(
      JSON.stringify({
        success: executionStatus === "success",
        action_type: mergedAction.type,
        result: actionResult,
        error: errorMessage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Execute action error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function createTask(supabase: any, contactId: string, action: any, triggerName: string): Promise<any> {
  const taskData = {
    contact_id: contactId,
    title: action.title || "AI Generated Task",
    description: action.description || null,
    task_type: action.task_type || "follow_up",
    priority: action.priority || "medium",
    due_at: action.due_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    suggested_channel: action.suggested_channel || null,
    suggested_content: action.suggested_content || null,
    ai_generated: true,
    ai_reason: action.reason || `Triggered by automation rule: ${triggerName}`,
    status: "pending",
  };

  console.log("Creating task with data:", taskData);

  const { data, error } = await supabase
    .from("crm_tasks")
    .insert(taskData)
    .select("id, title")
    .single();

  if (error) throw new Error(`Failed to create task: ${error.message}`);

  console.log("Created task:", data);
  return { task_id: data.id, title: data.title };
}

async function updateLifecycle(supabase: any, contactId: string, action: any): Promise<any> {
  const newStage = action.lifecycle_stage;
  if (!newStage) throw new Error("lifecycle_stage is required");

  const validStages = ["lead", "qualified", "opportunity", "customer", "churned"];
  if (!validStages.includes(newStage)) {
    throw new Error(`Invalid lifecycle stage: ${newStage}`);
  }

  const { error } = await supabase
    .from("crm_contacts")
    .update({ lifecycle_stage: newStage, updated_at: new Date().toISOString() })
    .eq("id", contactId);

  if (error) throw new Error(`Failed to update lifecycle: ${error.message}`);

  console.log("Updated lifecycle to:", newStage);
  return { new_stage: newStage };
}

async function tagContact(supabase: any, contactId: string, action: any): Promise<any> {
  const tags = Array.isArray(action.tags) ? action.tags : [action.tag];
  if (!tags.length) throw new Error("tags are required");

  const { data: contact } = await supabase
    .from("crm_contacts")
    .select("tags")
    .eq("id", contactId)
    .single();

  const currentTags = contact?.tags || [];
  const newTags = [...new Set([...currentTags, ...tags])];

  const { error } = await supabase
    .from("crm_contacts")
    .update({ tags: newTags, updated_at: new Date().toISOString() })
    .eq("id", contactId);

  if (error) throw new Error(`Failed to add tags: ${error.message}`);

  console.log("Added tags:", tags);
  return { added_tags: tags, total_tags: newTags.length };
}

async function updateScore(supabase: any, contactId: string, action: any): Promise<any> {
  const { score_type, score_value, operation = "set" } = action;
  if (!score_type) throw new Error("score_type is required");

  const scoreField = `${score_type}_score`;
  const validFields = ["intent_score", "engagement_score", "urgency_score", "churn_risk"];

  if (!validFields.includes(scoreField)) {
    throw new Error(`Invalid score type: ${score_type}`);
  }

  let newValue = score_value;
  if (operation === "add" || operation === "subtract") {
    const { data: contact } = await supabase
      .from("crm_contacts")
      .select(scoreField)
      .eq("id", contactId)
      .single();

    const currentValue = contact?.[scoreField] || 0;
    newValue = operation === "add"
      ? Math.min(100, currentValue + score_value)
      : Math.max(0, currentValue - score_value);
  }

  const { error } = await supabase
    .from("crm_contacts")
    .update({ [scoreField]: newValue, updated_at: new Date().toISOString() })
    .eq("id", contactId);

  if (error) throw new Error(`Failed to update score: ${error.message}`);

  await supabase.from("crm_scores").insert({
    contact_id: contactId,
    score_type: score_type,
    score_value: newValue,
    triggered_by: "trigger_automation",
  });

  console.log(`Updated ${score_type} score to:`, newValue);
  return { score_type, new_value: newValue };
}

async function triggerAlliedIndustry(supabase: any, contactId: string, action: any): Promise<any> {
  const { allied_industry_id } = action;
  if (!allied_industry_id) throw new Error("allied_industry_id is required");

  const { data: allied } = await supabase
    .from("crm_allied_industries")
    .select("*, crm_industry_nodes!crm_allied_industries_allied_industry_id_fkey(display_name)")
    .eq("id", allied_industry_id)
    .single();

  if (!allied) throw new Error("Allied industry not found");

  const taskData = {
    contact_id: contactId,
    title: `Allied Industry: ${allied.crm_industry_nodes?.display_name || 'Partner Outreach'}`,
    description: `Cross-sell opportunity identified for allied industry`,
    task_type: "cross_sell",
    priority: "high",
    due_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    ai_generated: true,
    ai_reason: `Allied industry trigger: ${allied.relationship_type || 'partnership'}`,
    status: "pending",
  };

  const { data: task, error } = await supabase
    .from("crm_tasks")
    .insert(taskData)
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create allied industry task: ${error.message}`);

  console.log("Created allied industry task:", task.id);
  return { task_id: task.id, allied_industry: allied.crm_industry_nodes?.display_name };
}

async function sendNotification(supabase: any, contactId: string, action: any): Promise<any> {
  const { notification_type, message, channel } = action;

  console.log("Notification to be sent:", { contactId, notification_type, message, channel });

  return {
    notification_type,
    channel,
    status: "queued",
    message: "Notification system not fully implemented"
  };
}
