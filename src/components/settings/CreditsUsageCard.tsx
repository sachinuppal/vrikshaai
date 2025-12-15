import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Coins, TrendingUp, Zap, FileText, Eye, Bot, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UsageStats {
  totalTokens: number;
  totalCost: number;
  byFeature: Record<string, { tokens: number; cost: number; count: number }>;
  byProvider: Record<string, { tokens: number; cost: number }>;
  recentUsage: Array<{ date: string; tokens: number; cost: number }>;
}

const FEATURE_ICONS: Record<string, any> = {
  script_chat: FileText,
  flowchart_generation: Zap,
  observability: Eye,
  crm_flow_builder: Bot,
};

const FEATURE_LABELS: Record<string, string> = {
  script_chat: "Script Chat",
  flowchart_generation: "Flowchart Generation",
  observability: "Observability Analysis",
  crm_flow_builder: "CRM Flow Builder",
};

export const CreditsUsageCard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "week" | "month">("month");

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, period]);

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      if (period === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const { data, error } = await supabase
        .from("ai_usage_log")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process stats
      const usageStats: UsageStats = {
        totalTokens: 0,
        totalCost: 0,
        byFeature: {},
        byProvider: {},
        recentUsage: [],
      };

      const dailyUsage: Record<string, { tokens: number; cost: number }> = {};

      (data || []).forEach((log) => {
        usageStats.totalTokens += log.total_tokens || 0;
        usageStats.totalCost += Number(log.cost_usd) || 0;

        // By feature
        if (!usageStats.byFeature[log.feature]) {
          usageStats.byFeature[log.feature] = { tokens: 0, cost: 0, count: 0 };
        }
        usageStats.byFeature[log.feature].tokens += log.total_tokens || 0;
        usageStats.byFeature[log.feature].cost += Number(log.cost_usd) || 0;
        usageStats.byFeature[log.feature].count += 1;

        // By provider
        if (!usageStats.byProvider[log.provider]) {
          usageStats.byProvider[log.provider] = { tokens: 0, cost: 0 };
        }
        usageStats.byProvider[log.provider].tokens += log.total_tokens || 0;
        usageStats.byProvider[log.provider].cost += Number(log.cost_usd) || 0;

        // Daily usage
        const date = new Date(log.created_at).toLocaleDateString();
        if (!dailyUsage[date]) {
          dailyUsage[date] = { tokens: 0, cost: 0 };
        }
        dailyUsage[date].tokens += log.total_tokens || 0;
        dailyUsage[date].cost += Number(log.cost_usd) || 0;
      });

      usageStats.recentUsage = Object.entries(dailyUsage)
        .map(([date, usage]) => ({ date, ...usage }))
        .slice(0, 7);

      setStats(usageStats);
    } catch (error) {
      console.error("Failed to load usage stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`;
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Credits Usage</CardTitle>
          </div>
          <div className="flex gap-1">
            {(["today", "week", "month"] as const).map((p) => (
              <Badge
                key={p}
                variant={period === p ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Badge>
            ))}
          </div>
        </div>
        <CardDescription>Token usage and costs across AI features</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !stats || stats.totalTokens === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No usage data yet</p>
            <p className="text-xs text-muted-foreground">
              Start using AI features to see your usage here
            </p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Total Tokens
                </div>
                <div className="mt-1 text-2xl font-bold">{formatTokens(stats.totalTokens)}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg border bg-gradient-to-br from-green-500/5 to-green-500/10 p-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  Total Cost
                </div>
                <div className="mt-1 text-2xl font-bold">{formatCost(stats.totalCost)}</div>
              </motion.div>
            </div>

            {/* By Feature */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Usage by Feature</h4>
              <div className="space-y-2">
                {Object.entries(stats.byFeature).map(([feature, usage], idx) => {
                  const Icon = FEATURE_ICONS[feature] || Zap;
                  const percentage = (usage.tokens / stats.totalTokens) * 100;
                  return (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{FEATURE_LABELS[feature] || feature}</span>
                          <Badge variant="secondary" className="text-xs">
                            {usage.count} calls
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatTokens(usage.tokens)} tokens</span>
                          <span className="font-mono">{formatCost(usage.cost)}</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* By Provider */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Usage by Provider</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byProvider).map(([provider, usage]) => (
                  <Badge key={provider} variant="outline" className="flex items-center gap-2 py-1.5">
                    <span className="capitalize">{provider}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTokens(usage.tokens)} · {formatCost(usage.cost)}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
