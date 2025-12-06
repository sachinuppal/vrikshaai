import { 
  Webhook, Clock, Zap, GitBranch, HelpCircle, TrendingUp,
  MessageSquare, MessageCircle, Phone, Mail,
  Brain, Sparkles, Tag, Hash, Globe, Timer, User,
  Circle, Users, Send, Bot, Database, Workflow
} from 'lucide-react';

export interface NodeTypeConfig {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  category: 'trigger' | 'router' | 'channel' | 'ai' | 'utility' | 'end';
  description?: string;
  configFields?: ConfigField[];
}

export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'json';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

export const NODE_TYPES: Record<string, NodeTypeConfig> = {
  // Triggers
  api_trigger: {
    label: 'API Request',
    icon: Webhook,
    color: '#f97316',
    bgColor: '#fff7ed',
    category: 'trigger',
    description: 'Starts when an API endpoint is called',
    configFields: [
      { name: 'endpoint', label: 'Endpoint Path', type: 'text', placeholder: '/webhook/lead' },
      { name: 'method', label: 'HTTP Method', type: 'select', options: [
        { value: 'POST', label: 'POST' },
        { value: 'GET', label: 'GET' }
      ]},
      { name: 'auth_required', label: 'Require Auth', type: 'boolean' }
    ]
  },
  schedule_trigger: {
    label: 'Schedule',
    icon: Clock,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    category: 'trigger',
    description: 'Runs on a scheduled time',
    configFields: [
      { name: 'cron', label: 'Cron Expression', type: 'text', placeholder: '0 9 * * *' },
      { name: 'timezone', label: 'Timezone', type: 'text', placeholder: 'Asia/Kolkata' }
    ]
  },
  event_trigger: {
    label: 'CRM Event',
    icon: Zap,
    color: '#eab308',
    bgColor: '#fefce8',
    category: 'trigger',
    description: 'Triggers on CRM events',
    configFields: [
      { name: 'event_type', label: 'Event Type', type: 'select', options: [
        { value: 'new_lead', label: 'New Lead' },
        { value: 'score_change', label: 'Score Change' },
        { value: 'lifecycle_change', label: 'Lifecycle Change' },
        { value: 'interaction', label: 'New Interaction' }
      ]}
    ]
  },

  // Routers
  channel_router: {
    label: 'Channel Router',
    icon: GitBranch,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    category: 'router',
    description: 'Routes based on preferred channel',
    configFields: [
      { name: 'field', label: 'Route By', type: 'select', options: [
        { value: 'preferred_channel', label: 'Preferred Channel' },
        { value: 'last_channel', label: 'Last Channel Used' }
      ]}
    ]
  },
  conditional: {
    label: 'Conditional',
    icon: HelpCircle,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    category: 'router',
    description: 'Branch based on conditions',
    configFields: [
      { name: 'conditions', label: 'Conditions', type: 'json', placeholder: '{"field": "score", "operator": ">", "value": 50}' }
    ]
  },
  score_router: {
    label: 'Score Router',
    icon: TrendingUp,
    color: '#6366f1',
    bgColor: '#eef2ff',
    category: 'router',
    description: 'Routes based on score thresholds',
    configFields: [
      { name: 'score_type', label: 'Score Type', type: 'select', options: [
        { value: 'intent_score', label: 'Intent Score' },
        { value: 'engagement_score', label: 'Engagement Score' },
        { value: 'churn_risk', label: 'Churn Risk' }
      ]},
      { name: 'thresholds', label: 'Thresholds', type: 'json', placeholder: '[{"min": 0, "max": 30, "label": "Low"}]' }
    ]
  },

  // Channel Actions
  sms_message: {
    label: 'Send SMS',
    icon: MessageSquare,
    color: '#22c55e',
    bgColor: '#f0fdf4',
    category: 'channel',
    description: 'Send an SMS message',
    configFields: [
      { name: 'template', label: 'Message Template', type: 'textarea', placeholder: 'Hi {{name}}, ...' },
      { name: 'sender_id', label: 'Sender ID', type: 'text' }
    ]
  },
  whatsapp_message: {
    label: 'WhatsApp',
    icon: MessageCircle,
    color: '#10b981',
    bgColor: '#ecfdf5',
    category: 'channel',
    description: 'Send a WhatsApp message',
    configFields: [
      { name: 'template_name', label: 'Template Name', type: 'text' },
      { name: 'template_params', label: 'Template Params', type: 'json' }
    ]
  },
  voice_call: {
    label: 'Voice Call',
    icon: Phone,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    category: 'channel',
    description: 'Initiate an AI voice call',
    configFields: [
      { name: 'agent_id', label: 'AI Agent ID', type: 'text' },
      { name: 'initial_message', label: 'Initial Message', type: 'textarea' }
    ]
  },
  email_action: {
    label: 'Send Email',
    icon: Mail,
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
    category: 'channel',
    description: 'Send an email',
    configFields: [
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'template', label: 'Email Template', type: 'textarea' }
    ]
  },

  // AI Actions
  ai_conversation: {
    label: 'AI Conversation',
    icon: Brain,
    color: '#ec4899',
    bgColor: '#fdf2f8',
    category: 'ai',
    description: 'Have an AI-driven conversation',
    configFields: [
      { name: 'prompt', label: 'Conversation Prompt', type: 'textarea' },
      { name: 'expected_outputs', label: 'Expected Outputs', type: 'json', placeholder: '["name", "intent", "budget"]' }
    ]
  },
  ai_action: {
    label: 'AI Action',
    icon: Sparkles,
    color: '#06b6d4',
    bgColor: '#ecfeff',
    category: 'ai',
    description: 'Perform an AI-powered action',
    configFields: [
      { name: 'action_prompt', label: 'Action Prompt', type: 'textarea' },
      { name: 'action_type', label: 'Action Type', type: 'select', options: [
        { value: 'classify', label: 'Classify' },
        { value: 'extract', label: 'Extract Data' },
        { value: 'decide', label: 'Make Decision' }
      ]}
    ]
  },
  ai_classify: {
    label: 'AI Classify',
    icon: Tag,
    color: '#f43f5e',
    bgColor: '#fff1f2',
    category: 'ai',
    description: 'Classify input into categories',
    configFields: [
      { name: 'categories', label: 'Categories', type: 'json', placeholder: '["Sales", "Support", "Billing"]' }
    ]
  },
  ai_agent: {
    label: 'AI Agent',
    icon: Bot,
    color: '#a855f7',
    bgColor: '#faf5ff',
    category: 'ai',
    description: 'Autonomous AI agent with tools',
    configFields: [
      { name: 'agent_prompt', label: 'Agent System Prompt', type: 'textarea' },
      { name: 'tools', label: 'Available Tools', type: 'json', placeholder: '["search", "calculate", "lookup"]' },
      { name: 'max_iterations', label: 'Max Iterations', type: 'number', placeholder: '5' }
    ]
  },

  // Utility Actions
  counter: {
    label: 'Counter',
    icon: Hash,
    color: '#64748b',
    bgColor: '#f8fafc',
    category: 'utility',
    description: 'Track and limit iterations',
    configFields: [
      { name: 'counter_name', label: 'Counter Name', type: 'text' },
      { name: 'max_count', label: 'Max Count', type: 'number' }
    ]
  },
  http_request: {
    label: 'HTTP Request',
    icon: Globe,
    color: '#2563eb',
    bgColor: '#eff6ff',
    category: 'utility',
    description: 'Make an external API call',
    configFields: [
      { name: 'url', label: 'URL', type: 'text' },
      { name: 'method', label: 'Method', type: 'select', options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' }
      ]},
      { name: 'headers', label: 'Headers', type: 'json' },
      { name: 'body', label: 'Body', type: 'json' }
    ]
  },
  delay: {
    label: 'Delay',
    icon: Timer,
    color: '#6b7280',
    bgColor: '#f9fafb',
    category: 'utility',
    description: 'Wait before next step',
    configFields: [
      { name: 'duration', label: 'Duration (seconds)', type: 'number' }
    ]
  },
  update_contact: {
    label: 'Update Contact',
    icon: User,
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    category: 'utility',
    description: 'Update contact data',
    configFields: [
      { name: 'updates', label: 'Field Updates', type: 'json', placeholder: '{"lifecycle_stage": "qualified"}' }
    ]
  },
  database_query: {
    label: 'Database Query',
    icon: Database,
    color: '#059669',
    bgColor: '#ecfdf5',
    category: 'utility',
    description: 'Query or update database',
    configFields: [
      { name: 'operation', label: 'Operation', type: 'select', options: [
        { value: 'select', label: 'Select' },
        { value: 'insert', label: 'Insert' },
        { value: 'update', label: 'Update' }
      ]},
      { name: 'table', label: 'Table Name', type: 'text' },
      { name: 'query', label: 'Query/Data', type: 'json' }
    ]
  },
  subflow: {
    label: 'Run Subflow',
    icon: Workflow,
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    category: 'utility',
    description: 'Execute another flow',
    configFields: [
      { name: 'flow_id', label: 'Flow ID', type: 'text' },
      { name: 'input_mapping', label: 'Input Mapping', type: 'json' }
    ]
  },

  // End Points
  end_conversation: {
    label: 'End Flow',
    icon: Circle,
    color: '#ef4444',
    bgColor: '#fef2f2',
    category: 'end',
    description: 'Terminate the flow',
    configFields: [
      { name: 'summary', label: 'End Summary', type: 'textarea' }
    ]
  },
  queue_transfer: {
    label: 'Transfer to Agent',
    icon: Users,
    color: '#ea580c',
    bgColor: '#fff7ed',
    category: 'end',
    description: 'Hand off to human agent',
    configFields: [
      { name: 'queue_name', label: 'Queue Name', type: 'text' },
      { name: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]}
    ]
  },
  send_notification: {
    label: 'Send Notification',
    icon: Send,
    color: '#0891b2',
    bgColor: '#ecfeff',
    category: 'end',
    description: 'Send internal notification',
    configFields: [
      { name: 'channel', label: 'Channel', type: 'select', options: [
        { value: 'slack', label: 'Slack' },
        { value: 'email', label: 'Email' },
        { value: 'webhook', label: 'Webhook' }
      ]},
      { name: 'message', label: 'Message', type: 'textarea' }
    ]
  }
};

export const NODE_CATEGORIES = {
  trigger: { 
    label: 'Triggers', 
    description: 'Start points for your flow',
    color: '#f97316'
  },
  router: { 
    label: 'Routers', 
    description: 'Decision points',
    color: '#8b5cf6'
  },
  channel: { 
    label: 'Channels', 
    description: 'Communication actions',
    color: '#22c55e'
  },
  ai: { 
    label: 'AI Actions', 
    description: 'AI-powered steps',
    color: '#ec4899'
  },
  utility: { 
    label: 'Utilities', 
    description: 'Helper actions',
    color: '#64748b'
  },
  end: { 
    label: 'End Points', 
    description: 'Flow termination',
    color: '#ef4444'
  }
};
