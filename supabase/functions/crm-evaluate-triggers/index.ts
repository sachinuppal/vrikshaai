import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluateRequest {
  contact_id: string;
  trigger_event: string; // new_interaction, score_change, lifecycle_change, manual
  event_data?: any;
}

interface Trigger {
  id: string;
  name: string;
  trigger_event: string;
  conditions: any;
  actions: any;
  priority: number;
  cooldown_minutes: number;
  max_executions_per_contact: number | null;
  is_active: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EvaluateRequest = await req.json();
    const { contact_id, trigger_event, event_data } = body;

    console.log("Evaluating triggers for:", { contact_id, trigger_event });

    // Validate required fields
    if (!contact_id || !trigger_event) {
      return new Response(
        JSON.stringify({ error: "contact_id and trigger_event are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch contact data
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .select("*")
      .eq("id", contact_id)
      .single();

    if (contactError || !contact) {
      return new Response(
        JSON.stringify({ error: "Contact not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch contact variables
    const { data: variables } = await supabase
      .from("crm_variables")
      .select("*")
      .eq("contact_id", contact_id)
      .eq("is_current", true);

    const variablesByName: Record<string, any> = {};
    for (const v of variables || []) {
      variablesByName[v.variable_name] = v.variable_value;
    }

    // Fetch active triggers for this event type
    const { data: triggers, error: triggersError } = await supabase
      .from("crm_triggers")
      .select("*")
      .eq("trigger_event", trigger_event)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (triggersError) {
      throw new Error(`Failed to fetch triggers: ${triggersError.message}`);
    }

    console.log(`Found ${triggers?.length || 0} active triggers for event: ${trigger_event}`);

    const actionsToExecute: Array<{
      trigger_id: string;
      trigger_name: string;
      action: any;
      matched_conditions: any;
    }> = [];

    // Evaluate each trigger
    for (const trigger of triggers || []) {
      // Check cooldown
      const cooldownOk = await checkCooldown(supabase, contact_id, trigger.id, trigger.cooldown_minutes);
      if (!cooldownOk) {
        console.log(`Trigger ${trigger.name} skipped: cooldown active`);
        continue;
      }

      // Check max executions
      if (trigger.max_executions_per_contact) {
        const { count } = await supabase
          .from("crm_trigger_executions")
          .select("id", { count: "exact", head: true })
          .eq("contact_id", contact_id)
          .eq("trigger_id", trigger.id);

        if ((count || 0) >= trigger.max_executions_per_contact) {
          console.log(`Trigger ${trigger.name} skipped: max executions reached`);
          continue;
        }
      }

      // Evaluate conditions
      const conditionsResult = evaluateConditions(trigger.conditions, {
        contact,
        variables: variablesByName,
        event_data,
      });

      if (conditionsResult.matched) {
        console.log(`Trigger ${trigger.name} matched with conditions:`, conditionsResult.matchedConditions);
        
        // Add all actions from this trigger
        const actions = Array.isArray(trigger.actions) ? trigger.actions : [trigger.actions];
        for (const action of actions) {
          actionsToExecute.push({
            trigger_id: trigger.id,
            trigger_name: trigger.name,
            action,
            matched_conditions: conditionsResult.matchedConditions,
          });
        }
      }
    }

    console.log(`${actionsToExecute.length} actions to execute`);

    return new Response(
      JSON.stringify({
        success: true,
        contact_id,
        trigger_event,
        triggers_evaluated: triggers?.length || 0,
        actions_to_execute: actionsToExecute,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Trigger evaluation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkCooldown(
  supabase: any,
  contactId: string,
  triggerId: string,
  cooldownMinutes: number
): Promise<boolean> {
  if (!cooldownMinutes || cooldownMinutes <= 0) return true;

  const cooldownThreshold = new Date(Date.now() - cooldownMinutes * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("crm_trigger_executions")
    .select("id")
    .eq("contact_id", contactId)
    .eq("trigger_id", triggerId)
    .gte("executed_at", cooldownThreshold)
    .limit(1);

  return !data || data.length === 0;
}

function evaluateConditions(
  conditions: any,
  context: { contact: any; variables: Record<string, any>; event_data: any }
): { matched: boolean; matchedConditions: any } {
  if (!conditions || Object.keys(conditions).length === 0) {
    return { matched: true, matchedConditions: { all: true } };
  }

  const matchedConditions: any = {};
  let allMatched = true;

  // Handle "all" conditions (AND logic)
  if (conditions.all && Array.isArray(conditions.all)) {
    for (const condition of conditions.all) {
      const result = evaluateSingleCondition(condition, context);
      if (!result) {
        allMatched = false;
        break;
      }
      matchedConditions[condition.field] = condition;
    }
    return { matched: allMatched, matchedConditions };
  }

  // Handle "any" conditions (OR logic)
  if (conditions.any && Array.isArray(conditions.any)) {
    for (const condition of conditions.any) {
      const result = evaluateSingleCondition(condition, context);
      if (result) {
        matchedConditions[condition.field] = condition;
        return { matched: true, matchedConditions };
      }
    }
    return { matched: false, matchedConditions: {} };
  }

  // Handle single condition object
  if (conditions.field) {
    const result = evaluateSingleCondition(conditions, context);
    if (result) {
      matchedConditions[conditions.field] = conditions;
    }
    return { matched: result, matchedConditions };
  }

  return { matched: true, matchedConditions: { default: true } };
}

function evaluateSingleCondition(
  condition: { field: string; operator: string; value: any },
  context: { contact: any; variables: Record<string, any>; event_data: any }
): boolean {
  const { field, operator, value } = condition;

  // Get the actual value from context
  let actualValue: any;
  if (field.startsWith("contact.")) {
    actualValue = context.contact[field.replace("contact.", "")];
  } else if (field.startsWith("variable.")) {
    actualValue = context.variables[field.replace("variable.", "")];
  } else if (field.startsWith("event.")) {
    actualValue = context.event_data?.[field.replace("event.", "")];
  } else {
    // Try contact first, then variables
    actualValue = context.contact[field] ?? context.variables[field];
  }

  // Evaluate based on operator
  switch (operator) {
    case "equals":
    case "eq":
      return actualValue == value;
    case "not_equals":
    case "neq":
      return actualValue != value;
    case "greater_than":
    case "gt":
      return Number(actualValue) > Number(value);
    case "less_than":
    case "lt":
      return Number(actualValue) < Number(value);
    case "greater_than_or_equal":
    case "gte":
      return Number(actualValue) >= Number(value);
    case "less_than_or_equal":
    case "lte":
      return Number(actualValue) <= Number(value);
    case "contains":
      return String(actualValue).toLowerCase().includes(String(value).toLowerCase());
    case "not_contains":
      return !String(actualValue).toLowerCase().includes(String(value).toLowerCase());
    case "in":
      return Array.isArray(value) ? value.includes(actualValue) : false;
    case "not_in":
      return Array.isArray(value) ? !value.includes(actualValue) : true;
    case "exists":
      return actualValue !== null && actualValue !== undefined;
    case "not_exists":
      return actualValue === null || actualValue === undefined;
    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}
