import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Phone, 
  Clock, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Download,
  RefreshCw,
  ArrowLeft,
  Loader2,
  User,
  Bot,
  Sparkles,
  Volume2,
  LayoutDashboard,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ObservabilityCard } from "@/components/ObservabilityCard";
import { maskPhoneNumber } from "@/lib/utils";

interface TranscriptEntry {
  role?: string;
  content?: string;
  bot?: string;
  user?: string;
}

interface PlatformAnalysis {
  summary?: string;
  classification?: string;
  key_points?: string[];
  action_items?: string[];
  call_disconnect_reason?: string;
}

interface ClientAnalysis {
  lead_quality?: string;
  intent_score?: number;
  next_action?: string;
  purchase_probability?: number;
  customer_segment?: string;
  satisfaction_score?: number;
  priority_score?: string;
  next_steps?: string;
  user_type?: string;
  investor_type?: string;
  sector_preference?: string;
  geography_preference?: string;
  business_stage?: string;
  interest_area?: string;
  interest_in_vriksha_model?: string;
}

interface ObservabilityAnalysis {
  overall_score: number;
  status: string;
  sections_covered: {
    section: string;
    covered: boolean;
    compliance_score: number;
    questions_asked?: string[];
    questions_missed?: string[];
  }[];
  tone_analysis: {
    professional: boolean;
    empathetic: boolean;
    clear: boolean;
  };
  guardrail_violations: string[];
  language_compliance: boolean;
  strengths: string[];
  improvements: string[];
  summary: string;
}

interface CallData {
  id: string;
  name: string;
  full_phone: string;
  call_status: string | null;
  call_duration: number | null;
  transcript: TranscriptEntry[] | null;
  platform_analysis: PlatformAnalysis | null;
  client_analysis: ClientAnalysis | null;
  recording_url: string | null;
  created_at: string;
  observability_analysis: ObservabilityAnalysis | null;
  observability_status: string | null;
  ringg_call_id: string | null;
}

const CallAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [callData, setCallData] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [runningObservability, setRunningObservability] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    fetchCallData();

    const channel = supabase
      .channel(`call-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "voice_widget_calls",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time update:", payload);
          setCallData(payload.new as unknown as CallData);
          setAnalyzing(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);

  const fetchCallData = async () => {
    if (!id) return;
    
    try {
      // Use edge function to fetch call data (bypasses RLS for anonymous access)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-call-analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId: id }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error("Error fetching call:", data.error);
        toast.error("Call not found");
        navigate("/");
        return;
      }

      setCallData(data as CallData);
      setLoading(false);

      if (data.call_status && !data.platform_analysis) {
        setAnalyzing(true);
      }
    } catch (error) {
      console.error("Error fetching call:", error);
      toast.error("Failed to load call data");
      navigate("/");
    }
  };

  const handleTryAgain = () => {
    // Keep user info for pre-fill but clear call-specific data
    sessionStorage.removeItem("voice_call_record_id");
    sessionStorage.removeItem("voice_captured");
    // Redirect to home page where they can start a new call
    navigate("/");
  };

  const runObservabilityAnalysis = async () => {
    if (!callData?.transcript || callData.transcript.length === 0) {
      toast.error("No transcript available to analyze");
      return;
    }

    setRunningObservability(true);
    
    try {
      const response = await supabase.functions.invoke("observe-call-script", {
        body: {
          call_id: callData.id,
          transcript: callData.transcript,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Script analysis complete!");
    } catch (error) {
      console.error("Observability analysis error:", error);
      toast.error("Failed to analyze script compliance");
    } finally {
      setRunningObservability(false);
    }
  };

  const syncCallData = async () => {
    if (!callData?.ringg_call_id) {
      toast.error("No call ID available for sync");
      return;
    }

    setSyncing(true);
    
    try {
      const response = await supabase.functions.invoke("sync-call-data", {
        body: { db_call_id: callData.id },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Call data synced successfully");
      fetchCallData();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync call data");
    } finally {
      setSyncing(false);
    }
  };

  const needsSync = callData?.ringg_call_id && !callData?.client_analysis;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case "high":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading call details...</p>
        </div>
      </div>
    );
  }

  if (!callData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/call-history")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Call History
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Call Analysis</h1>
                <p className="text-muted-foreground">
                  {callData.name} • {maskPhoneNumber(callData.full_phone)}
                </p>
              </div>
            </div>
            {needsSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncCallData}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                Sync Call Data
              </Button>
            )}
          </div>
        </motion.div>

        {/* Waiting for analysis state */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Analyzing your call...</h3>
                <p className="text-sm text-muted-foreground">
                  AI is processing your conversation. This usually takes 30-60 seconds.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs Interface */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-6 h-auto p-1 bg-muted/50 overflow-x-auto flex-nowrap">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background whitespace-nowrap">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 data-[state=active]:bg-background whitespace-nowrap">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Analysis</span>
              <span className="sm:hidden">Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center gap-2 data-[state=active]:bg-background whitespace-nowrap">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Transcript</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="observability" className="flex items-center gap-2 data-[state=active]:bg-background whitespace-nowrap">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Observability</span>
              <span className="sm:hidden">QA</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Call Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-border/50 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Call Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="font-medium">{formatDuration(callData.call_duration)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={callData.call_status === "completed" ? "default" : "secondary"}>
                        {callData.call_status || "In Progress"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Date</span>
                      <span className="text-sm">
                        {new Date(callData.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Time</span>
                      <span className="text-sm">
                        {new Date(callData.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Insights Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="border-border/50 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {callData.client_analysis ? (
                      <>
                        {(callData.client_analysis.priority_score || callData.client_analysis.lead_quality) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Lead Quality</span>
                            <Badge className={getQualityColor(callData.client_analysis.priority_score || callData.client_analysis.lead_quality || "")}>
                              {callData.client_analysis.priority_score || callData.client_analysis.lead_quality}
                            </Badge>
                          </div>
                        )}
                        {(callData.client_analysis.user_type || callData.client_analysis.investor_type) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">User Type</span>
                            <Badge variant="secondary">
                              {callData.client_analysis.investor_type || callData.client_analysis.user_type}
                            </Badge>
                          </div>
                        )}
                        {callData.client_analysis.interest_area && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Interest Area</span>
                            <span className="text-sm font-medium">{callData.client_analysis.interest_area}</span>
                          </div>
                        )}
                        {callData.client_analysis.business_stage && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Business Stage</span>
                            <Badge variant="outline">{callData.client_analysis.business_stage}</Badge>
                          </div>
                        )}
                        {(callData.client_analysis.next_steps || callData.client_analysis.next_action) && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Next Action</span>
                            <Badge variant="outline" className="max-w-[180px] truncate">
                              {callData.client_analysis.next_steps || callData.client_analysis.next_action}
                            </Badge>
                          </div>
                        )}
                      </>
                    ) : callData.platform_analysis ? (
                      <>
                        {callData.platform_analysis.classification && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Classification</span>
                            <Badge variant="secondary">{callData.platform_analysis.classification}</Badge>
                          </div>
                        )}
                        {callData.platform_analysis.call_disconnect_reason && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Disconnect Reason</span>
                            <span className="text-sm font-medium">{callData.platform_analysis.call_disconnect_reason}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            AI insights not available for this call. Only basic call data is shown.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <p className="text-sm">AI insights not available for this call</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Audio Player - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2"
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-primary" />
                      Call Recording
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {callData.recording_url ? (
                      <audio
                        ref={(el) => setAudioRef(el)}
                        src={callData.recording_url}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full"
                        controls
                      />
                    ) : (
                      <div className="flex items-center justify-center py-6 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                        <div className="text-center">
                          <Volume2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Recording not available yet</p>
                          <p className="text-xs mt-1 opacity-70">The recording will appear here once processed</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Buttons - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="md:col-span-2 flex flex-col sm:flex-row gap-3"
              >
                <Button onClick={handleTryAgain} className="flex-1" size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Another Call
                </Button>
                {callData.recording_url && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => window.open(callData.recording_url!, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Recording
                  </Button>
                )}
              </motion.div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {callData.platform_analysis ? (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary */}
                    {callData.platform_analysis.summary && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
                        <p className="text-foreground">{callData.platform_analysis.summary}</p>
                      </div>
                    )}

                    {/* Key Points */}
                    {callData.platform_analysis.key_points && callData.platform_analysis.key_points.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Points</h4>
                        <ul className="space-y-2">
                          {callData.platform_analysis.key_points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Items */}
                    {callData.platform_analysis.action_items && callData.platform_analysis.action_items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Action Items</h4>
                        <ul className="space-y-2">
                          {callData.platform_analysis.action_items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="h-4 w-4 rounded border border-primary mt-0.5 shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Additional Client Insights */}
                    {callData.client_analysis && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Additional Insights</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {callData.client_analysis.sector_preference && (
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <span className="text-sm text-muted-foreground">Sector Preference</span>
                              <span className="text-sm font-medium">{callData.client_analysis.sector_preference}</span>
                            </div>
                          )}
                          {callData.client_analysis.geography_preference && (
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <span className="text-sm text-muted-foreground">Geography</span>
                              <span className="text-sm font-medium">{callData.client_analysis.geography_preference}</span>
                            </div>
                          )}
                          {callData.client_analysis.interest_in_vriksha_model && (
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <span className="text-sm text-muted-foreground">Interest Level</span>
                              <Badge className={getQualityColor(callData.client_analysis.interest_in_vriksha_model)}>
                                {callData.client_analysis.interest_in_vriksha_model}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-1">Analysis not available yet</h3>
                    <p className="text-sm text-muted-foreground">
                      AI analysis will appear here once the call is processed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {callData.transcript && callData.transcript.length > 0 ? (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Conversation Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {callData.transcript.map((entry, idx) => {
                          const isBot = entry.role === "assistant" || entry.bot;
                          const message = entry.content || entry.bot || entry.user;
                          
                          if (!message) return null;

                          return (
                            <div
                              key={idx}
                              className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}
                            >
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                  isBot ? "bg-primary/10" : "bg-muted"
                                }`}
                              >
                                {isBot ? (
                                  <Bot className="h-4 w-4 text-primary" />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                  isBot
                                    ? "bg-muted text-foreground"
                                    : "bg-primary text-primary-foreground"
                                }`}
                              >
                                <p className="text-sm">{message}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-1">No transcript available yet</h3>
                    <p className="text-sm text-muted-foreground">
                      The transcript will appear here once the call is completed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Observability Tab */}
          <TabsContent value="observability" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {callData.transcript && callData.transcript.length > 0 ? (
                <ObservabilityCard
                  analysis={callData.observability_analysis}
                  status={callData.observability_status}
                  onRunAnalysis={runObservabilityAnalysis}
                  isAnalyzing={runningObservability || callData.observability_status === "analyzing"}
                />
              ) : (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-1">Script analysis requires a transcript</h3>
                    <p className="text-sm text-muted-foreground">
                      The observability analysis will be available once the call transcript is ready.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default CallAnalysis;
