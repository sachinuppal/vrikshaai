import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Workflow, MoreHorizontal, Pencil, Copy, Trash2, Play, Pause, Loader2 } from 'lucide-react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Flow {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  flow_json: any;
}

export default function CRMFlows() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteFlowId, setDeleteFlowId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crm_agentic_flows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setFlows(data || []);
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = () => {
    navigate('/crm/flow-builder');
  };

  const handleEditFlow = (flowId: string) => {
    navigate(`/crm/flow-builder/${flowId}`);
  };

  const handleDuplicateFlow = async (flow: Flow) => {
    try {
      const { data, error } = await supabase
        .from('crm_agentic_flows')
        .insert({
          name: `${flow.name} (Copy)`,
          description: flow.description,
          status: 'draft',
          flow_json: flow.flow_json,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Flow duplicated successfully');
      fetchFlows();
    } catch (error) {
      console.error('Error duplicating flow:', error);
      toast.error('Failed to duplicate flow');
    }
  };

  const handleDeleteFlow = async () => {
    if (!deleteFlowId) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('crm_agentic_flows')
        .delete()
        .eq('id', deleteFlowId);

      if (error) throw error;

      toast.success('Flow deleted successfully');
      setFlows(flows.filter(f => f.id !== deleteFlowId));
    } catch (error) {
      console.error('Error deleting flow:', error);
      toast.error('Failed to delete flow');
    } finally {
      setDeleting(false);
      setDeleteFlowId(null);
    }
  };

  const handleToggleStatus = async (flow: Flow) => {
    const newStatus = flow.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('crm_agentic_flows')
        .update({ status: newStatus })
        .eq('id', flow.id);

      if (error) throw error;

      toast.success(`Flow ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      setFlows(flows.map(f => f.id === flow.id ? { ...f, status: newStatus } : f));
    } catch (error) {
      console.error('Error updating flow status:', error);
      toast.error('Failed to update flow status');
    }
  };

  const getNodeCount = (flowJson: any): number => {
    if (!flowJson) return 0;
    if (flowJson.nodes && Array.isArray(flowJson.nodes)) {
      return flowJson.nodes.length;
    }
    return 0;
  };

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(search.toLowerCase()) ||
      flow.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: flows.length,
    published: flows.filter(f => f.status === 'published').length,
    draft: flows.filter(f => f.status === 'draft').length,
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Flows</h1>
            <p className="text-muted-foreground">
              Create and manage automation flows for your contacts
            </p>
          </div>
          <Button onClick={handleCreateFlow} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Flow
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Flows</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-3xl text-primary">{stats.published}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Drafts</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">{stats.draft}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flows Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFlows.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Workflow className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-1">
                  {search || statusFilter !== 'all' ? 'No flows match your filters' : 'No flows created yet'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a new flow to automate contact interactions
                </p>
                <Button onClick={handleCreateFlow} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Flow
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flow Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nodes</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlows.map((flow) => (
                    <TableRow 
                      key={flow.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEditFlow(flow.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Workflow className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{flow.name}</p>
                            {flow.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {flow.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={flow.status === 'published' ? 'default' : 'secondary'}>
                          {flow.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {getNodeCount(flow.flow_json)} nodes
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {flow.updated_at ? format(new Date(flow.updated_at), 'MMM d, yyyy') : '-'}
                        </span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditFlow(flow.id)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateFlow(flow)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(flow)}>
                              {flow.status === 'published' ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteFlowId(flow.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteFlowId} onOpenChange={() => setDeleteFlowId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flow? This action cannot be undone.
              Any contacts assigned to this flow will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFlow}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CRMLayout>
  );
}
