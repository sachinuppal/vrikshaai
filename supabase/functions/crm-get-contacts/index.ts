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
    const params = Object.fromEntries(url.searchParams);

    const {
      search,
      user_type,
      lifecycle_stage,
      industry,
      min_intent_score,
      max_intent_score,
      tags,
      sort_by = "last_interaction_at",
      sort_order = "desc",
      page = "1",
      limit = "20",
    } = params;

    console.log("Fetching CRM contacts with params:", params);

    let query = supabase.from("crm_contacts").select("*", { count: "exact" });

    // Apply filters
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company_name.ilike.%${search}%`
      );
    }

    if (user_type) {
      query = query.eq("user_type", user_type);
    }

    if (lifecycle_stage) {
      query = query.eq("lifecycle_stage", lifecycle_stage);
    }

    if (industry) {
      query = query.eq("primary_industry", industry);
    }

    if (min_intent_score) {
      query = query.gte("intent_score", parseInt(min_intent_score));
    }

    if (max_intent_score) {
      query = query.lte("intent_score", parseInt(max_intent_score));
    }

    if (tags) {
      const tagList = tags.split(",");
      query = query.overlaps("tags", tagList);
    }

    // Apply sorting
    const validSortFields = [
      "last_interaction_at",
      "created_at",
      "intent_score",
      "engagement_score",
      "full_name",
    ];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "last_interaction_at";
    query = query.order(sortField, { ascending: sort_order === "asc", nullsFirst: false });

    // Apply pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data: contacts, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    // Get interaction counts for each contact
    const contactIds = contacts?.map((c) => c.id) || [];
    let interactionCounts: Record<string, number> = {};

    if (contactIds.length > 0) {
      const { data: interactions } = await supabase
        .from("crm_interactions")
        .select("contact_id")
        .in("contact_id", contactIds);

      if (interactions) {
        for (const i of interactions) {
          interactionCounts[i.contact_id] = (interactionCounts[i.contact_id] || 0) + 1;
        }
      }
    }

    // Enrich contacts with interaction count
    const enrichedContacts = contacts?.map((contact) => ({
      ...contact,
      interaction_count: interactionCounts[contact.id] || 0,
    }));

    return new Response(
      JSON.stringify({
        contacts: enrichedContacts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limitNum),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
