import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Zap,
  ArrowRight,
  Play,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Target,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow, addDays, addHours } from "date-fns";

interface PredictiveTimelineProps {
  contactId: string;
  interactions: any[];
  tasks: any[];
  contact: any;
}

interface PredictedAction {
  id: string;
  type: "call" | "email" | "sms" | "whatsapp" | "meeting" | "task";
  title: string;
  description: string;
  predictedTime: Date;
  confidence: number;
  reason: string;
  flowName?: string;
  priority: "high" | "medium" | "low";
}

const channelIcons: Record<string, any> = {
  voice_ai: Phone,
  voice_human: Phone,
  voice: Phone,
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  sms: MessageSquare,
  meeting: Calendar,
  task: CheckCircle2,
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export function PredictiveTimeline({
  contactId,
  interactions,
  tasks,
  contact,
}: PredictiveTimelineProps) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [predictedActions, setPredictedActions] = useState<PredictedAction[]>([]);
  const [activeFlows, setActiveFlows] = useState<any[]>([]);

  useEffect(() => {
    fetchActiveFlows();
    generatePredictions();
  }, [contactId, contact, tasks]);

  const fetchActiveFlows = async () => {
    try {
      const { data } = await supabase
        .from("crm_agentic_flows")
        .select("*")
        .eq("status", "published")
        .limit(5);
      setActiveFlows(data || []);
    } catch (error) {
      console.error("Error fetching flows:", error);
    }
  };

  const generatePredictions = () => {
    const predictions: PredictedAction[] = [];
    const now = new Date();

    // Generate predictions based on contact data and active tasks
    if (contact.lifecycle_stage === "lead" && contact.intent_score > 50) {
      predictions.push({
        id: "pred-1",
        type: "call",
        title: "Qualification Call",
        description: "High-intent lead detected. AI suggests a qualification call to convert.",
        predictedTime: addHours(now, 2),
        confidence: 85,
        reason: `Intent score of ${contact.intent_score}% indicates strong interest`,
        priority: "high",
      });
    }

    if (contact.engagement_score < 30 && contact.lifecycle_stage !== "churned") {
      predictions.push({
        id: "pred-2",
        type: "email",
        title: "Re-engagement Email",
        description: "Low engagement detected. Automated re-engagement sequence recommended.",
        predictedTime: addDays(now, 1),
        confidence: 72,
        reason: `Engagement dropped to ${contact.engagement_score}%`,
        priority: "medium",
      });
    }

    if (contact.churn_risk > 60) {
      predictions.push({
        id: "pred-3",
        type: "call",
        title: "Retention Outreach",
        description: "High churn risk detected. Priority retention call recommended.",
        predictedTime: addHours(now, 4),
        confidence: 90,
        reason: `Churn risk at ${contact.churn_risk}% - immediate action needed`,
        priority: "high",
      });
    }

    // Add predictions from pending tasks
    tasks.forEach((task, index) => {
      if (task.status === "pending" && task.due_at) {
        predictions.push({
          id: `task-${task.id}`,
          type: task.task_type || "task",
          title: task.title,
          description: task.description || "Scheduled task from automation",
          predictedTime: new Date(task.due_at),
          confidence: 100,
          reason: task.ai_reason || "Scheduled by automation",
          flowName: task.ai_generated ? "AI Generated" : undefined,
          priority: task.priority || "medium",
        });
      }
    });

    // Sort by predicted time
    predictions.sort((a, b) => a.predictedTime.getTime() - b.predictedTime.getTime());
    setPredictedActions(predictions);
  };

  const sentimentColors: Record<string, string> = {
    positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    mixed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };

  const renderPastInteractions = () => (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {interactions.slice(0, 10).map((interaction, index) => {
          const Icon = channelIcons[interaction.channel] || MessageSquare;
          return (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="relative pl-14"
            >
              <div className="absolute left-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{interaction.channel}</Badge>
                    {interaction.sentiment && (
                      <Badge className={sentimentColors[interaction.sentiment]}>
                        {interaction.sentiment}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(interaction.occurred_at), { addSuffix: true })}
                  </span>
                </div>
                {interaction.summary && (
                  <p className="text-sm text-muted-foreground">{interaction.summary}</p>
                )}
                {interaction.duration_seconds && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {Math.floor(interaction.duration_seconds / 60)}m {interaction.duration_seconds % 60}s
                  </p>
                )}
                {interaction.source_id && ['voice_ai', 'voice', 'call', 'voice_human'].includes(interaction.channel) && (
                  <Link 
                    to={`/call-analysis/${interaction.source_id}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                  >
                    View Call Analysis <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderCurrentStatus = () => (
    <div className="space-y-4">
      <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Current State</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {contact.lifecycle_stage} • Last active{" "}
              {contact.last_interaction_at
                ? formatDistanceToNow(new Date(contact.last_interaction_at), { addSuffix: true })
                : "Never"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-background">
            <div className="text-2xl font-bold text-primary">{contact.intent_score}%</div>
            <div className="text-xs text-muted-foreground">Intent</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background">
            <div className="text-2xl font-bold text-primary">{contact.engagement_score}%</div>
            <div className="text-xs text-muted-foreground">Engagement</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background">
            <div className="text-2xl font-bold text-destructive">{contact.churn_risk}%</div>
            <div className="text-xs text-muted-foreground">Churn Risk</div>
          </div>
        </div>
      </div>

      {/* Active in Flows */}
      {activeFlows.length > 0 && (
        <div className="p-4 rounded-lg border">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Active Automation Flows
          </h4>
          <div className="space-y-2">
            {activeFlows.slice(0, 3).map((flow) => (
              <div
                key={flow.id}
                className="flex items-center justify-between p-2 rounded bg-muted/50"
              >
                <span className="text-sm">{flow.name}</span>
                <Badge variant="outline" className="text-xs">
                  {flow.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFuturePredictions = () => (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
      <div className="space-y-4">
        <AnimatePresence>
          {predictedActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No predicted actions at this time</p>
              <p className="text-sm">Actions will appear based on contact behavior and active flows</p>
            </div>
          ) : (
            predictedActions.map((action, index) => {
              const Icon = channelIcons[action.type] || Zap;
              const isPast = action.predictedTime < new Date();

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-14"
                >
                  <div
                    className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isPast
                        ? "bg-muted"
                        : action.priority === "high"
                        ? "bg-red-500/20"
                        : "bg-primary/20"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isPast
                          ? "text-muted-foreground"
                          : action.priority === "high"
                          ? "text-red-500"
                          : "text-primary"
                      }`}
                    />
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      action.priority === "high"
                        ? "border-red-500/30 bg-red-500/5"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.title}</span>
                        {action.flowName && (
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {action.flowName}
                          </Badge>
                        )}
                      </div>
                      <Badge className={priorityColors[action.priority]}>
                        {action.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {action.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(action.predictedTime, "MMM d, h:mm a")}
                        <span className="text-primary/70">
                          ({formatDistanceToNow(action.predictedTime, { addSuffix: true })})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">{action.confidence}% confidence</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-dashed">
                      <p className="text-xs text-muted-foreground italic">
                        <Zap className="h-3 w-3 inline mr-1" />
                        {action.reason}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Execute Now
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs h-7">
                        Edit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Predictive Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="past" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Past ({interactions.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <Circle className="h-3 w-3 mr-1" />
              Current
            </TabsTrigger>
            <TabsTrigger value="future" className="text-xs">
              <ArrowRight className="h-3 w-3 mr-1" />
              Future ({predictedActions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="past" className="mt-0 max-h-[500px] overflow-y-auto">
            {interactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No past interactions
              </div>
            ) : (
              renderPastInteractions()
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            {renderCurrentStatus()}
          </TabsContent>

          <TabsContent value="future" className="mt-0 max-h-[500px] overflow-y-auto">
            {renderFuturePredictions()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
