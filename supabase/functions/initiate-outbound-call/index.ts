import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RINGG_API_URL = "https://prod-api.ringg.ai/ca/api/v0/calling/outbound/individual";
const AGENT_ID = "1b0faabe-2256-47d3-9321-ab113091dc5d";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ringgApiKey = Deno.env.get("RINGG_API_KEY");

    if (!ringgApiKey) {
      console.error("RINGG_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { name, phone, countryCode, fromNumber } = await req.json();

    console.log("Initiating outbound call:", { name, phone, countryCode, fromNumber });

    // Validate input
    if (!name || !phone || !countryCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: name, phone, countryCode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPhone = `${countryCode}${phone}`;
    const DEFAULT_FROM_NUMBER = "+912269976405";

    // Create a record in voice_widget_calls
    const { data: callRecord, error: insertError } = await supabase
      .from("voice_widget_calls")
      .insert({
        name,
        phone,
        country_code: countryCode,
        full_phone: fullPhone,
        call_status: "initiated",
        source: "outbound_call",
        page_url: "manual_initiation",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating call record:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create call record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Created call record:", callRecord.id);

    // Call Ringg API with required from_number field
    const ringgPayload = {
      name,
      mobile_number: fullPhone,
      agent_id: AGENT_ID,
      from_number: fromNumber || DEFAULT_FROM_NUMBER,
      call_config: {
        idle_timeout_warning: 5,
        idle_timeout_end: 10,
        max_call_length: 240,
        call_time: {
          call_start_time: "08:00",
          call_end_time: "20:00",
          timezone: "Asia/Kolkata",
        },
      },
      custom_args_values: {
        caller_name: name,
        mobile_number: fullPhone,
        source: "vriksha_outbound",
      },
    };

    console.log("Calling Ringg API with payload:", JSON.stringify(ringgPayload));

    const ringgResponse = await fetch(RINGG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": ringgApiKey,
      },
      body: JSON.stringify(ringgPayload),
    });

    const ringgData = await ringgResponse.json();
    console.log("Ringg API response:", JSON.stringify(ringgData));

    if (!ringgResponse.ok) {
      console.error("Ringg API error:", ringgData);
      
      // Update call record with error status
      await supabase
        .from("voice_widget_calls")
        .update({ call_status: "failed" })
        .eq("id", callRecord.id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: ringgData.message || "Failed to initiate call with Ringg API" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update call record with ringg_call_id
    const ringgCallId = ringgData.call_id || ringgData.id;
    if (ringgCallId) {
      const { error: updateError } = await supabase
        .from("voice_widget_calls")
        .update({ 
          ringg_call_id: ringgCallId,
          call_status: "ringing"
        })
        .eq("id", callRecord.id);

      if (updateError) {
        console.error("Error updating call record with ringg_call_id:", updateError);
      } else {
        console.log("Updated call record with ringg_call_id:", ringgCallId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        callId: callRecord.id,
        ringgCallId: ringgCallId,
        message: "Call initiated successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in initiate-outbound-call:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
