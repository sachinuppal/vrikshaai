import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
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
}

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface Action {
  type: string;
  [key: string]: any;
}

interface TriggerBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: Trigger | null;
}

const TRIGGER_EVENTS = [
  { value: "new_interaction", label: "New Interaction" },
  { value: "score_change", label: "Score Change" },
  { value: "lifecycle_change", label: "Lifecycle Change" },
  { value: "manual", label: "Manual Trigger" },
];

const CONDITION_FIELDS = [
  { value: "intent_score", label: "Intent Score" },
  { value: "engagement_score", label: "Engagement Score" },
  { value: "urgency_score", label: "Urgency Score" },
  { value: "churn_risk", label: "Churn Risk" },
  { value: "lifecycle_stage", label: "Lifecycle Stage" },
  { value: "last_channel", label: "Last Channel" },
  { value: "total_interactions", label: "Total Interactions" },
  { value: "primary_industry", label: "Primary Industry" },
];

const OPERATORS = [
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "gte", label: "Greater than or equal" },
  { value: "lte", label: "Less than or equal" },
  { value: "eq", label: "Equals" },
  { value: "neq", label: "Not equals" },
  { value: "contains", label: "Contains" },
];

const ACTION_TYPES = [
  { value: "create_task", label: "Create Task" },
  { value: "update_lifecycle", label: "Update Lifecycle Stage" },
  { value: "tag_contact", label: "Tag Contact" },
  { value: "update_score", label: "Update Score" },
];

export function TriggerBuilderModal({ isOpen, onClose, trigger }: TriggerBuilderModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("new_interaction");
  const [priority, setPriority] = useState(50);
  const [cooldownMinutes, setCooldownMinutes] = useState(60);
  const [maxExecutions, setMaxExecutions] = useState<number | null>(null);

  const [conditions, setConditions] = useState<Condition[]>([
    { field: "intent_score", operator: "gt", value: "70" },
  ]);

  const [actions, setActions] = useState<Action[]>([
    { type: "create_task", title: "", priority: "medium" },
  ]);

  useEffect(() => {
    if (trigger) {
      setName(trigger.name);
      setDescription(trigger.description || "");
      setTriggerEvent(trigger.trigger_event);
      setPriority(trigger.priority);
      setCooldownMinutes(trigger.cooldown_minutes);
      setMaxExecutions(trigger.max_executions_per_contact);

      // Parse conditions
      if (trigger.conditions?.all) {
        setConditions(trigger.conditions.all);
      } else if (trigger.conditions?.field) {
        setConditions([trigger.conditions]);
      } else {
        setConditions([{ field: "intent_score", operator: "gt", value: "70" }]);
      }

      // Parse actions
      if (Array.isArray(trigger.actions)) {
        setActions(trigger.actions);
      } else if (trigger.actions?.type) {
        setActions([trigger.actions]);
      } else {
        setActions([{ type: "create_task", title: "", priority: "medium" }]);
      }
    } else {
      resetForm();
    }
  }, [trigger]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTriggerEvent("new_interaction");
    setPriority(50);
    setCooldownMinutes(60);
    setMaxExecutions(null);
    setConditions([{ field: "intent_score", operator: "gt", value: "70" }]);
    setActions([{ type: "create_task", title: "", priority: "medium" }]);
  };

  const addCondition = () => {
    setConditions([...conditions, { field: "intent_score", operator: "gt", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    setConditions(
      conditions.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addAction = () => {
    setActions([...actions, { type: "create_task", title: "", priority: "medium" }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<Action>) => {
    setActions(actions.map((a, i) => (i === index ? { ...a, ...updates } : a)));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const conditionsData = conditions.length > 1 
        ? { all: conditions.map(c => ({ ...c })) } 
        : { ...conditions[0] };
      
      const actionsData = actions.length > 1 
        ? actions.map(a => ({ ...a }))
        : { ...actions[0] };

      const triggerData = {
        name: name.trim(),
        description: description.trim() || null,
        trigger_event: triggerEvent,
        conditions: conditionsData as any,
        actions: actionsData as any,
        priority,
        cooldown_minutes: cooldownMinutes,
        max_executions_per_contact: maxExecutions,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (trigger) {
        const { error } = await supabase
          .from("crm_triggers")
          .update(triggerData)
          .eq("id", trigger.id);

        if (error) throw error;
        toast({ title: "Success", description: "Trigger updated successfully" });
      } else {
        const { error } = await supabase.from("crm_triggers").insert(triggerData);

        if (error) throw error;
        toast({ title: "Success", description: "Trigger created successfully" });
      }

      onClose();
    } catch (error) {
      console.error("Error saving trigger:", error);
      toast({
        title: "Error",
        description: "Failed to save trigger",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {trigger ? "Edit Trigger" : "Create New Trigger"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Trigger Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., High Intent Follow-up"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this trigger does..."
                rows={2}
              />
            </div>

            <div>
              <Label>Trigger Event</Label>
              <Select value={triggerEvent} onValueChange={setTriggerEvent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map((event) => (
                    <SelectItem key={event.value} value={event.value}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conditions (All must match)</Label>
              <Button variant="ghost" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <AnimatePresence>
              {conditions.map((condition, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 items-center"
                >
                  <Select
                    value={condition.field}
                    onValueChange={(v) => updateCondition(index, "field", v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_FIELDS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(v) => updateCondition(index, "operator", v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(index, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1"
                  />

                  {conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Actions</Label>
              <Button variant="ghost" size="sm" onClick={addAction}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <AnimatePresence>
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg border bg-muted/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Select
                      value={action.type}
                      onValueChange={(v) => updateAction(index, { type: v })}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((at) => (
                          <SelectItem key={at.value} value={at.value}>
                            {at.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {actions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {/* Action-specific fields */}
                  {action.type === "create_task" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Task title"
                        value={action.title || ""}
                        onChange={(e) => updateAction(index, { title: e.target.value })}
                      />
                      <Select
                        value={action.priority || "medium"}
                        onValueChange={(v) => updateAction(index, { priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {action.type === "update_lifecycle" && (
                    <Select
                      value={action.lifecycle_stage || "qualified"}
                      onValueChange={(v) => updateAction(index, { lifecycle_stage: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="opportunity">Opportunity</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {action.type === "tag_contact" && (
                    <Input
                      placeholder="Tag name (e.g., hot-lead)"
                      value={action.tag || ""}
                      onChange={(e) => updateAction(index, { tag: e.target.value })}
                    />
                  )}

                  {action.type === "update_score" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={action.score_type || "intent"}
                        onValueChange={(v) => updateAction(index, { score_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="intent">Intent Score</SelectItem>
                          <SelectItem value="engagement">Engagement Score</SelectItem>
                          <SelectItem value="urgency">Urgency Score</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Score value"
                        value={action.score_value || ""}
                        onChange={(e) =>
                          updateAction(index, { score_value: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground">Advanced Settings</h4>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Priority</Label>
                <span className="text-sm text-muted-foreground">{priority}</span>
              </div>
              <Slider
                value={[priority]}
                onValueChange={([v]) => setPriority(v)}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cooldown">Cooldown (minutes)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="max-exec">Max Executions per Contact</Label>
                <Input
                  id="max-exec"
                  type="number"
                  value={maxExecutions || ""}
                  onChange={(e) =>
                    setMaxExecutions(e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : trigger ? "Update Trigger" : "Create Trigger"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
