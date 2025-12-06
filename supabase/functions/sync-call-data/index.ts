import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RINGG_AGENT_ID = "1b0faabe-2256-47d3-9321-ab113091dc5d";

interface RinggCall {
  id: string;
  to_number: string;
  name: string;
  status: string;
  transcript: string;
  audio_recording: string | null;
  created_at: string;
  call_duration: number;
  call_cost: number;
  call_type: string;
  voicemail_detected: boolean;
  agent: {
    id: string;
    agent_name: string;
  };
}

interface RinggHistoryResponse {
  calls: RinggCall[];
  limit: number;
  offset: number;
  count: number;
  total: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ringg_call_id, db_call_id } = await req.json();
    
    console.log("Sync call data request:", { ringg_call_id, db_call_id });

    if (!ringg_call_id && !db_call_id) {
      return new Response(
        JSON.stringify({ error: "Either ringg_call_id or db_call_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ringgApiKey = Deno.env.get("RINGG_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If only db_call_id provided, fetch the ringg_call_id from database
    let targetRinggCallId = ringg_call_id;
    let targetDbCallId = db_call_id;

    if (!targetRinggCallId && targetDbCallId) {
      const { data: dbCall, error: dbError } = await supabase
        .from("voice_widget_calls")
        .select("ringg_call_id")
        .eq("id", targetDbCallId)
        .single();

      if (dbError || !dbCall?.ringg_call_id) {
        return new Response(
          JSON.stringify({ error: "Call not found or missing ringg_call_id" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      targetRinggCallId = dbCall.ringg_call_id;
    }

    // If we have ringg_call_id but not db_call_id, find it
    if (targetRinggCallId && !targetDbCallId) {
      const { data: dbCall } = await supabase
        .from("voice_widget_calls")
        .select("id")
        .eq("ringg_call_id", targetRinggCallId)
        .single();
      
      if (dbCall) {
        targetDbCallId = dbCall.id;
      }
    }

    console.log("Target IDs:", { targetRinggCallId, targetDbCallId });

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => {
      return date.toISOString().replace("Z", "+00:00");
    };

    // Fetch call history from Ringg API
    const historyUrl = new URL("https://prod-api.ringg.ai/ca/api/v0/calling/history");
    historyUrl.searchParams.set("agent_id", RINGG_AGENT_ID);
    historyUrl.searchParams.set("start_date", formatDate(startDate));
    historyUrl.searchParams.set("end_date", formatDate(endDate));
    historyUrl.searchParams.set("limit", "100");
    historyUrl.searchParams.set("offset", "0");

    console.log("Fetching Ringg history:", historyUrl.toString());

    const historyResponse = await fetch(historyUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-KEY": ringgApiKey,
        "Content-Type": "application/json",
      },
    });

    if (!historyResponse.ok) {
      const errorText = await historyResponse.text();
      console.error("Ringg API error:", historyResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch call history from Ringg", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const historyData: RinggHistoryResponse = await historyResponse.json();
    console.log(`Fetched ${historyData.calls.length} calls from Ringg (total: ${historyData.total})`);

    // Find the matching call
    const matchingCall = historyData.calls.find(call => call.id === targetRinggCallId);

    if (!matchingCall) {
      // If not in first 100, try pagination
      let offset = 100;
      while (offset < historyData.total && !matchingCall) {
        historyUrl.searchParams.set("offset", offset.toString());
        const nextResponse = await fetch(historyUrl.toString(), {
          method: "GET",
          headers: {
            "X-API-KEY": ringgApiKey,
            "Content-Type": "application/json",
          },
        });

        if (nextResponse.ok) {
          const nextData: RinggHistoryResponse = await nextResponse.json();
          const found = nextData.calls.find(call => call.id === targetRinggCallId);
          if (found) {
            Object.assign(matchingCall || {}, found);
            break;
          }
        }
        offset += 100;
      }
    }

    if (!matchingCall) {
      return new Response(
        JSON.stringify({ error: "Call not found in Ringg history", ringg_call_id: targetRinggCallId }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Found matching call:", matchingCall.id, matchingCall.status);

    // Parse transcript from string to JSON array
    let transcriptJson = null;
    try {
      if (matchingCall.transcript) {
        transcriptJson = JSON.parse(matchingCall.transcript);
      }
    } catch (e) {
      console.error("Failed to parse transcript:", e);
      transcriptJson = matchingCall.transcript;
    }

    // Build platform analysis from available data
    const platformAnalysis = {
      summary: `Call to ${matchingCall.name || matchingCall.to_number} - ${matchingCall.status}`,
      call_type: matchingCall.call_type,
      duration_seconds: matchingCall.call_duration,
      voicemail_detected: matchingCall.voicemail_detected,
      agent_name: matchingCall.agent?.agent_name || "Unknown",
      call_cost: matchingCall.call_cost,
      synced_from_api: true,
      synced_at: new Date().toISOString(),
    };

    // Update the database record
    const updateData: Record<string, unknown> = {
      transcript: transcriptJson,
      recording_url: matchingCall.audio_recording,
      call_duration: matchingCall.call_duration,
      call_status: matchingCall.status,
      platform_analysis: platformAnalysis,
      updated_at: new Date().toISOString(),
    };

    // If we don't have a db_call_id, we need to find or create one
    if (!targetDbCallId) {
      return new Response(
        JSON.stringify({ 
          error: "No database record found for this Ringg call", 
          ringg_call_id: targetRinggCallId,
          call_data: matchingCall 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await supabase
      .from("voice_widget_calls")
      .update(updateData)
      .eq("id", targetDbCallId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update database", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully synced call data to database");

    // Trigger observability analysis if we have a transcript
    if (transcriptJson && Array.isArray(transcriptJson) && transcriptJson.length > 0) {
      console.log("Triggering observability analysis...");
      
      try {
        const observeResponse = await fetch(`${supabaseUrl}/functions/v1/observe-call-script`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            call_id: targetDbCallId,
            transcript: transcriptJson,
          }),
        });

        if (observeResponse.ok) {
          console.log("Observability analysis triggered successfully");
        } else {
          console.error("Observability analysis failed:", await observeResponse.text());
        }
      } catch (e) {
        console.error("Failed to trigger observability analysis:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        db_call_id: targetDbCallId,
        ringg_call_id: targetRinggCallId,
        synced_data: {
          transcript_entries: Array.isArray(transcriptJson) ? transcriptJson.length : 0,
          recording_url: matchingCall.audio_recording ? "available" : "not available",
          call_duration: matchingCall.call_duration,
          call_status: matchingCall.status,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Sync call data error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
