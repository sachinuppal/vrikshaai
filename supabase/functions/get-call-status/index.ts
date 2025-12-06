import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { callId } = await req.json();

    if (!callId) {
      return new Response(
        JSON.stringify({ error: "Missing callId" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Fetching call status for:", callId);

    const { data, error } = await supabase
      .from("voice_widget_calls")
      .select("id, call_status, platform_analysis, client_analysis, transcript, call_duration")
      .eq("id", callId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching call status:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Call not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return safe fields only - no PII exposed
    const response = {
      id: data.id,
      call_status: data.call_status,
      has_platform_analysis: !!data.platform_analysis,
      has_client_analysis: !!data.client_analysis,
      has_transcript: !!data.transcript,
      call_duration: data.call_duration,
      // Include analysis data for display (no PII in analysis)
      platform_analysis: data.platform_analysis,
      client_analysis: data.client_analysis,
    };

    console.log("Call status response:", { id: data.id, status: data.call_status, hasAnalysis: !!data.platform_analysis });

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
