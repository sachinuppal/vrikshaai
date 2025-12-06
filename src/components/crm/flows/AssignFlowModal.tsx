import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Workflow, Plus, Loader2, Check } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
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
    setLoading(true);
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
      <DialogContent className="max-w-lg bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Flow to Contact</DialogTitle>
          <DialogDescription>
            Assign an existing automation flow or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[320px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {/* Available Flows Section */}
                {availableFlows.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Available Flows
                    </h4>
                    <div className="space-y-2">
                      {availableFlows.map((flow) => (
                        <div
                          key={flow.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                              <Workflow className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">{flow.name}</span>
                                <Badge 
                                  variant={flow.status === 'published' ? 'default' : 'secondary'}
                                  className="text-xs shrink-0"
                                >
                                  {flow.status}
                                </Badge>
                              </div>
                              {flow.description && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {flow.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAssignFlow(flow.id)}
                            disabled={assigning === flow.id}
                            className="ml-2 shrink-0"
                          >
                            {assigning === flow.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Assign
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Already Assigned Section */}
                {alreadyAssigned.length > 0 && (
                  <div className="space-y-2">
                    {availableFlows.length > 0 && <Separator className="my-3" />}
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Already Assigned
                    </h4>
                    <div className="space-y-2">
                      {alreadyAssigned.map((flow) => (
                        <div
                          key={flow.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-muted shrink-0">
                              <Workflow className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium text-muted-foreground truncate">
                              {flow.name}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0 gap-1">
                            <Check className="h-3 w-3" />
                            Assigned
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {filteredFlows.length === 0 && (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                      <Workflow className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {search ? 'No flows match your search' : 'No flows created yet'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create a new flow to get started
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <Separator />

          {/* Create New Flow Button - at the bottom */}
          <Button 
            onClick={handleCreateNewFlow} 
            variant="outline" 
            className="w-full justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Flow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}