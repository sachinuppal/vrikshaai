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

async function fetchRinggHistory(
  ringgApiKey: string,
  startDate: Date,
  endDate: Date,
  limit = 100,
  offset = 0
): Promise<RinggHistoryResponse> {
  const formatDate = (date: Date) => date.toISOString().replace("Z", "+00:00");
  
  const historyUrl = new URL("https://prod-api.ringg.ai/ca/api/v0/calling/history");
  historyUrl.searchParams.set("agent_id", RINGG_AGENT_ID);
  historyUrl.searchParams.set("start_date", formatDate(startDate));
  historyUrl.searchParams.set("end_date", formatDate(endDate));
  historyUrl.searchParams.set("limit", limit.toString());
  historyUrl.searchParams.set("offset", offset.toString());

  const response = await fetch(historyUrl.toString(), {
    method: "GET",
    headers: {
      "X-API-KEY": ringgApiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Ringg API error: ${response.status}`);
  }

  return response.json();
}

async function syncSingleCall(
  supabase: any,
  ringgApiKey: string,
  supabaseUrl: string,
  supabaseServiceKey: string,
  targetRinggCallId: string,
  targetDbCallId: string
): Promise<{ success: boolean; error?: string; synced_data?: Record<string, unknown> }> {
  // Calculate date range (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  console.log(`Syncing call: ringg=${targetRinggCallId}, db=${targetDbCallId}`);

  // Fetch call history from Ringg API
  let matchingCall: RinggCall | undefined;
  let offset = 0;

  while (!matchingCall) {
    const historyData = await fetchRinggHistory(ringgApiKey, startDate, endDate, 100, offset);
    console.log(`Fetched ${historyData.calls.length} calls from Ringg (offset: ${offset}, total: ${historyData.total})`);

    matchingCall = historyData.calls.find(call => call.id === targetRinggCallId);
    
    if (!matchingCall && offset + 100 < historyData.total) {
      offset += 100;
    } else {
      break;
    }
  }

  if (!matchingCall) {
    return { success: false, error: "Call not found in Ringg history" };
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

  const { error: updateError } = await supabase
    .from("voice_widget_calls")
    .update(updateData)
    .eq("id", targetDbCallId);

  if (updateError) {
    console.error("Database update error:", updateError);
    return { success: false, error: "Failed to update database" };
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

  return {
    success: true,
    synced_data: {
      transcript_entries: Array.isArray(transcriptJson) ? transcriptJson.length : 0,
      recording_url: matchingCall.audio_recording ? "available" : "not available",
      call_duration: matchingCall.call_duration,
      call_status: matchingCall.status,
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { ringg_call_id, db_call_id, sync_all_incomplete } = body;
    
    console.log("Sync call data request:", { ringg_call_id, db_call_id, sync_all_incomplete });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ringgApiKey = Deno.env.get("RINGG_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle sync_all_incomplete mode
    if (sync_all_incomplete) {
      console.log("Syncing all incomplete calls...");
      
      // Find calls with ringg_call_id but missing platform_analysis or with old status
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      const { data: incompleteCalls, error: fetchError } = await supabase
        .from("voice_widget_calls")
        .select("id, ringg_call_id, call_status, created_at")
        .not("ringg_call_id", "is", null)
        .or(`call_status.eq.initiated,call_status.eq.in_progress,call_status.eq.ringing,platform_analysis.is.null`)
        .lt("created_at", twoMinutesAgo)
        .order("created_at", { ascending: false })
        .limit(20);

      if (fetchError) {
        console.error("Error fetching incomplete calls:", fetchError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch incomplete calls" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Found ${incompleteCalls?.length || 0} incomplete calls to sync`);

      const results: { id: string; success: boolean; error?: string }[] = [];
      
      for (const call of incompleteCalls || []) {
        if (call.ringg_call_id) {
          const result = await syncSingleCall(
            supabase,
            ringgApiKey,
            supabaseUrl,
            supabaseServiceKey,
            call.ringg_call_id,
            call.id
          );
          results.push({ id: call.id, success: result.success, error: result.error });
        }
      }

      // Also mark very old calls (> 30 mins) without ringg_call_id as failed
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      const { error: markFailedError } = await supabase
        .from("voice_widget_calls")
        .update({ call_status: "failed", updated_at: new Date().toISOString() })
        .is("ringg_call_id", null)
        .in("call_status", ["initiated", "in_progress", "ringing"])
        .lt("created_at", thirtyMinutesAgo);

      if (markFailedError) {
        console.error("Error marking old calls as failed:", markFailedError);
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`Synced ${successCount}/${results.length} calls`);

      return new Response(
        JSON.stringify({
          success: true,
          synced_count: successCount,
          total_count: results.length,
          results,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single call sync mode
    if (!ringg_call_id && !db_call_id) {
      return new Response(
        JSON.stringify({ error: "Either ringg_call_id or db_call_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      } else {
        return new Response(
          JSON.stringify({ error: "No database record found for this Ringg call" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const result = await syncSingleCall(
      supabase,
      ringgApiKey,
      supabaseUrl,
      supabaseServiceKey,
      targetRinggCallId!,
      targetDbCallId!
    );

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        db_call_id: targetDbCallId,
        ringg_call_id: targetRinggCallId,
        synced_data: result.synced_data,
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
