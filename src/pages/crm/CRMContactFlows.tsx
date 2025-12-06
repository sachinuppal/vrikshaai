import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Workflow, Activity, Clock, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactFlowsList } from '@/components/crm/flows/ContactFlowsList';
import { AssignFlowModal } from '@/components/crm/flows/AssignFlowModal';
import { toast } from 'sonner';

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
      
      // Transform the data to handle the joined flow
      const flows = (flowsRes.data || []).map((cf: any) => ({
        ...cf,
        flow: cf.flow || { id: cf.flow_id, name: 'Unknown Flow', description: null, status: 'draft' }
      }));
      setContactFlows(flows);
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
      toast.success('Flow removed from contact');
    } catch (error) {
      console.error('Error removing flow:', error);
      toast.error('Failed to remove flow');
    }
  };

  const handleFlowAssigned = () => {
    fetchData();
    setIsAssignModalOpen(false);
  };

  const activeFlows = contactFlows.filter(cf => cf.is_enabled);
  const totalExecutions = contactFlows.reduce((sum, cf) => sum + cf.execution_count, 0);

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
        <div className="flex items-center justify-between">
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
          <Button onClick={() => setIsAssignModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Flow
          </Button>
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

        {/* Flows List */}
        <ContactFlowsList
          contactFlows={contactFlows}
          onToggle={handleToggleFlow}
          onRemove={handleRemoveFlow}
          onEdit={(flowId) => navigate(`/crm/flow-builder/${flowId}?contactId=${contactId}`)}
        />

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
