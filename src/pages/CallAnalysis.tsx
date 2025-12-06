import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Phone, 
  Clock, 
  CheckCircle2, 
  Star, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Download,
  RefreshCw,
  ArrowLeft,
  Loader2,
  User,
  Bot,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  // Original expected fields (keep for compatibility)
  lead_quality?: string;
  intent_score?: number;
  next_action?: string;
  purchase_probability?: number;
  customer_segment?: string;
  satisfaction_score?: number;
  // Actual Ringg fields
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
}

const CallAnalysis = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [callData, setCallData] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    // Initial fetch
    fetchCallData();

    // Set up real-time subscription
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
    
    const { data, error } = await supabase
      .from("voice_widget_calls")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Error fetching call:", error);
      navigate("/");
      return;
    }

    setCallData(data as unknown as CallData);
    setLoading(false);

    // Check if still waiting for analysis
    if (data.call_status && !data.platform_analysis) {
      setAnalyzing(true);
    }
  };

  const handleTryAgain = () => {
    // Clear session data
    sessionStorage.removeItem("voice_call_record_id");
    sessionStorage.removeItem("voice_captured");
    sessionStorage.removeItem("voice_user_name");
    sessionStorage.removeItem("voice_user_phone");
    navigate("/");
  };

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
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Call Analysis</h1>
              <p className="text-muted-foreground">
                {callData.name} • {callData.full_phone}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Waiting for analysis state */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-6 rounded-xl border border-primary/20 bg-primary/5"
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Summary & Metrics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Call Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50">
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Client Analysis Metrics */}
            {callData.client_analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Insights
                    </CardTitle>
                  </CardHeader>
                <CardContent className="space-y-4">
                    {/* Lead Quality - use priority_score as fallback */}
                    {(callData.client_analysis.priority_score || callData.client_analysis.lead_quality) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Lead Quality</span>
                        <Badge className={getQualityColor(callData.client_analysis.priority_score || callData.client_analysis.lead_quality)}>
                          {callData.client_analysis.priority_score || callData.client_analysis.lead_quality}
                        </Badge>
                      </div>
                    )}
                    
                    {/* User Type */}
                    {(callData.client_analysis.user_type || callData.client_analysis.investor_type) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">User Type</span>
                        <Badge variant="secondary">
                          {callData.client_analysis.investor_type || callData.client_analysis.user_type}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Interest Area */}
                    {callData.client_analysis.interest_area && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Interest Area</span>
                        <span className="text-sm font-medium">{callData.client_analysis.interest_area}</span>
                      </div>
                    )}
                    
                    {/* Sector Preference */}
                    {callData.client_analysis.sector_preference && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Sector Preference</span>
                        <span className="text-sm font-medium">{callData.client_analysis.sector_preference}</span>
                      </div>
                    )}
                    
                    {/* Geography Preference */}
                    {callData.client_analysis.geography_preference && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Geography</span>
                        <span className="text-sm font-medium">{callData.client_analysis.geography_preference}</span>
                      </div>
                    )}
                    
                    {/* Business Stage */}
                    {callData.client_analysis.business_stage && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Business Stage</span>
                        <Badge variant="outline">{callData.client_analysis.business_stage}</Badge>
                      </div>
                    )}
                    
                    {/* Interest in Vriksha Model */}
                    {callData.client_analysis.interest_in_vriksha_model && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Interest Level</span>
                        <Badge className={getQualityColor(callData.client_analysis.interest_in_vriksha_model)}>
                          {callData.client_analysis.interest_in_vriksha_model}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Next Action - use next_steps as fallback */}
                    {(callData.client_analysis.next_steps || callData.client_analysis.next_action) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Next Action</span>
                        <Badge variant="outline" className="max-w-[180px] truncate">
                          {callData.client_analysis.next_steps || callData.client_analysis.next_action}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Button onClick={handleTryAgain} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Another Call
              </Button>
              {callData.recording_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(callData.recording_url!, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Recording
                </Button>
              )}
            </motion.div>
          </div>

          {/* Right column - Analysis & Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Analysis */}
            {callData.platform_analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
                      <p className="text-foreground">{callData.platform_analysis.summary}</p>
                    </div>

                    {/* Key Points */}
                    {callData.platform_analysis.key_points?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Key Points</h4>
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
                    {callData.platform_analysis.action_items?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Action Items</h4>
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
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Transcript */}
            {callData.transcript && callData.transcript.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {callData.transcript.map((entry, idx) => {
                          // Handle both formats: {role, content} and {bot, user}
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
              </motion.div>
            )}

            {/* No transcript yet */}
            {(!callData.transcript || callData.transcript.length === 0) && !analyzing && (
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CallAnalysis;
