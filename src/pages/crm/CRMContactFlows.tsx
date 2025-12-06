import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Workflow, Activity, Clock, RefreshCw, Power, PowerOff, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactFlowsList } from '@/components/crm/flows/ContactFlowsList';
import { FlowExecutionHistory } from '@/components/crm/flows/FlowExecutionHistory';
import { AssignFlowModal } from '@/components/crm/flows/AssignFlowModal';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ContactFlow {
  id: string;
  flow_id: string;
  is_enabled: boolean;
  priority: number;
  last_executed_at: string | null;
  execution_count: number;
  created_at: string;
  flow: {
    id: string;
    name: string;
    description: string | null;
    status: string;
  };
}

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
}

export default function CRMContactFlows() {
  const { id: contactId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [contactFlows, setContactFlows] = useState<ContactFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [runningFlowId, setRunningFlowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('flows');

  useEffect(() => {
    if (contactId) {
      fetchData();
    }
  }, [contactId]);

  const fetchData = async () => {
    try {
      const [contactRes, flowsRes] = await Promise.all([
        supabase.from('crm_contacts').select('id, full_name, email, phone, company_name').eq('id', contactId).single(),
        supabase
          .from('crm_contact_flows')
          .select(`
            id,
            flow_id,
            is_enabled,
            priority,
            last_executed_at,
            execution_count,
            created_at,
            flow:crm_agentic_flows(id, name, description, status)
          `)
          .eq('contact_id', contactId)
          .order('priority', { ascending: true })
      ]);

      if (contactRes.error) throw contactRes.error;
      setContact(contactRes.data);
      
      const flows = (flowsRes.data || []).map((cf: any) => ({
        ...cf,
        flow: cf.flow || { id: cf.flow_id, name: 'Unknown Flow', description: null, status: 'draft' }
      }));
      setContactFlows(flows);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching contact flows:', error);
      toast.error('Failed to load contact flows');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlow = async (contactFlowId: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('crm_contact_flows')
        .update({ is_enabled: isEnabled })
        .eq('id', contactFlowId);

      if (error) throw error;

      setContactFlows(prev => prev.map(cf => 
        cf.id === contactFlowId ? { ...cf, is_enabled: isEnabled } : cf
      ));
      toast.success(isEnabled ? 'Flow enabled' : 'Flow disabled');
    } catch (error) {
      console.error('Error toggling flow:', error);
      toast.error('Failed to update flow status');
    }
  };

  const handleRemoveFlow = async (contactFlowId: string) => {
    try {
      const { error } = await supabase
        .from('crm_contact_flows')
        .delete()
        .eq('id', contactFlowId);

      if (error) throw error;

      setContactFlows(prev => prev.filter(cf => cf.id !== contactFlowId));
      setSelectedIds(prev => prev.filter(id => id !== contactFlowId));
      toast.success('Flow removed from contact');
    } catch (error) {
      console.error('Error removing flow:', error);
      toast.error('Failed to remove flow');
    }
  };

  const handleReorderFlows = async (reorderedFlows: ContactFlow[]) => {
    setContactFlows(reorderedFlows);
    
    try {
      // Update priorities in database
      const updates = reorderedFlows.map((cf, idx) => 
        supabase
          .from('crm_contact_flows')
          .update({ priority: idx })
          .eq('id', cf.id)
      );
      
      await Promise.all(updates);
      toast.success('Flow order updated');
    } catch (error) {
      console.error('Error updating flow order:', error);
      toast.error('Failed to save flow order');
      fetchData(); // Revert to server state
    }
  };

  const handleRunFlow = async (contactFlowId: string, flowId: string) => {
    setRunningFlowId(contactFlowId);
    
    try {
      const { data, error } = await supabase.functions.invoke('crm-run-flow-now', {
        body: {
          contact_id: contactId,
          flow_id: flowId,
          contact_flow_id: contactFlowId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Flow executed successfully. ${data.nodes_executed} node(s) processed.`);
        // Refresh the flow data to update execution count
        fetchData();
      } else {
        toast.error(data.error || 'Flow execution failed');
      }
    } catch (error: any) {
      console.error('Error running flow:', error);
      toast.error(error.message || 'Failed to run flow');
    } finally {
      setRunningFlowId(null);
    }
  };

  const handleFlowAssigned = () => {
    fetchData();
    setIsAssignModalOpen(false);
  };

  const handleSyncDefaultFlows = async () => {
    setSyncing(true);
    try {
      const { data: allFlows, error: flowsError } = await supabase
        .from('crm_agentic_flows')
        .select('id')
        .eq('status', 'published');

      if (flowsError) throw flowsError;

      const existingFlowIds = contactFlows.map(cf => cf.flow_id);
      const newFlows = (allFlows || []).filter(f => !existingFlowIds.includes(f.id));

      if (newFlows.length === 0) {
        toast.info('All published flows are already assigned');
        return;
      }

      const { error: insertError } = await supabase
        .from('crm_contact_flows')
        .insert(
          newFlows.map((f, idx) => ({
            contact_id: contactId,
            flow_id: f.id,
            is_enabled: true,
            priority: existingFlowIds.length + idx
          }))
        );

      if (insertError) throw insertError;

      toast.success(`Assigned ${newFlows.length} new flow(s)`);
      fetchData();
    } catch (error) {
      console.error('Error syncing default flows:', error);
      toast.error('Failed to sync flows');
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkEnable = async () => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('crm_contact_flows')
        .update({ is_enabled: true })
        .in('id', selectedIds);

      if (error) throw error;

      setContactFlows(prev => prev.map(cf => 
        selectedIds.includes(cf.id) ? { ...cf, is_enabled: true } : cf
      ));
      toast.success(`Enabled ${selectedIds.length} flow(s)`);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk enabling:', error);
      toast.error('Failed to enable flows');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('crm_contact_flows')
        .update({ is_enabled: false })
        .in('id', selectedIds);

      if (error) throw error;

      setContactFlows(prev => prev.map(cf => 
        selectedIds.includes(cf.id) ? { ...cf, is_enabled: false } : cf
      ));
      toast.success(`Disabled ${selectedIds.length} flow(s)`);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk disabling:', error);
      toast.error('Failed to disable flows');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('crm_contact_flows')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      setContactFlows(prev => prev.filter(cf => !selectedIds.includes(cf.id)));
      toast.success(`Removed ${selectedIds.length} flow(s)`);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk removing:', error);
      toast.error('Failed to remove flows');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const activeFlows = contactFlows.filter(cf => cf.is_enabled);
  const totalExecutions = contactFlows.reduce((sum, cf) => sum + cf.execution_count, 0);
  const flowsForHistory = contactFlows.map(cf => ({ id: cf.flow_id, name: cf.flow.name }));

  if (loading) {
    return (
      <CRMLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </CRMLayout>
    );
  }

  if (!contact) {
    return (
      <CRMLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Contact Not Found</h2>
          <Button onClick={() => navigate('/crm/contacts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(`/crm/contacts/${contactId}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{contact.full_name}</h1>
              <p className="text-muted-foreground">Manage automation flows</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSyncDefaultFlows} disabled={syncing}>
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync Default Flows
            </Button>
            <Button onClick={() => setIsAssignModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Flow
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-none shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Workflow className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{contactFlows.length}</p>
                    <p className="text-sm text-muted-foreground">Total Flows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10">
                    <Activity className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeFlows.length}</p>
                    <p className="text-sm text-muted-foreground">Active Flows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-500/10">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalExecutions}</p>
                    <p className="text-sm text-muted-foreground">Total Executions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs for Flows and Execution History */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="flows">
              <Workflow className="h-4 w-4 mr-2" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              Execution History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flows" className="space-y-4 mt-4">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20"
              >
                <span className="text-sm font-medium">
                  {selectedIds.length} flow(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleBulkEnable}
                    disabled={bulkActionLoading}
                  >
                    <Power className="h-4 w-4 mr-1" />
                    Enable All
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleBulkDisable}
                    disabled={bulkActionLoading}
                  >
                    <PowerOff className="h-4 w-4 mr-1" />
                    Disable All
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" disabled={bulkActionLoading}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Selected Flows</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {selectedIds.length} flow(s) from this contact? 
                          The flows themselves will not be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkRemove}>
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            )}

            {/* Flows List */}
            <ContactFlowsList
              contactFlows={contactFlows}
              onToggle={handleToggleFlow}
              onRemove={handleRemoveFlow}
              onEdit={(flowId) => navigate(`/crm/flow-builder/${flowId}?contactId=${contactId}`)}
              onReorder={handleReorderFlows}
              onRunFlow={handleRunFlow}
              runningFlowId={runningFlowId}
              selectable={true}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <FlowExecutionHistory 
              contactId={contactId!} 
              flows={flowsForHistory}
            />
          </TabsContent>
        </Tabs>

        {/* Assign Flow Modal */}
        <AssignFlowModal
          open={isAssignModalOpen}
          onOpenChange={setIsAssignModalOpen}
          contactId={contactId!}
          existingFlowIds={contactFlows.map(cf => cf.flow_id)}
          onFlowAssigned={handleFlowAssigned}
        />
      </div>
    </CRMLayout>
  );
}
