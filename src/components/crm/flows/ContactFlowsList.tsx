import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Workflow, MoreVertical, Clock, Zap, Trash2, Edit, ExternalLink, 
  GripVertical, Play, Loader2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  onReorder?: (flows: ContactFlow[]) => void;
  onRunFlow?: (contactFlowId: string, flowId: string) => void;
  runningFlowId?: string | null;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  selectable?: boolean;
}

interface SortableFlowItemProps {
  cf: ContactFlow;
  isSelected: boolean;
  selectable: boolean;
  onSelect: () => void;
  onToggle: (isEnabled: boolean) => void;
  onRemove: () => void;
  onEdit: () => void;
  onRunFlow?: () => void;
  isRunning: boolean;
}

function SortableFlowItem({ 
  cf, 
  isSelected, 
  selectable, 
  onSelect, 
  onToggle, 
  onRemove, 
  onEdit,
  onRunFlow,
  isRunning
}: SortableFlowItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
        isDragging 
          ? 'bg-primary/20 ring-2 ring-primary shadow-lg' 
          : isSelected 
            ? 'bg-primary/10 ring-1 ring-primary/20' 
            : 'bg-muted/30 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        
        {selectable && (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={onSelect}
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

      <div className="flex items-center gap-3">
        {onRunFlow && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onRunFlow}
            disabled={isRunning || !cf.is_enabled}
            title={cf.is_enabled ? "Run flow now" : "Enable flow to run"}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {cf.is_enabled ? 'Active' : 'Disabled'}
          </span>
          <Switch
            checked={cf.is_enabled}
            onCheckedChange={onToggle}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
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
                  <AlertDialogAction onClick={onRemove}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function ContactFlowsList({ 
  contactFlows, 
  onToggle, 
  onRemove, 
  onEdit,
  onReorder,
  onRunFlow,
  runningFlowId,
  selectedIds = [],
  onSelectionChange,
  selectable = false
}: ContactFlowsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = contactFlows.findIndex(cf => cf.id === active.id);
      const newIndex = contactFlows.findIndex(cf => cf.id === over.id);
      
      const reorderedFlows = arrayMove(contactFlows, oldIndex, newIndex).map((cf, idx) => ({
        ...cf,
        priority: idx
      }));
      
      onReorder?.(reorderedFlows);
    }
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={contactFlows.map(cf => cf.id)}
            strategy={verticalListSortingStrategy}
          >
            {contactFlows.map((cf, index) => (
              <motion.div
                key={cf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SortableFlowItem
                  cf={cf}
                  isSelected={selectedIds.includes(cf.id)}
                  selectable={selectable}
                  onSelect={() => handleSelectOne(cf.id)}
                  onToggle={(checked) => onToggle(cf.id, checked)}
                  onRemove={() => onRemove(cf.id)}
                  onEdit={() => onEdit(cf.flow_id)}
                  onRunFlow={onRunFlow ? () => onRunFlow(cf.id, cf.flow_id) : undefined}
                  isRunning={runningFlowId === cf.id}
                />
              </motion.div>
            ))}
          </SortableContext>
        </DndContext>
        
        {onReorder && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Drag flows to reorder priority. Top flows execute first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
