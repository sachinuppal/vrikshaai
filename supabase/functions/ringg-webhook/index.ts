import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface TranscriptEntry {
  role?: string;
  content?: string;
  bot?: string;
  user?: string;
}

interface CallCompletedPayload {
  event_type: "call_completed";
  call_id: string;
  call_sid: string;
  call_duration: number;
  call_type: string;
  status: string;
  to_number: string;
  from_number: string;
  agent_id: string;
  workspace_id: string;
  custom_args_values: Record<string, string>;
  transcript: TranscriptEntry[];
  retry_count: number;
}

interface PlatformAnalysisPayload {
  event_type: "platform_analysis_completed";
  call_id: string;
  call_sid: string;
  analysis_data: {
    summary: string;
    classification: string;
    key_points: string[];
    action_items: string[];
    callback_requested_time?: string;
    status: string;
    call_disconnect_reason: string;
    timezone: string;
  };
  transcript: TranscriptEntry[];
}

interface ClientAnalysisPayload {
  event_type: "client_analysis_completed";
  call_id: string;
  call_sid: string;
  analysis_data: {
    lead_quality: string;
    intent_score: number;
    next_action: string;
    purchase_probability: number;
    customer_segment: string;
    satisfaction_score: number;
  };
}

interface RecordingCompletedPayload {
  event_type: "recording_completed";
  call_id: string;
  call_sid: string;
  recording_url: string;
  recording_duration: number;
}

type WebhookPayload = CallCompletedPayload | PlatformAnalysisPayload | ClientAnalysisPayload | RecordingCompletedPayload;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("RINGG_WEBHOOK_SECRET");
    const incomingSecret = req.headers.get("x-webhook-secret") || req.headers.get("authorization")?.replace("Bearer ", "");
    
    // Verify webhook authenticity
    if (webhookSecret && incomingSecret !== webhookSecret) {
      console.error("Invalid webhook secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: WebhookPayload = await req.json();
    console.log("Received Ringg webhook:", payload.event_type, payload.call_id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the call record by ringg_call_id or the most recent call
    let callRecord;
    
    // First try to find by ringg_call_id
    const { data: existingCall } = await supabase
      .from("voice_widget_calls")
      .select("*")
      .eq("ringg_call_id", payload.call_id)
      .single();

    if (existingCall) {
      callRecord = existingCall;
    } else if (payload.event_type === "call_completed") {
      // For call_completed, try to match by phone number from custom_args
      const callPayload = payload as CallCompletedPayload;
      const callerPhone = callPayload.custom_args_values?.caller_phone;
      
      if (callerPhone) {
        const { data: phoneMatch } = await supabase
          .from("voice_widget_calls")
          .select("*")
          .eq("full_phone", callerPhone)
          .is("ringg_call_id", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        callRecord = phoneMatch;
      }
    }

    if (!callRecord) {
      console.log("No matching call record found for call_id:", payload.call_id);
      // Still return 200 to acknowledge receipt
      return new Response(JSON.stringify({ success: true, message: "No matching record found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update based on event type
    let updateData: Record<string, unknown> = {
      ringg_call_id: payload.call_id,
    };

    switch (payload.event_type) {
      case "call_completed": {
        const callData = payload as CallCompletedPayload;
        updateData = {
          ...updateData,
          call_status: callData.status,
          call_duration: callData.call_duration,
          transcript: callData.transcript,
        };
        console.log("Updating call_completed data");
        break;
      }

      case "platform_analysis_completed": {
        const analysisData = payload as PlatformAnalysisPayload;
        updateData = {
          ...updateData,
          platform_analysis: analysisData.analysis_data,
          // Also update transcript if provided
          ...(analysisData.transcript && { transcript: analysisData.transcript }),
        };
        console.log("Updating platform_analysis data");
        break;
      }

      case "client_analysis_completed": {
        const clientData = payload as ClientAnalysisPayload;
        updateData = {
          ...updateData,
          client_analysis: clientData.analysis_data,
        };
        console.log("Updating client_analysis data");
        break;
      }

      case "recording_completed": {
        const recordingData = payload as RecordingCompletedPayload;
        updateData = {
          ...updateData,
          recording_url: recordingData.recording_url,
        };
        console.log("Updating recording_url");
        break;
      }

      default:
        console.log("Unknown event type:", (payload as { event_type: string }).event_type);
    }

    // Perform the update
    const { error: updateError } = await supabase
      .from("voice_widget_calls")
      .update(updateData)
      .eq("id", callRecord.id);

    if (updateError) {
      console.error("Error updating call record:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully processed webhook for call:", payload.call_id);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
