import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Clock,
  Target,
  MessageSquare,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContactInsightsCardProps {
  contact: any;
  scores: any;
  interactions: any[];
  tasks: any[];
}

interface Insight {
  id: string;
  type: "warning" | "opportunity" | "info" | "success";
  title: string;
  description: string;
  action?: string;
  actionIcon?: any;
  priority: number;
}

export function ContactInsightsCard({ contact, scores, interactions, tasks }: ContactInsightsCardProps) {
  const insights = useMemo(() => {
    const result: Insight[] = [];
    const current = scores?.current || {};

    // High churn risk
    if (current.churn_risk > 60) {
      result.push({
        id: "churn-risk",
        type: "warning",
        title: "High Churn Risk Detected",
        description: `Churn risk at ${current.churn_risk}%. Consider immediate retention outreach.`,
        action: "Schedule Call",
        actionIcon: Phone,
        priority: 1,
      });
    }

    // High intent but low engagement
    if (current.intent > 70 && current.engagement < 40) {
      result.push({
        id: "intent-gap",
        type: "opportunity",
        title: "Conversion Opportunity",
        description: `High intent (${current.intent}%) but engagement is low. A timely follow-up could convert.`,
        action: "Follow Up",
        actionIcon: MessageSquare,
        priority: 2,
      });
    }

    // No recent interaction
    const lastInteractionDate = contact.last_interaction_at 
      ? new Date(contact.last_interaction_at)
      : null;
    const daysSinceInteraction = lastInteractionDate
      ? Math.floor((Date.now() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    if (daysSinceInteraction && daysSinceInteraction > 14) {
      result.push({
        id: "stale-contact",
        type: "info",
        title: "Contact Going Cold",
        description: `No interaction in ${daysSinceInteraction} days. Re-engage before they forget you.`,
        action: "Re-engage",
        actionIcon: Zap,
        priority: 3,
      });
    }

    // High engagement + qualified = ready to close
    if (current.engagement > 70 && contact.lifecycle_stage === "qualified") {
      result.push({
        id: "ready-to-close",
        type: "success",
        title: "Ready to Advance",
        description: "High engagement suggests this lead is ready to move to opportunity stage.",
        action: "Update Stage",
        actionIcon: Target,
        priority: 2,
      });
    }

    // Optimal contact time insight
    if (contact.optimal_contact_time) {
      result.push({
        id: "optimal-time",
        type: "info",
        title: "Best Time to Reach",
        description: `AI suggests contacting around ${contact.optimal_contact_time} based on past interactions.`,
        priority: 5,
      });
    }

    // Pending urgent tasks
    const urgentTasks = tasks.filter((t) => t.priority === "urgent" || t.priority === "high");
    if (urgentTasks.length > 0) {
      result.push({
        id: "urgent-tasks",
        type: "warning",
        title: `${urgentTasks.length} Urgent Task${urgentTasks.length > 1 ? "s" : ""} Pending`,
        description: urgentTasks[0].title,
        priority: 1,
      });
    }

    // Sort by priority
    return result.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [contact, scores, interactions, tasks]);

  const typeStyles: Record<string, { bg: string; border: string; icon: any; iconColor: string }> = {
    warning: {
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      icon: AlertTriangle,
      iconColor: "text-amber-500",
    },
    opportunity: {
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
    },
    info: {
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
      icon: Clock,
      iconColor: "text-blue-500",
    },
    success: {
      bg: "bg-green-500/5",
      border: "border-green-500/20",
      icon: Target,
      iconColor: "text-green-500",
    },
  };

  if (insights.length === 0) {
    return (
      <Card className="border-none shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No insights at this time</p>
            <p className="text-xs">Insights will appear as patterns emerge</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-card bg-gradient-to-br from-primary/[0.02] to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Insights
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const style = typeStyles[insight.type];
          const TypeIcon = style.icon;
          const ActionIcon = insight.actionIcon;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-3 rounded-lg border",
                style.bg,
                style.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", style.iconColor)}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs mt-2 -ml-2 gap-1.5"
                    >
                      {ActionIcon && <ActionIcon className="h-3 w-3" />}
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
