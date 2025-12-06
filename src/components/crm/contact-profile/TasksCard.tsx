import { motion } from "framer-motion";
import {
  CheckSquare,
  Clock,
  Zap,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  due_at?: string;
  ai_generated?: boolean;
  ai_reason?: string;
  task_type?: string;
}

interface TasksCardProps {
  tasks: Task[];
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
  urgent: { color: "text-red-600", bg: "bg-red-500/10 border-red-500/30" },
  high: { color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30" },
  medium: { color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30" },
  low: { color: "text-muted-foreground", bg: "bg-muted border-border" },
};

export function TasksCard({ tasks }: TasksCardProps) {
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const displayTasks = pendingTasks.slice(0, 5);

  const getDueStatus = (dueAt?: string) => {
    if (!dueAt) return null;
    const dueDate = new Date(dueAt);
    if (isPast(dueDate) && !isToday(dueDate)) return "overdue";
    if (isToday(dueDate)) return "today";
    return "upcoming";
  };

  return (
    <Card className="border-none shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            Pending Tasks
          </CardTitle>
          {pendingTasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingTasks.length} pending
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {pendingTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No pending tasks</p>
            <p className="text-xs">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTasks.map((task, index) => {
              const priority = priorityConfig[task.priority || "medium"] || priorityConfig.medium;
              const dueStatus = getDueStatus(task.due_at);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer",
                    priority.bg
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority Indicator */}
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                      task.priority === "urgent" && "bg-red-500",
                      task.priority === "high" && "bg-amber-500",
                      task.priority === "medium" && "bg-blue-500",
                      !task.priority || task.priority === "low" && "bg-muted-foreground"
                    )} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-foreground line-clamp-1">
                          {task.title}
                        </span>
                        {task.ai_generated && (
                          <Badge variant="outline" className="text-[10px] h-5 flex-shrink-0">
                            <Zap className="h-2.5 w-2.5 mr-0.5" />
                            AI
                          </Badge>
                        )}
                      </div>

                      {task.due_at && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {dueStatus === "overdue" && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          <Clock className={cn(
                            "h-3 w-3",
                            dueStatus === "overdue" && "text-red-500",
                            dueStatus === "today" && "text-amber-500",
                            dueStatus === "upcoming" && "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "text-xs",
                            dueStatus === "overdue" && "text-red-500 font-medium",
                            dueStatus === "today" && "text-amber-600 font-medium",
                            dueStatus === "upcoming" && "text-muted-foreground"
                          )}>
                            {dueStatus === "overdue" && "Overdue: "}
                            {dueStatus === "today" && "Due today "}
                            {formatDistanceToNow(new Date(task.due_at), { addSuffix: true })}
                          </span>
                        </div>
                      )}

                      {task.ai_reason && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                          "{task.ai_reason}"
                        </p>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}

            {pendingTasks.length > 5 && (
              <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                View All {pendingTasks.length} Tasks
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
