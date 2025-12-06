import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Phone, 
  RefreshCw, 
  Plus, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { maskPhoneNumber } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InitiateCallModal from "@/components/InitiateCallModal";

interface CallRecord {
  id: string;
  name: string;
  phone: string;
  country_code: string;
  created_at: string;
  call_status: string | null;
  call_duration: number | null;
  source: string | null;
  ringg_call_id: string | null;
  platform_analysis: unknown;
}

const CallHistory = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingCallId, setSyncingCallId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const { toast } = useToast();

  const fetchCalls = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase
        .from("voice_widget_calls")
        .select("id, name, phone, country_code, created_at, call_status, call_duration, source, ringg_call_id, platform_analysis")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error("Error fetching calls:", error);
      toast({
        title: "Error",
        description: "Failed to fetch call history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalls();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("call-history-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "voice_widget_calls",
        },
        () => {
          fetchCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "in_progress":
      case "ringing":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            In Progress
          </Badge>
        );
      case "initiated":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Initiated
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border">
            <Clock className="w-3 h-3 mr-1" />
            {status || "Registered"}
          </Badge>
        );
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const syncCallData = async (callId: string) => {
    setSyncingCallId(callId);
    try {
      const { data, error } = await supabase.functions.invoke("sync-call-data", {
        body: { db_call_id: callId },
      });

      if (error) throw error;

      toast({
        title: "Synced",
        description: "Call data synced successfully",
      });
      fetchCalls(true);
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync call data",
        variant: "destructive",
      });
    } finally {
      setSyncingCallId(null);
    }
  };

  const syncAllIncomplete = async () => {
    setSyncingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-call-data", {
        body: { sync_all_incomplete: true },
      });

      if (error) throw error;

      toast({
        title: "Sync complete",
        description: `Synced ${data?.synced_count || 0} calls successfully`,
      });
      fetchCalls(true);
    } catch (error) {
      console.error("Sync all error:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync incomplete calls",
        variant: "destructive",
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const needsSync = (call: CallRecord) => {
    return call.ringg_call_id && !call.platform_analysis;
  };

  const incompleteCallsCount = calls.filter(needsSync).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Phone className="h-8 w-8 text-primary" />
                  Call History
                </h1>
                <p className="text-muted-foreground mt-1">
                  View and manage all AI voice calls
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {incompleteCallsCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncAllIncomplete}
                  disabled={syncingAll}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncingAll ? "animate-spin" : ""}`} />
                  Sync All ({incompleteCallsCount})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCalls(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Call
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-foreground">{calls.length}</div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-emerald-400">
                  {calls.filter(c => c.call_status?.toLowerCase() === "completed").length}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-400">
                  {calls.filter(c => ["in_progress", "ringing", "initiated"].includes(c.call_status?.toLowerCase() || "")).length}
                </div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-400">
                  {calls.filter(c => ["failed", "error"].includes(c.call_status?.toLowerCase() || "")).length}
                </div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : calls.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No calls yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by initiating your first AI call
                    </p>
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Call
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calls.map((call) => (
                        <TableRow key={call.id}>
                          <TableCell className="font-medium">
                            {formatDate(call.created_at)}
                          </TableCell>
                          <TableCell>{call.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {maskPhoneNumber(`${call.country_code}${call.phone}`)}
                          </TableCell>
                          <TableCell>{getStatusBadge(call.call_status)}</TableCell>
                          <TableCell>{formatDuration(call.call_duration)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {call.source || "widget"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {needsSync(call) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => syncCallData(call.id)}
                                  disabled={syncingCallId === call.id}
                                >
                                  <RefreshCw className={`h-4 w-4 ${syncingCallId === call.id ? "animate-spin" : ""}`} />
                                </Button>
                              )}
                              <Link to={`/call-analysis/${call.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />

      <InitiateCallModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => fetchCalls(true)}
      />
    </div>
  );
};

export default CallHistory;
