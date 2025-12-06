import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Users, 
  Bell, 
  RefreshCw, 
  Star, 
  ArrowRight,
  MessageSquare,
  Phone,
  Mail,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FlowNodeData } from './FlowNode';
import { FlowEdgeData } from './AgenticFlowCanvas';

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
  tags: string[];
}

interface FlowTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (nodes: FlowNodeData[], edges: FlowEdgeData[], name: string) => void;
}

// Pre-built flow templates
const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: 'lead-qualification',
    name: 'Lead Qualification',
    description: 'Automatically qualify leads based on engagement score and route to appropriate follow-up',
    category: 'Sales',
    icon: Target,
    tags: ['Lead Scoring', 'Automation', 'Routing'],
    nodes: [
      { id: 'n1', node_type: 'trigger_crm_event', label: 'New Lead Created', config: { event: 'lead.created' }, position_x: 400, position_y: 80 },
      { id: 'n2', node_type: 'ai_classify', label: 'Score Lead Intent', config: { model: 'gemini-2.5-flash' }, position_x: 400, position_y: 220 },
      { id: 'n3', node_type: 'router_score', label: 'Route by Score', config: { thresholds: [70, 40] }, position_x: 400, position_y: 360 },
      { id: 'n4', node_type: 'channel_voice', label: 'Priority Call', config: { priority: 'high' }, position_x: 200, position_y: 500 },
      { id: 'n5', node_type: 'channel_whatsapp', label: 'Send WhatsApp', config: { template: 'welcome' }, position_x: 400, position_y: 500 },
      { id: 'n6', node_type: 'channel_email', label: 'Nurture Email', config: { template: 'intro' }, position_x: 600, position_y: 500 },
      { id: 'n7', node_type: 'end_flow', label: 'End Flow', config: {}, position_x: 400, position_y: 640 }
    ],
    edges: [
      { id: 'e1', source_node_id: 'n1', target_node_id: 'n2' },
      { id: 'e2', source_node_id: 'n2', target_node_id: 'n3' },
      { id: 'e3', source_node_id: 'n3', target_node_id: 'n4', label: 'Hot (>70)', source_point: 'output-left' },
      { id: 'e4', source_node_id: 'n3', target_node_id: 'n5', label: 'Warm (40-70)' },
      { id: 'e5', source_node_id: 'n3', target_node_id: 'n6', label: 'Cold (<40)', source_point: 'output-right' },
      { id: 'e6', source_node_id: 'n4', target_node_id: 'n7' },
      { id: 'e7', source_node_id: 'n5', target_node_id: 'n7' },
      { id: 'e8', source_node_id: 'n6', target_node_id: 'n7' }
    ]
  },
  {
    id: 'follow-up-sequence',
    name: 'Follow-up Sequence',
    description: 'Multi-channel follow-up sequence with delays and AI-powered responses',
    category: 'Engagement',
    icon: RefreshCw,
    tags: ['Multi-channel', 'Sequences', 'Delays'],
    nodes: [
      { id: 'n1', node_type: 'trigger_schedule', label: 'Daily 9 AM', config: { cron: '0 9 * * *' }, position_x: 400, position_y: 80 },
      { id: 'n2', node_type: 'router_conditional', label: 'Check Last Contact', config: { field: 'days_since_contact', operator: '>', value: 3 }, position_x: 400, position_y: 220 },
      { id: 'n3', node_type: 'ai_conversation', label: 'Generate Message', config: { model: 'gemini-2.5-flash' }, position_x: 400, position_y: 360 },
      { id: 'n4', node_type: 'router_channel', label: 'Preferred Channel', config: {}, position_x: 400, position_y: 500 },
      { id: 'n5', node_type: 'channel_whatsapp', label: 'WhatsApp', config: {}, position_x: 200, position_y: 640 },
      { id: 'n6', node_type: 'channel_sms', label: 'SMS', config: {}, position_x: 400, position_y: 640 },
      { id: 'n7', node_type: 'channel_email', label: 'Email', config: {}, position_x: 600, position_y: 640 },
      { id: 'n8', node_type: 'utility_delay', label: 'Wait 2 Days', config: { duration: '2d' }, position_x: 400, position_y: 780 },
      { id: 'n9', node_type: 'end_flow', label: 'End', config: {}, position_x: 400, position_y: 920 }
    ],
    edges: [
      { id: 'e1', source_node_id: 'n1', target_node_id: 'n2' },
      { id: 'e2', source_node_id: 'n2', target_node_id: 'n3' },
      { id: 'e3', source_node_id: 'n3', target_node_id: 'n4' },
      { id: 'e4', source_node_id: 'n4', target_node_id: 'n5', source_point: 'output-left' },
      { id: 'e5', source_node_id: 'n4', target_node_id: 'n6' },
      { id: 'e6', source_node_id: 'n4', target_node_id: 'n7', source_point: 'output-right' },
      { id: 'e7', source_node_id: 'n5', target_node_id: 'n8' },
      { id: 'e8', source_node_id: 'n6', target_node_id: 'n8' },
      { id: 'e9', source_node_id: 'n7', target_node_id: 'n8' },
      { id: 'e10', source_node_id: 'n8', target_node_id: 'n9' }
    ]
  },
  {
    id: 'churn-prevention',
    name: 'Churn Prevention',
    description: 'Detect at-risk customers and trigger retention campaigns automatically',
    category: 'Retention',
    icon: Users,
    tags: ['Churn', 'Retention', 'AI'],
    nodes: [
      { id: 'n1', node_type: 'trigger_crm_event', label: 'Churn Risk High', config: { event: 'contact.churn_risk_high' }, position_x: 400, position_y: 80 },
      { id: 'n2', node_type: 'ai_conversation', label: 'Analyze History', config: {}, position_x: 400, position_y: 220 },
      { id: 'n3', node_type: 'channel_voice', label: 'Personal Call', config: { priority: 'urgent' }, position_x: 400, position_y: 360 },
      { id: 'n4', node_type: 'utility_update_contact', label: 'Mark Contacted', config: { field: 'retention_contacted', value: true }, position_x: 400, position_y: 500 },
      { id: 'n5', node_type: 'end_flow', label: 'End', config: {}, position_x: 400, position_y: 640 }
    ],
    edges: [
      { id: 'e1', source_node_id: 'n1', target_node_id: 'n2' },
      { id: 'e2', source_node_id: 'n2', target_node_id: 'n3' },
      { id: 'e3', source_node_id: 'n3', target_node_id: 'n4' },
      { id: 'e4', source_node_id: 'n4', target_node_id: 'n5' }
    ]
  },
  {
    id: 'welcome-onboarding',
    name: 'Welcome & Onboarding',
    description: 'Automated welcome sequence for new customers with personalized onboarding',
    category: 'Onboarding',
    icon: Star,
    tags: ['Welcome', 'Onboarding', 'New Customer'],
    nodes: [
      { id: 'n1', node_type: 'trigger_crm_event', label: 'New Customer', config: { event: 'contact.created' }, position_x: 400, position_y: 80 },
      { id: 'n2', node_type: 'channel_email', label: 'Welcome Email', config: { template: 'welcome' }, position_x: 400, position_y: 220 },
      { id: 'n3', node_type: 'utility_delay', label: 'Wait 1 Hour', config: { duration: '1h' }, position_x: 400, position_y: 360 },
      { id: 'n4', node_type: 'channel_whatsapp', label: 'WhatsApp Intro', config: {}, position_x: 400, position_y: 500 },
      { id: 'n5', node_type: 'utility_delay', label: 'Wait 1 Day', config: { duration: '1d' }, position_x: 400, position_y: 640 },
      { id: 'n6', node_type: 'channel_voice', label: 'Onboarding Call', config: {}, position_x: 400, position_y: 780 },
      { id: 'n7', node_type: 'end_flow', label: 'End', config: {}, position_x: 400, position_y: 920 }
    ],
    edges: [
      { id: 'e1', source_node_id: 'n1', target_node_id: 'n2' },
      { id: 'e2', source_node_id: 'n2', target_node_id: 'n3' },
      { id: 'e3', source_node_id: 'n3', target_node_id: 'n4' },
      { id: 'e4', source_node_id: 'n4', target_node_id: 'n5' },
      { id: 'e5', source_node_id: 'n5', target_node_id: 'n6' },
      { id: 'e6', source_node_id: 'n6', target_node_id: 'n7' }
    ]
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Smart appointment reminders with confirmation and rescheduling options',
    category: 'Notifications',
    icon: Bell,
    tags: ['Appointments', 'Reminders', 'Confirmations'],
    nodes: [
      { id: 'n1', node_type: 'trigger_schedule', label: '24h Before', config: { trigger: 'appointment_reminder_24h' }, position_x: 400, position_y: 80 },
      { id: 'n2', node_type: 'channel_sms', label: 'Reminder SMS', config: { message: 'Reminder: Your appointment is tomorrow at {time}. Reply YES to confirm or RESCHEDULE to change.' }, position_x: 400, position_y: 220 },
      { id: 'n3', node_type: 'utility_delay', label: 'Wait for Reply', config: { duration: '4h' }, position_x: 400, position_y: 360 },
      { id: 'n4', node_type: 'router_conditional', label: 'Check Response', config: {}, position_x: 400, position_y: 500 },
      { id: 'n5', node_type: 'utility_update_contact', label: 'Mark Confirmed', config: {}, position_x: 200, position_y: 640 },
      { id: 'n6', node_type: 'end_transfer', label: 'Transfer to Agent', config: {}, position_x: 600, position_y: 640 },
      { id: 'n7', node_type: 'end_flow', label: 'End', config: {}, position_x: 400, position_y: 780 }
    ],
    edges: [
      { id: 'e1', source_node_id: 'n1', target_node_id: 'n2' },
      { id: 'e2', source_node_id: 'n2', target_node_id: 'n3' },
      { id: 'e3', source_node_id: 'n3', target_node_id: 'n4' },
      { id: 'e4', source_node_id: 'n4', target_node_id: 'n5', label: 'Confirmed', source_point: 'output-left' },
      { id: 'e5', source_node_id: 'n4', target_node_id: 'n6', label: 'Reschedule', source_point: 'output-right' },
      { id: 'e6', source_node_id: 'n5', target_node_id: 'n7' },
      { id: 'e7', source_node_id: 'n6', target_node_id: 'n7' }
    ]
  }
];

const CATEGORIES = ['All', 'Sales', 'Engagement', 'Retention', 'Onboarding', 'Notifications'];

export const FlowTemplatesModal: React.FC<FlowTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = FLOW_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: FlowTemplate) => {
    // Generate new IDs for nodes and edges
    const idMap: Record<string, string> = {};
    
    const newNodes = template.nodes.map(node => {
      const newId = crypto.randomUUID();
      idMap[node.id] = newId;
      return { ...node, id: newId };
    });
    
    const newEdges = template.edges.map(edge => ({
      ...edge,
      id: crypto.randomUUID(),
      source_node_id: idMap[edge.source_node_id],
      target_node_id: idMap[edge.target_node_id]
    }));
    
    onSelectTemplate(newNodes, newEdges, template.name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Flow Templates</h2>
              <p className="text-sm text-muted-foreground">Start with a pre-built flow and customize it</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1 p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No templates found matching your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold truncate">{template.name}</h3>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {template.nodes.length} nodes
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
