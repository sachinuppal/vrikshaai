import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NODE_TYPES, ConfigField } from './nodeTypes';
import { FlowNodeData } from './FlowNode';

interface NodeConfigPanelProps {
  node: FlowNodeData | null;
  onClose: () => void;
  onUpdate: (nodeId: string, updates: Partial<FlowNodeData>) => void;
  onDelete: (nodeId: string) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdate,
  onDelete
}) => {
  if (!node) return null;

  const nodeType = NODE_TYPES[node.node_type];
  if (!nodeType) return null;

  const Icon = nodeType.icon;

  const handleConfigChange = (fieldName: string, value: any) => {
    onUpdate(node.id, {
      config: {
        ...node.config,
        [fieldName]: value
      }
    });
  };

  const handleLabelChange = (label: string) => {
    onUpdate(node.id, { label });
  };

  const renderField = (field: ConfigField) => {
    const value = node.config[field.name] ?? '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.name}
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={value}
            onChange={(e) => handleConfigChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(v) => handleConfigChange(field.name, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(field.name, parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
          />
        );

      case 'boolean':
        return (
          <Switch
            id={field.name}
            checked={!!value}
            onCheckedChange={(checked) => handleConfigChange(field.name, checked)}
          />
        );

      case 'json':
        return (
          <Textarea
            id={field.name}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleConfigChange(field.name, parsed);
              } catch {
                handleConfigChange(field.name, e.target.value);
              }
            }}
            placeholder={field.placeholder}
            rows={4}
            className="font-mono text-xs"
          />
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="absolute top-0 right-0 w-80 h-full bg-card border-l shadow-xl z-20"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: nodeType.color }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{nodeType.label}</p>
              <p className="font-medium text-foreground">{node.label}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100%-130px)]">
          <div className="p-4 space-y-4">
            {/* Node Label */}
            <div className="space-y-2">
              <Label htmlFor="node-label">Node Label</Label>
              <Input
                id="node-label"
                value={node.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Enter node label..."
              />
            </div>

            {/* Config Fields */}
            {nodeType.configFields && nodeType.configFields.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Settings className="w-4 h-4" />
                  <span>Configuration</span>
                </div>

                {nodeType.configFields.map(field => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="flex items-center gap-1">
                      {field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
