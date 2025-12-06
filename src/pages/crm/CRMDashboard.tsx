import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Phone, 
  CheckSquare, 
  ArrowUpRight,
  Zap,
  Target,
  Clock,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CRMLayout } from "@/components/crm/CRMLayout";

interface DashboardStats {
  totalContacts: number;
  byLifecycle: Record<string, number>;
  byUserType: Record<string, number>;
  recentInteractions: any[];
  pendingTasks: any[];
  hotLeads: any[];
}

export default function CRMDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch contacts with aggregations
      const { data: contacts } = await supabase
        .from("crm_contacts")
        .select("id, lifecycle_stage, user_type, intent_score, full_name, company_name, last_interaction_at")
        .order("last_interaction_at", { ascending: false });

      // Fetch recent interactions
      const { data: interactions } = await supabase
        .from("crm_interactions")
        .select("*, crm_contacts(full_name, company_name)")
        .order("occurred_at", { ascending: false })
        .limit(5);

      // Fetch pending tasks
      const { data: tasks } = await supabase
        .from("crm_tasks")
        .select("*, crm_contacts(full_name, company_name)")
        .eq("status", "pending")
        .order("due_at", { ascending: true })
        .limit(5);

      // Calculate stats
      const byLifecycle: Record<string, number> = {};
      const byUserType: Record<string, number> = {};
      const hotLeads: any[] = [];

      for (const contact of contacts || []) {
        const stage = contact.lifecycle_stage || "unknown";
        const type = contact.user_type || "general";
        byLifecycle[stage] = (byLifecycle[stage] || 0) + 1;
        byUserType[type] = (byUserType[type] || 0) + 1;

        if (contact.intent_score >= 70) {
          hotLeads.push(contact);
        }
      }

      setStats({
        totalContacts: contacts?.length || 0,
        byLifecycle,
        byUserType,
        recentInteractions: interactions || [],
        pendingTasks: tasks || [],
        hotLeads: hotLeads.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const lifecycleColors: Record<string, string> = {
    lead: "bg-blue-100 text-blue-800",
    qualified: "bg-amber-100 text-amber-800",
    opportunity: "bg-purple-100 text-purple-800",
    customer: "bg-green-100 text-green-800",
    churned: "bg-red-100 text-red-800",
  };

  const channelIcons: Record<string, any> = {
    voice_ai: Phone,
    voice_human: Phone,
    email: TrendingUp,
    whatsapp: Zap,
    web: Target,
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CRM Dashboard</h1>
            <p className="text-muted-foreground">
              Agentic CRM with AI-powered insights
            </p>
          </div>
          <Button onClick={() => navigate("/crm/contacts")}>
            View All Contacts
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-card hover:shadow-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Contacts
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-3xl font-bold">{stats?.totalContacts || 0}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-card hover:shadow-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hot Leads
                </CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-3xl font-bold text-amber-600">
                    {stats?.hotLeads.length || 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Intent score ≥70</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-card hover:shadow-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Tasks
                </CardTitle>
                <CheckSquare className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-3xl font-bold text-purple-600">
                    {stats?.pendingTasks.length || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-card hover:shadow-hover transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Qualified Leads
                </CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.byLifecycle.qualified || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pipeline Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-none shadow-card">
            <CardHeader>
              <CardTitle>Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-24 flex-1" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {["lead", "qualified", "opportunity", "customer", "churned"].map(
                    (stage) => (
                      <div
                        key={stage}
                        className="flex-1 min-w-[120px] p-4 rounded-lg bg-muted/50 text-center"
                      >
                        <Badge className={lifecycleColors[stage]} variant="secondary">
                          {stage.charAt(0).toUpperCase() + stage.slice(1)}
                        </Badge>
                        <div className="text-2xl font-bold mt-2">
                          {stats?.byLifecycle[stage] || 0}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hot Leads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-none shadow-card h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Hot Leads
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/crm/contacts?min_intent=70")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : stats?.hotLeads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hot leads yet. Sync your data to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats?.hotLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 cursor-pointer transition-colors"
                        onClick={() => navigate(`/crm/contacts/${lead.id}`)}
                      >
                        <div>
                          <p className="font-medium">{lead.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.company_name || "No company"}
                          </p>
                        </div>
                        <Badge className="bg-amber-500 text-white">
                          {lead.intent_score}% Intent
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Interactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-none shadow-card h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recent Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : stats?.recentInteractions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No interactions yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats?.recentInteractions.map((interaction) => {
                      const Icon = channelIcons[interaction.channel] || Phone;
                      return (
                        <div
                          key={interaction.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() =>
                            navigate(`/crm/contacts/${interaction.contact_id}`)
                          }
                        >
                          <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {interaction.crm_contacts?.full_name || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {interaction.summary || interaction.channel}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {interaction.channel}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2"
          >
            <Card className="border-none shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-purple-500" />
                  Pending Tasks
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/crm/tasks")}>
                  View All Tasks
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : stats?.pendingTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending tasks. AI will generate tasks based on contact activity.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats?.pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md cursor-pointer transition-all"
                        onClick={() => navigate(`/crm/contacts/${task.contact_id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge
                            variant={
                              task.priority === "urgent"
                                ? "destructive"
                                : task.priority === "high"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                          {task.ai_generated && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium mb-1">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.crm_contacts?.full_name || "Unknown contact"}
                        </p>
                        {task.due_at && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(task.due_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </CRMLayout>
  );
}
