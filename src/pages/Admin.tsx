import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LogOut,
  Shield,
  Users,
  BarChart3,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";
import InitiateCallModal from "@/components/InitiateCallModal";

interface CallRecord {
  id: string;
  name: string;
  phone: string;
  full_phone: string;
  country_code: string;
  created_at: string;
  updated_at: string | null;
  call_status: string | null;
  call_duration: number | null;
  source: string | null;
  ringg_call_id: string | null;
  platform_analysis: unknown;
  client_analysis: unknown;
  observability_analysis: unknown;
  observability_status: string | null;
  transcript: unknown;
  recording_url: string | null;
  user_id: string | null;
  page_url: string | null;
}

const Admin = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingCallId, setSyncingCallId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const fetchCalls = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Admin can see all calls due to RLS policy
      const { data, error } = await supabase
        .from("voice_widget_calls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCalls((data as CallRecord[]) || []);
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
      .channel("admin-call-changes")
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
            {status || "Pending"}
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
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
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

  const handleLogout = async () => {
    await signOut();
    navigate("/admin-login");
  };

  const needsSync = (call: CallRecord) => {
    return call.ringg_call_id && !call.platform_analysis;
  };

  const incompleteCallsCount = calls.filter(needsSync).length;

  const hasAnalysis = (call: CallRecord) => {
    return call.platform_analysis || call.client_analysis || call.observability_analysis;
  };

  // Stats calculations
  const stats = {
    total: calls.length,
    completed: calls.filter(c => c.call_status?.toLowerCase() === "completed").length,
    inProgress: calls.filter(c => ["in_progress", "ringing", "initiated"].includes(c.call_status?.toLowerCase() || "")).length,
    failed: calls.filter(c => ["failed", "error"].includes(c.call_status?.toLowerCase() || "")).length,
    withAnalysis: calls.filter(hasAnalysis).length,
    uniqueUsers: new Set(calls.filter(c => c.user_id).map(c => c.user_id)).size,
  };

  const exportToCSV = () => {
    const headers = ["Date", "Name", "Phone", "Status", "Duration", "Source", "Has Analysis"];
    const rows = calls.map(call => [
      formatDate(call.created_at),
      call.name,
      call.full_phone,
      call.call_status || "Pending",
      formatDuration(call.call_duration),
      call.source || "widget",
      hasAnalysis(call) ? "Yes" : "No"
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: `${calls.length} calls exported to CSV`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Page Title & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Phone className="h-7 w-7 text-primary" />
                All Calls
              </h2>
              <p className="text-muted-foreground mt-1">
                View and manage all AI voice calls across the platform
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">Total Calls</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{stats.inProgress}</div>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{stats.withAnalysis}</div>
                    <p className="text-xs text-muted-foreground">Analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{stats.uniqueUsers}</div>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                </div>
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
                <CardTitle>Call Records</CardTitle>
                <CardDescription>
                  Complete call history with full phone numbers and analysis data
                </CardDescription>
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone (Full)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Analysis</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calls.map((call) => (
                          <TableRow key={call.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium whitespace-nowrap">
                              {formatDate(call.created_at)}
                            </TableCell>
                            <TableCell>{call.name}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {call.full_phone}
                            </TableCell>
                            <TableCell>{getStatusBadge(call.call_status)}</TableCell>
                            <TableCell>{formatDuration(call.call_duration)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {call.source || "widget"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {hasAnalysis(call) ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                  Ready
                                </Badge>
                              ) : call.observability_status === "processing" ? (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                  Processing
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Pending
                                </Badge>
                              )}
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
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <InitiateCallModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => fetchCalls(true)}
      />
    </div>
  );
};

export default Admin;
