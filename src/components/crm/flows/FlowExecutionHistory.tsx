import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader2, Play, ChevronDown, ChevronUp, Zap, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FlowExecution {
  id: string;
  contact_flow_id: string;
  contact_id: string;
  flow_id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  nodes_executed: any[];
  error_message: string | null;
  triggered_by: string;
  flow?: {
    name: string;
  };
}

interface FlowExecutionHistoryProps {
  contactId: string;
  flows: { id: string; name: string }[];
}

export function FlowExecutionHistory({ contactId, flows }: FlowExecutionHistoryProps) {
  const [executions, setExecutions] = useState<FlowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterFlowId, setFilterFlowId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchExecutions();
  }, [contactId]);

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_flow_executions')
        .select(`
          *,
          flow:crm_agentic_flows(name)
        `)
        .eq('contact_id', contactId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setExecutions((data || []).map((e: any) => ({
        ...e,
        nodes_executed: Array.isArray(e.nodes_executed) ? e.nodes_executed : []
      })));
    } catch (error) {
      console.error('Error fetching executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExecutions = executions.filter(exec => {
    if (filterFlowId !== 'all' && exec.flow_id !== filterFlowId) return false;
    if (filterStatus !== 'all' && exec.status !== filterStatus) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Running</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTriggerBadge = (triggeredBy: string) => {
    switch (triggeredBy) {
      case 'manual':
        return <Badge variant="outline"><Play className="h-3 w-3 mr-1" /> Manual</Badge>;
      case 'trigger':
        return <Badge variant="outline"><Zap className="h-3 w-3 mr-1" /> Trigger</Badge>;
      case 'schedule':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      default:
        return <Badge variant="outline">{triggeredBy}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="border-none shadow-card">
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Execution History</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={filterFlowId} onValueChange={setFilterFlowId}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Flows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flows</SelectItem>
              {flows.map(flow => (
                <SelectItem key={flow.id} value={flow.id}>{flow.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredExecutions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Executions Yet</h3>
            <p className="text-muted-foreground">
              Flow execution history will appear here after flows are run.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExecutions.map((exec, index) => (
              <motion.div
                key={exec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    expandedId === exec.id ? 'bg-muted/50' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(exec.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{exec.flow?.name || 'Unknown Flow'}</span>
                        {getStatusBadge(exec.status)}
                        {getTriggerBadge(exec.triggered_by)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(new Date(exec.started_at), 'MMM d, yyyy')} at {format(new Date(exec.started_at), 'h:mm a')}
                        {' • '}
                        {formatDistanceToNow(new Date(exec.started_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {exec.nodes_executed.length} node(s)
                    </span>
                    {expandedId === exec.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === exec.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t bg-muted/20"
                    >
                      <div className="p-4 space-y-3">
                        {exec.error_message && (
                          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            <strong>Error:</strong> {exec.error_message}
                          </div>
                        )}
                        
                        {exec.nodes_executed.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Nodes Executed:</h4>
                            <div className="space-y-2">
                              {exec.nodes_executed.map((node: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    node.status === 'completed' 
                                      ? 'bg-emerald-500/10' 
                                      : 'bg-destructive/10'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {node.status === 'completed' ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-destructive" />
                                    )}
                                    <div>
                                      <span className="font-medium">{node.label}</span>
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {node.node_type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {node.executed_at && format(new Date(node.executed_at), 'h:mm:ss a')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No node execution details available.</p>
                        )}

                        {exec.completed_at && (
                          <div className="text-sm text-muted-foreground pt-2 border-t">
                            Completed: {format(new Date(exec.completed_at), 'MMM d, yyyy h:mm:ss a')}
                            {' • Duration: '}
                            {Math.round((new Date(exec.completed_at).getTime() - new Date(exec.started_at).getTime()) / 1000)}s
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
