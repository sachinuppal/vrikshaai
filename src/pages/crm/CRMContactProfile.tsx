import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Zap,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  Clock,
  CheckSquare,
  Star,
  ExternalLink,
  Play,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { DynamicIndustryGraph } from "@/components/crm/DynamicIndustryGraph";

interface Contact360 {
  contact: any;
  variables: any[];
  variables_by_name: Record<string, any>;
  interactions: any[];
  timeline_summary: any;
  scores: any;
  predictions: any[];
  tasks: any[];
  industry: any;
}

export default function CRMContactProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Contact360 | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchContact360();
    }
  }, [id]);

  const fetchContact360 = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke(
        "crm-get-contact-360",
        {
          body: {},
          headers: {},
        }
      );

      // Since we can't pass query params easily, fetch directly
      const [contactRes, variablesRes, interactionsRes, tasksRes] = await Promise.all([
        supabase.from("crm_contacts").select("*").eq("id", id).single(),
        supabase.from("crm_variables").select("*").eq("contact_id", id).eq("is_current", true),
        supabase.from("crm_interactions").select("*").eq("contact_id", id).order("occurred_at", { ascending: false }).limit(50),
        supabase.from("crm_tasks").select("*").eq("contact_id", id).in("status", ["pending", "in_progress"]).order("due_at", { ascending: true }),
      ]);

      if (contactRes.error) throw contactRes.error;

      // Build variables by name
      const variablesByName: Record<string, any> = {};
      for (const v of variablesRes.data || []) {
        variablesByName[v.variable_name] = v;
      }

      // Channel breakdown
      const channelBreakdown: Record<string, number> = {};
      for (const i of interactionsRes.data || []) {
        channelBreakdown[i.channel] = (channelBreakdown[i.channel] || 0) + 1;
      }

      setData({
        contact: contactRes.data,
        variables: variablesRes.data || [],
        variables_by_name: variablesByName,
        interactions: interactionsRes.data || [],
        timeline_summary: {
          total_interactions: interactionsRes.data?.length || 0,
          channel_breakdown: channelBreakdown,
        },
        scores: {
          current: {
            intent: contactRes.data.intent_score,
            urgency: contactRes.data.urgency_score,
            engagement: contactRes.data.engagement_score,
            ltv_prediction: contactRes.data.ltv_prediction,
            churn_risk: contactRes.data.churn_risk,
          },
        },
        predictions: [],
        tasks: tasksRes.data || [],
        industry: null,
      });
    } catch (error) {
      console.error("Error fetching contact 360:", error);
    } finally {
      setLoading(false);
    }
  };

  const lifecycleColors: Record<string, string> = {
    lead: "bg-blue-500",
    qualified: "bg-amber-500",
    opportunity: "bg-purple-500",
    customer: "bg-green-500",
    churned: "bg-red-500",
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const channelIcons: Record<string, any> = {
    voice_ai: Phone,
    voice_human: Phone,
    email: Mail,
    whatsapp: MessageSquare,
    sms: MessageSquare,
    web: ExternalLink,
    meeting: Calendar,
  };

  if (loading) {
    return (
      <CRMLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        </div>
      </CRMLayout>
    );
  }

  if (!data?.contact) {
    return (
      <CRMLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Contact Not Found</h2>
          <Button onClick={() => navigate("/crm/contacts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </div>
      </CRMLayout>
    );
  }

  const { contact, variables, interactions, scores, tasks, timeline_summary } = data;

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/crm/contacts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-card overflow-hidden">
            <div className={`h-2 ${lifecycleColors[contact.lifecycle_stage] || "bg-gray-500"}`} />
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-primary">
                    {(contact.full_name || "U")[0].toUpperCase()}
                  </span>
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">
                      {contact.full_name || "Unknown Contact"}
                    </h1>
                    <Badge className={`${lifecycleColors[contact.lifecycle_stage]} text-white`}>
                      {contact.lifecycle_stage}
                    </Badge>
                    {contact.user_type && (
                      <Badge variant="outline">{contact.user_type}</Badge>
                    )}
                    {contact.primary_industry && (
                      <Badge variant="secondary">{contact.primary_industry}</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {contact.company_name && (
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {contact.company_name}
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Scores */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(scores.current.intent)}`}>
                      {scores.current.intent}%
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                      <Zap className="h-3 w-3" /> Intent
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(scores.current.engagement)}`}>
                      {scores.current.engagement}%
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                      <TrendingUp className="h-3 w-3" /> Engagement
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(100 - scores.current.churn_risk)}`}>
                      {scores.current.churn_risk}%
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                      <AlertTriangle className="h-3 w-3" /> Churn Risk
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Variables & Scores */}
          <div className="space-y-6">
            {/* Scores Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-none shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">AI Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-amber-500" /> Intent
                      </span>
                      <span className="font-medium">{scores.current.intent}%</span>
                    </div>
                    <Progress value={scores.current.intent} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" /> Engagement
                      </span>
                      <span className="font-medium">{scores.current.engagement}%</span>
                    </div>
                    <Progress value={scores.current.engagement} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-purple-500" /> Urgency
                      </span>
                      <span className="font-medium">{scores.current.urgency}%</span>
                    </div>
                    <Progress value={scores.current.urgency} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" /> Churn Risk
                      </span>
                      <span className="font-medium">{scores.current.churn_risk}%</span>
                    </div>
                    <Progress value={scores.current.churn_risk} className="h-2 [&>div]:bg-red-500" />
                  </div>
                  {scores.current.ltv_prediction > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-sm text-muted-foreground">Predicted LTV</div>
                          <div className="text-xl font-bold text-green-600">
                            ₹{scores.current.ltv_prediction.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Variables Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Captured Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  {variables.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No variables captured yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {variables.map((variable) => (
                        <div
                          key={variable.id}
                          className="p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              {variable.variable_name.replace(/_/g, " ")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {variable.source_channel}
                            </Badge>
                          </div>
                          <div className="text-sm font-medium">
                            {variable.variable_value}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Confidence: {Math.round(variable.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tasks Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-none shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No pending tasks
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-sm">{task.title}</span>
                            <Badge
                              variant={
                                task.priority === "urgent"
                                  ? "destructive"
                                  : task.priority === "high"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          {task.due_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {new Date(task.due_at).toLocaleDateString()}
                            </p>
                          )}
                          {task.ai_generated && (
                            <Badge variant="outline" className="text-xs mt-2">
                              <Zap className="h-3 w-3 mr-1" /> AI Generated
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Industry Graph */}
            {contact.primary_industry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <DynamicIndustryGraph
                  primaryIndustry={contact.primary_industry}
                  contactId={contact.id}
                />
              </motion.div>
            )}
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Interaction Timeline</CardTitle>
                    <div className="flex gap-2">
                      {Object.entries(timeline_summary.channel_breakdown).map(([channel, count]) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}: {count as number}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {interactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No interactions recorded yet
                    </p>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                      <div className="space-y-6">
                        {interactions.map((interaction, index) => {
                          const Icon = channelIcons[interaction.channel] || MessageSquare;
                          const sentimentColors: Record<string, string> = {
                            positive: "bg-green-100 text-green-800",
                            negative: "bg-red-100 text-red-800",
                            neutral: "bg-gray-100 text-gray-800",
                            mixed: "bg-amber-100 text-amber-800",
                          };

                          return (
                            <motion.div
                              key={interaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="relative pl-14"
                            >
                              {/* Icon */}
                              <div className="absolute left-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>

                              {/* Content */}
                              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{interaction.channel}</Badge>
                                    <Badge variant="secondary">{interaction.direction}</Badge>
                                    {interaction.sentiment && (
                                      <Badge className={sentimentColors[interaction.sentiment]}>
                                        {interaction.sentiment}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(interaction.occurred_at).toLocaleString()}
                                  </span>
                                </div>

                                {interaction.summary && (
                                  <p className="text-sm mb-2">{interaction.summary}</p>
                                )}

                                {interaction.duration_seconds && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Duration: {Math.floor(interaction.duration_seconds / 60)}m {interaction.duration_seconds % 60}s
                                  </p>
                                )}

                                {interaction.recording_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => window.open(interaction.recording_url, "_blank")}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Play Recording
                                  </Button>
                                )}

                                {interaction.intent_detected && interaction.intent_detected.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {interaction.intent_detected.map((intent: string) => (
                                      <Badge key={intent} variant="outline" className="text-xs">
                                        {intent}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
