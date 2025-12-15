import { motion } from "framer-motion";
import { Coins, Zap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  provider: string;
  model: string;
  using_own_key: boolean;
}

interface TokenUsageDisplayProps {
  usage: TokenUsage;
  compact?: boolean;
}

export const TokenUsageDisplay = ({ usage, compact = false }: TokenUsageDisplayProps) => {
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.0001) return "<$0.0001";
    return `$${cost.toFixed(4)}`;
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
            >
              <Coins className="h-3 w-3" />
              <span>{formatTokens(usage.total_tokens)}</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="font-mono">{formatCost(usage.cost_usd)}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <div className="space-y-1">
              <div>Input: {usage.input_tokens.toLocaleString()} tokens</div>
              <div>Output: {usage.output_tokens.toLocaleString()} tokens</div>
              <div>Model: {usage.model}</div>
              <div>
                Provider: {usage.provider}
                {usage.using_own_key && " (your key)"}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5"
    >
      <Coins className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          {formatTokens(usage.total_tokens)} tokens
        </span>
        <span className="text-muted-foreground/50">|</span>
        <span className="font-mono font-medium">{formatCost(usage.cost_usd)}</span>
        <Badge
          variant={usage.using_own_key ? "secondary" : "outline"}
          className="ml-1 text-[10px] px-1.5 py-0"
        >
          {usage.using_own_key ? "Your Key" : usage.provider}
        </Badge>
      </div>
    </motion.div>
  );
};

interface SessionTotalProps {
  totalTokens: number;
  totalCost: number;
  requestCount: number;
}

export const SessionUsageTotal = ({ totalTokens, totalCost, requestCount }: SessionTotalProps) => {
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-muted/30 to-muted/50 px-4 py-2"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        <span>Session Total</span>
        <Badge variant="secondary" className="text-[10px]">
          {requestCount} requests
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="font-medium">{formatTokens(totalTokens)} tokens</span>
        <span className="font-mono font-bold text-primary">${totalCost.toFixed(4)}</span>
      </div>
    </motion.div>
  );
};
