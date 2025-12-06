import { useState, useEffect, useCallback, useRef } from "react";

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
  has_transcript: boolean;
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

const POLL_INTERVAL = 5000; // 5 seconds

export const useCallStatus = (): UseCallStatusReturn => {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [callId, setCallId] = useState<string | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch call status via edge function
  const fetchCallStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-call-status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId: id }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("[CallStatus] Error fetching status:", error);
        return null;
      }

      const data = await response.json();
      return data as CallData;
    } catch (error) {
      console.error("[CallStatus] Network error:", error);
      return null;
    }
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
    sessionStorage.removeItem("voice_call_record_id");
    setStatus("idle");
    setCallId(null);
    setCallData(null);
    
    // Clear polling interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Check for active call on mount
  useEffect(() => {
    const isActive = sessionStorage.getItem("voice_call_active") === "true";
    const recordId = sessionStorage.getItem("voice_call_record_id");
    
    if (isActive && recordId) {
      setCallId(recordId);
      // Fetch initial status
      fetchCallStatus(recordId).then((data) => {
        if (data) {
          setCallData(data);
          setStatus(deriveStatus(data));
        } else {
          setStatus("initiated");
        }
      });
    }
  }, [deriveStatus, fetchCallStatus]);

  // Set up polling instead of realtime subscription
  useEffect(() => {
    if (!callId) return;

    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll for updates
    const poll = async () => {
      const data = await fetchCallStatus(callId);
      if (data) {
        setCallData(data);
        const newStatus = deriveStatus(data);
        setStatus(newStatus);
        console.log("[CallStatus] Poll update:", newStatus, data);
        
        // Stop polling once analysis is ready
        if (newStatus === "analysis_ready" && pollIntervalRef.current) {
          console.log("[CallStatus] Analysis ready, stopping polling");
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    };

    // Start polling
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);
    
    // Also poll immediately
    poll();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [callId, deriveStatus, fetchCallStatus]);

  return {
    status,
    callId,
    callData,
    isActive: status !== "idle",
    clearCall,
    startCall,
  };
};
