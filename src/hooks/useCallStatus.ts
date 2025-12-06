import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CallStatus = 
  | "idle"
  | "initiated"
  | "in_progress"
  | "completed"
  | "analyzing"
  | "analysis_ready";

interface CallData {
  id: string;
  call_status: string | null;
  platform_analysis: unknown;
  client_analysis: unknown;
  transcript: unknown;
  call_duration: number | null;
}

interface UseCallStatusReturn {
  status: CallStatus;
  callId: string | null;
  callData: CallData | null;
  isActive: boolean;
  clearCall: () => void;
  startCall: (recordId: string) => void;
}

export const useCallStatus = (): UseCallStatusReturn => {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [callId, setCallId] = useState<string | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);

  // Derive status from call data
  const deriveStatus = useCallback((data: CallData): CallStatus => {
    if (!data) return "idle";
    
    const hasAnalysis = data.platform_analysis && data.client_analysis;
    const isCompleted = data.call_status === "completed";
    
    if (hasAnalysis) return "analysis_ready";
    if (isCompleted && !hasAnalysis) return "analyzing";
    if (data.call_status === "in_progress") return "in_progress";
    if (data.call_status) return "completed";
    return "initiated";
  }, []);

  // Start tracking a call
  const startCall = useCallback((recordId: string) => {
    sessionStorage.setItem("voice_call_active", "true");
    sessionStorage.setItem("voice_call_record_id", recordId);
    setCallId(recordId);
    setStatus("initiated");
  }, []);

  // Clear call state
  const clearCall = useCallback(() => {
    sessionStorage.removeItem("voice_call_active");
    setStatus("idle");
    setCallId(null);
    setCallData(null);
  }, []);

  // Check for active call on mount
  useEffect(() => {
    const isActive = sessionStorage.getItem("voice_call_active") === "true";
    const recordId = sessionStorage.getItem("voice_call_record_id");
    
    if (isActive && recordId) {
      setCallId(recordId);
      // Fetch initial status
      supabase
        .from("voice_widget_calls")
        .select("id, call_status, platform_analysis, client_analysis, transcript, call_duration")
        .eq("id", recordId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setCallData(data as CallData);
            setStatus(deriveStatus(data as CallData));
          } else {
            setStatus("initiated");
          }
        });
    }
  }, [deriveStatus]);

  // Set up realtime subscription
  useEffect(() => {
    if (!callId) return;

    const channel = supabase
      .channel(`call-status-${callId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "voice_widget_calls",
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          const newData = payload.new as CallData;
          setCallData(newData);
          const newStatus = deriveStatus(newData);
          setStatus(newStatus);
          
          // Auto-clear after viewing if needed
          console.log("[CallStatus] Update received:", newStatus, newData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId, deriveStatus]);

  return {
    status,
    callId,
    callData,
    isActive: status !== "idle",
    clearCall,
    startCall,
  };
};
