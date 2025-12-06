import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Play,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface VoiceCall {
  id: string;
  name: string;
  full_phone: string;
  created_at: string;
  call_status: string | null;
  call_duration: number | null;
  platform_analysis: unknown;
  client_analysis: unknown;
  observability_analysis: unknown;
}

interface VoiceCallsCardProps {
  calls: VoiceCall[];
  loading?: boolean;
}

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const getMaxDuration = (calls: VoiceCall[]) => {
  return Math.max(...calls.map((c) => c.call_duration || 0), 60);
};

const hasAnalysis = (call: VoiceCall) => {
  return call.platform_analysis || call.client_analysis || call.observability_analysis;
};

const getStatusConfig = (status: string | null) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return {
        icon: CheckCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        label: "Completed",
      };
    case "failed":
    case "error":
      return {
        icon: XCircle,
        color: "text-red-500",
        bg: "bg-red-500/10",
        label: "Failed",
      };
    case "in_progress":
    case "ringing":
      return {
        icon: Loader2,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        label: "In Progress",
        animate: true,
      };
    default:
      return {
        icon: Clock,
        color: "text-muted-foreground",
        bg: "bg-muted",
        label: status || "Pending",
      };
  }
};

export function VoiceCallsCard({ calls, loading }: VoiceCallsCardProps) {
  const maxDuration = getMaxDuration(calls);
  const displayCalls = calls.slice(0, 5);

  return (
    <Card className="border-none shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Voice Calls
          </CardTitle>
          {calls.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {calls.length} calls
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Phone className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No voice calls recorded</p>
            <p className="text-xs">Calls will appear as they happen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayCalls.map((call, index) => {
              const statusConfig = getStatusConfig(call.call_status);
              const StatusIcon = statusConfig.icon;
              const durationPercent = call.call_duration
                ? (call.call_duration / maxDuration) * 100
                : 0;

              return (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link
                    to={`/call-analysis/${call.id}`}
                    className="block p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Status Icon */}
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", statusConfig.bg)}>
                        <StatusIcon 
                          className={cn("h-4 w-4", statusConfig.color, statusConfig.animate && "animate-spin")} 
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">
                            {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {hasAnalysis(call) && (
                              <Badge className="text-[10px] h-5 bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                                <BarChart3 className="h-2.5 w-2.5 mr-0.5" />
                                Analyzed
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Duration Bar */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${durationPercent}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="h-full bg-primary/60 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {formatDuration(call.call_duration)}
                          </span>
                        </div>
                      </div>

                      {/* View Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {calls.length > 5 && (
              <Link to="/crm/calls" className="block">
                <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                  View All {calls.length} Calls
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
