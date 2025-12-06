import { motion } from 'framer-motion';
import { Workflow, MoreVertical, Clock, Zap, Trash2, Edit, ExternalLink, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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

interface ContactFlowsListProps {
  contactFlows: ContactFlow[];
  onToggle: (contactFlowId: string, isEnabled: boolean) => void;
  onRemove: (contactFlowId: string) => void;
  onEdit: (flowId: string) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  selectable?: boolean;
}

export function ContactFlowsList({ 
  contactFlows, 
  onToggle, 
  onRemove, 
  onEdit,
  selectedIds = [],
  onSelectionChange,
  selectable = false
}: ContactFlowsListProps) {
  const handleSelectAll = () => {
    if (selectedIds.length === contactFlows.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(contactFlows.map(cf => cf.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  if (contactFlows.length === 0) {
    return (
      <Card className="border-none shadow-card">
        <CardContent className="py-12 text-center">
          <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Flows Assigned</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Assign automation flows to this contact to automate follow-ups, scoring updates, and more.
          </p>
        </CardContent>
      </Card>
    );
  }

  const allSelected = selectedIds.length === contactFlows.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < contactFlows.length;

  return (
    <Card className="border-none shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Assigned Flows</CardTitle>
        {selectable && contactFlows.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={allSelected}
              ref={(el) => {
                if (el) (el as any).indeterminate = someSelected;
              }}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {allSelected ? 'Deselect all' : 'Select all'}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {contactFlows.map((cf, index) => (
          <motion.div
            key={cf.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              selectedIds.includes(cf.id) 
                ? 'bg-primary/10 ring-1 ring-primary/20' 
                : 'bg-muted/30 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              {selectable && (
                <Checkbox 
                  checked={selectedIds.includes(cf.id)}
                  onCheckedChange={() => handleSelectOne(cf.id)}
                />
              )}
              <div className="p-2 rounded-lg bg-primary/10">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{cf.flow.name}</h4>
                  <Badge 
                    variant={cf.flow.status === 'published' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {cf.flow.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {cf.execution_count} runs
                  </span>
                  {cf.last_executed_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last run {formatDistanceToNow(new Date(cf.last_executed_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {cf.is_enabled ? 'Active' : 'Disabled'}
                </span>
                <Switch
                  checked={cf.is_enabled}
                  onCheckedChange={(checked) => onToggle(cf.id, checked)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(cf.flow_id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Flow
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`/crm/flow-builder/${cf.flow_id}`, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Contact
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Flow</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{cf.flow.name}" from this contact? 
                          The flow itself will not be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemove(cf.id)}>
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}