import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Workflow, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Flow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface AssignFlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  existingFlowIds: string[];
  onFlowAssigned: () => void;
}

export function AssignFlowModal({ 
  open, 
  onOpenChange, 
  contactId, 
  existingFlowIds, 
  onFlowAssigned 
}: AssignFlowModalProps) {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      fetchFlows();
    }
  }, [open]);

  const fetchFlows = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_agentic_flows')
        .select('id, name, description, status, created_at')
        .order('name');

      if (error) throw error;
      setFlows(data || []);
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFlow = async (flowId: string) => {
    setAssigning(flowId);
    try {
      const { error } = await supabase
        .from('crm_contact_flows')
        .insert({
          contact_id: contactId,
          flow_id: flowId,
          is_enabled: true,
          priority: existingFlowIds.length
        });

      if (error) throw error;

      toast.success('Flow assigned to contact');
      onFlowAssigned();
    } catch (error) {
      console.error('Error assigning flow:', error);
      toast.error('Failed to assign flow');
    } finally {
      setAssigning(null);
    }
  };

  const handleCreateNewFlow = () => {
    onOpenChange(false);
    navigate(`/crm/flow-builder?contactId=${contactId}`);
  };

  const filteredFlows = flows.filter(flow => 
    flow.name.toLowerCase().includes(search.toLowerCase()) ||
    flow.description?.toLowerCase().includes(search.toLowerCase())
  );

  const availableFlows = filteredFlows.filter(flow => !existingFlowIds.includes(flow.id));
  const alreadyAssigned = filteredFlows.filter(flow => existingFlowIds.includes(flow.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Flow to Contact</DialogTitle>
          <DialogDescription>
            Assign an existing flow or create a new one for this contact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Flow Button */}
          <Button 
            onClick={handleCreateNewFlow} 
            variant="outline" 
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Flow for This Contact
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {availableFlows.length > 0 && (
                  <>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Available Flows ({availableFlows.length})
                    </p>
                    {availableFlows.map((flow) => (
                      <div
                        key={flow.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Workflow className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{flow.name}</span>
                              <Badge 
                                variant={flow.status === 'published' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {flow.status}
                              </Badge>
                            </div>
                            {flow.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {flow.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignFlow(flow.id)}
                          disabled={assigning === flow.id}
                        >
                          {assigning === flow.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Assign'
                          )}
                        </Button>
                      </div>
                    ))}
                  </>
                )}

                {alreadyAssigned.length > 0 && (
                  <>
                    <p className="text-sm font-medium text-muted-foreground mt-4 mb-2">
                      Already Assigned ({alreadyAssigned.length})
                    </p>
                    {alreadyAssigned.map((flow) => (
                      <div
                        key={flow.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 opacity-60"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-muted">
                            <Workflow className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium truncate">{flow.name}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Assigned
                        </Badge>
                      </div>
                    ))}
                  </>
                )}

                {filteredFlows.length === 0 && (
                  <div className="text-center py-8">
                    <Workflow className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {search ? 'No flows match your search' : 'No flows created yet'}
                    </p>
                    <Button 
                      variant="link" 
                      onClick={handleCreateNewFlow}
                      className="mt-2"
                    >
                      Create your first flow
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
