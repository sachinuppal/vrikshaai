import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Radio,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { TriggerBuilderModal } from "@/components/crm/TriggerBuilderModal";
import { useCRMRealtime } from "@/hooks/useCRMRealtime";
import { useToast } from "@/hooks/use-toast";

interface Trigger {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  conditions: any;
  actions: any;
  is_active: boolean;
  priority: number;
  cooldown_minutes: number;
  max_executions_per_contact: number | null;
  created_at: string;
}

interface TriggerExecution {
  id: string;
  trigger_id: string;
  contact_id: string;
  execution_status: string;
  executed_at: string;
}

export default function CRMTriggers() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<TriggerExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const { toast } = useToast();

  // Note: Triggers table not yet in realtime hook, will refresh manually
  // useCRMRealtime would need to be extended to support these tables

  useEffect(() => {
    fetchTriggers();
    fetchRecentExecutions();
  }, []);

  const fetchTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_triggers")
        .select("*")
        .order("priority", { ascending: false });

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error("Error fetching triggers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentExecutions = async () => {
    try {
      const { data } = await supabase
        .from("crm_trigger_executions")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(10);

      setRecentExecutions(data || []);
    } catch (error) {
      console.error("Error fetching executions:", error);
    }
  };

  const toggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("crm_triggers")
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
        .eq("id", triggerId);

      if (error) throw error;

      setTriggers((prev) =>
        prev.map((t) => (t.id === triggerId ? { ...t, is_active: !isActive } : t))
      );

      toast({
        title: isActive ? "Trigger Disabled" : "Trigger Enabled",
        description: `The trigger has been ${isActive ? "disabled" : "enabled"}.`,
      });
    } catch (error) {
      console.error("Error toggling trigger:", error);
      toast({
        title: "Error",
        description: "Failed to update trigger status.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (trigger: Trigger) => {
    setEditingTrigger(trigger);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTrigger(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTrigger(null);
    fetchTriggers();
  };

  const eventLabels: Record<string, string> = {
    new_interaction: "New Interaction",
    score_change: "Score Change",
    lifecycle_change: "Lifecycle Change",
    manual: "Manual Trigger",
  };

  const getConditionsSummary = (conditions: any): string => {
    if (!conditions) return "No conditions";
    if (conditions.all) return `${conditions.all.length} conditions (AND)`;
    if (conditions.any) return `${conditions.any.length} conditions (OR)`;
    if (conditions.field) return `${conditions.field} ${conditions.operator} ${conditions.value}`;
    return "Custom conditions";
  };

  const getActionsSummary = (actions: any): string => {
    const actionsList = Array.isArray(actions) ? actions : [actions];
    const types = actionsList.map((a) => a.type).join(", ");
    return types || "No actions";
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              Trigger Rules Engine
              <Badge variant="outline" className="text-xs font-normal flex items-center gap-1">
                <Radio className="h-3 w-3 text-green-500 animate-pulse" />
                Live
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Automate actions based on contact behavior and events
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Trigger
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Triggers</p>
                  <p className="text-2xl font-bold">{triggers.length}</p>
                </div>
                <Zap className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {triggers.filter((t) => t.is_active).length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paused</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {triggers.filter((t) => !t.is_active).length}
                  </p>
                </div>
                <Pause className="h-8 w-8 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recent Executions</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {recentExecutions.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Triggers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-card">
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : triggers.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Triggers Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first automation rule to get started
                  </p>
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Trigger
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {triggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className={`p-4 rounded-lg border transition-all ${
                        trigger.is_active
                          ? "bg-card hover:shadow-md"
                          : "bg-muted/30 opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{trigger.name}</h4>
                            <Badge variant={trigger.is_active ? "default" : "secondary"}>
                              {trigger.is_active ? "Active" : "Paused"}
                            </Badge>
                            <Badge variant="outline">
                              Priority: {trigger.priority}
                            </Badge>
                          </div>
                          {trigger.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {trigger.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="secondary" className="font-normal">
                              <Zap className="h-3 w-3 mr-1" />
                              {eventLabels[trigger.trigger_event] || trigger.trigger_event}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {getConditionsSummary(trigger.conditions)}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {getActionsSummary(trigger.actions)}
                            </Badge>
                            {trigger.cooldown_minutes > 0 && (
                              <Badge variant="outline" className="font-normal">
                                <Clock className="h-3 w-3 mr-1" />
                                {trigger.cooldown_minutes}min cooldown
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(trigger)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={trigger.is_active}
                            onCheckedChange={() => toggleTrigger(trigger.id, trigger.is_active)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Executions */}
        {recentExecutions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentExecutions.map((exec) => (
                    <div
                      key={exec.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={exec.execution_status === "success" ? "default" : "destructive"}
                        >
                          {exec.execution_status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Contact: {exec.contact_id.slice(0, 8)}...
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(exec.executed_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <TriggerBuilderModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        trigger={editingTrigger}
      />
    </CRMLayout>
  );
}
