import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Radio,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { useCRMRealtime } from "@/hooks/useCRMRealtime";

interface Task {
  id: string;
  contact_id: string;
  title: string;
  description: string | null;
  task_type: string | null;
  suggested_channel: string | null;
  suggested_content: string | null;
  priority: string;
  due_at: string | null;
  status: string;
  ai_generated: boolean;
  ai_reason: string | null;
  created_at: string;
  crm_contacts?: {
    full_name: string | null;
    company_name: string | null;
  };
}

export default function CRMTasks() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Real-time updates
  useCRMRealtime({
    tables: ['crm_tasks'],
    showToasts: true,
  });

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("crm_tasks")
        .select("*, crm_contacts(full_name, company_name)")
        .order("due_at", { ascending: true, nullsFirst: false });

      if (activeTab === "pending") {
        query = query.in("status", ["pending", "in_progress"]);
      } else if (activeTab === "completed") {
        query = query.eq("status", "completed");
      } else if (activeTab === "overdue") {
        query = query
          .in("status", ["pending", "in_progress"])
          .lt("due_at", new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("crm_tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Task Updated",
        description: `Task marked as ${status}`,
      });

      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const channelIcons: Record<string, any> = {
    phone: Phone,
    email: Mail,
    whatsapp: MessageSquare,
    meeting: Calendar,
    sms: MessageSquare,
  };

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-100 text-red-800 border-red-200",
    high: "bg-amber-100 text-amber-800 border-amber-200",
    medium: "bg-blue-100 text-blue-800 border-blue-200",
    low: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const isOverdue = (dueAt: string | null) => {
    if (!dueAt) return false;
    return new Date(dueAt) < new Date();
  };

  const getDueLabel = (dueAt: string | null) => {
    if (!dueAt) return null;
    const due = new Date(dueAt);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  const pendingCount = tasks.filter((t) => ["pending", "in_progress"].includes(t.status)).length;
  const overdueCount = tasks.filter(
    (t) => ["pending", "in_progress"].includes(t.status) && isOverdue(t.due_at)
  ).length;

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Tasks
            <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
              <Radio className="h-3 w-3 text-green-500 animate-pulse" />
              Live
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            AI-generated and manual follow-up tasks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-none shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <CheckSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Generated</p>
                  <p className="text-2xl font-bold">
                    {tasks.filter((t) => t.ai_generated).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue
              {overdueCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {overdueCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <Card className="border-none shadow-card">
                <CardContent className="py-12 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "pending"
                      ? "All caught up! No pending tasks."
                      : activeTab === "overdue"
                      ? "No overdue tasks. Great job!"
                      : "No tasks in this category."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task, index) => {
                  const ChannelIcon = channelIcons[task.suggested_channel || "phone"] || Phone;
                  const overdue = isOverdue(task.due_at) && task.status !== "completed";

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`border-none shadow-card hover:shadow-hover transition-all ${
                          overdue ? "ring-2 ring-red-200" : ""
                        }`}
                      >
                        <CardContent className="pt-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={priorityColors[task.priority]}>
                                {task.priority}
                              </Badge>
                              {task.ai_generated && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            {task.suggested_channel && (
                              <div className="p-2 rounded-full bg-primary/10">
                                <ChannelIcon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold mb-2">{task.title}</h3>

                          {/* Contact */}
                          <div
                            className="flex items-center gap-2 text-sm text-muted-foreground mb-3 cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => navigate(`/crm/contacts/${task.contact_id}`)}
                          >
                            <User className="h-4 w-4" />
                            <span>
                              {task.crm_contacts?.full_name || "Unknown"}{" "}
                              {task.crm_contacts?.company_name &&
                                `• ${task.crm_contacts.company_name}`}
                            </span>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Due date */}
                          {task.due_at && (
                            <div
                              className={`flex items-center gap-1 text-sm mb-4 ${
                                overdue ? "text-red-600" : "text-muted-foreground"
                              }`}
                            >
                              <Clock className="h-4 w-4" />
                              <span>{getDueLabel(task.due_at)}</span>
                            </div>
                          )}

                          {/* AI Reason */}
                          {task.ai_reason && (
                            <div className="p-2 rounded bg-amber-50 text-xs text-amber-800 mb-4">
                              <Zap className="h-3 w-3 inline mr-1" />
                              {task.ai_reason}
                            </div>
                          )}

                          {/* Actions */}
                          {task.status !== "completed" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => updateTaskStatus(task.id, "completed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateTaskStatus(task.id, "cancelled")}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {task.status === "completed" && (
                            <Badge variant="secondary" className="w-full justify-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
