import { 
  Webhook, Clock, Zap, GitBranch, HelpCircle, TrendingUp,
  MessageSquare, MessageCircle, Phone, Mail,
  Brain, Sparkles, Tag, Hash, Globe, Timer, User,
  Circle, Users, Send, Bot, Database, Workflow,
  CreditCard, ShoppingCart, Calendar, Bell, FileText,
  UserPlus, Building2, DollarSign, Receipt, Link,
  Share2, Package, Headphones
} from 'lucide-react';

export interface NodeTypeConfig {
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  category: 'trigger' | 'router' | 'channel' | 'ai' | 'utility' | 'end' | 'integration';
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
  },

  // ========== INTEGRATION NODES ==========

  // Salesforce
  salesforce_create_lead: {
    label: 'Salesforce: Create Lead',
    icon: UserPlus,
    color: '#00A1E0',
    bgColor: '#E6F7FF',
    category: 'integration',
    description: 'Create a new lead in Salesforce',
    configFields: [
      { name: 'first_name', label: 'First Name', type: 'text', placeholder: '{{contact.first_name}}' },
      { name: 'last_name', label: 'Last Name', type: 'text', placeholder: '{{contact.last_name}}' },
      { name: 'email', label: 'Email', type: 'text', placeholder: '{{contact.email}}' },
      { name: 'company', label: 'Company', type: 'text', placeholder: '{{contact.company_name}}' },
      { name: 'lead_source', label: 'Lead Source', type: 'text', placeholder: 'Web' }
    ]
  },
  salesforce_update_contact: {
    label: 'Salesforce: Update Contact',
    icon: User,
    color: '#00A1E0',
    bgColor: '#E6F7FF',
    category: 'integration',
    description: 'Update an existing Salesforce contact',
    configFields: [
      { name: 'contact_id', label: 'Contact ID', type: 'text', placeholder: '{{salesforce_id}}' },
      { name: 'fields', label: 'Fields to Update', type: 'json', placeholder: '{"Phone": "{{phone}}"}' }
    ]
  },
  salesforce_create_opportunity: {
    label: 'Salesforce: Create Opportunity',
    icon: DollarSign,
    color: '#00A1E0',
    bgColor: '#E6F7FF',
    category: 'integration',
    description: 'Create a new opportunity in Salesforce',
    configFields: [
      { name: 'name', label: 'Opportunity Name', type: 'text' },
      { name: 'account_id', label: 'Account ID', type: 'text' },
      { name: 'stage', label: 'Stage', type: 'select', options: [
        { value: 'Prospecting', label: 'Prospecting' },
        { value: 'Qualification', label: 'Qualification' },
        { value: 'Proposal', label: 'Proposal' },
        { value: 'Negotiation', label: 'Negotiation' },
        { value: 'Closed Won', label: 'Closed Won' }
      ]},
      { name: 'amount', label: 'Amount', type: 'number' }
    ]
  },

  // HubSpot
  hubspot_create_contact: {
    label: 'HubSpot: Create Contact',
    icon: UserPlus,
    color: '#FF7A59',
    bgColor: '#FFF5F3',
    category: 'integration',
    description: 'Create a new contact in HubSpot',
    configFields: [
      { name: 'email', label: 'Email', type: 'text', placeholder: '{{contact.email}}', required: true },
      { name: 'firstname', label: 'First Name', type: 'text' },
      { name: 'lastname', label: 'Last Name', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' }
    ]
  },
  hubspot_create_deal: {
    label: 'HubSpot: Create Deal',
    icon: DollarSign,
    color: '#FF7A59',
    bgColor: '#FFF5F3',
    category: 'integration',
    description: 'Create a new deal in HubSpot',
    configFields: [
      { name: 'dealname', label: 'Deal Name', type: 'text', required: true },
      { name: 'pipeline', label: 'Pipeline', type: 'text' },
      { name: 'dealstage', label: 'Deal Stage', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'contact_id', label: 'Associated Contact ID', type: 'text' }
    ]
  },
  hubspot_add_to_list: {
    label: 'HubSpot: Add to List',
    icon: Users,
    color: '#FF7A59',
    bgColor: '#FFF5F3',
    category: 'integration',
    description: 'Add contact to a HubSpot list',
    configFields: [
      { name: 'list_id', label: 'List ID', type: 'text', required: true },
      { name: 'contact_id', label: 'Contact ID', type: 'text' }
    ]
  },

  // Stripe
  stripe_create_customer: {
    label: 'Stripe: Create Customer',
    icon: UserPlus,
    color: '#635BFF',
    bgColor: '#F6F5FF',
    category: 'integration',
    description: 'Create a new Stripe customer',
    configFields: [
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'metadata', label: 'Metadata', type: 'json' }
    ]
  },
  stripe_create_payment_link: {
    label: 'Stripe: Create Payment Link',
    icon: CreditCard,
    color: '#635BFF',
    bgColor: '#F6F5FF',
    category: 'integration',
    description: 'Generate a Stripe payment link',
    configFields: [
      { name: 'price_id', label: 'Price ID', type: 'text', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
      { name: 'success_url', label: 'Success URL', type: 'text' },
      { name: 'cancel_url', label: 'Cancel URL', type: 'text' }
    ]
  },
  stripe_create_invoice: {
    label: 'Stripe: Create Invoice',
    icon: Receipt,
    color: '#635BFF',
    bgColor: '#F6F5FF',
    category: 'integration',
    description: 'Create and send a Stripe invoice',
    configFields: [
      { name: 'customer_id', label: 'Customer ID', type: 'text', required: true },
      { name: 'items', label: 'Line Items', type: 'json', placeholder: '[{"price": "price_xxx", "quantity": 1}]' },
      { name: 'auto_send', label: 'Auto Send', type: 'boolean' }
    ]
  },

  // Razorpay
  razorpay_create_link: {
    label: 'Razorpay: Payment Link',
    icon: CreditCard,
    color: '#072654',
    bgColor: '#E8EEF5',
    category: 'integration',
    description: 'Create a Razorpay payment link',
    configFields: [
      { name: 'amount', label: 'Amount (paise)', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'text', placeholder: 'INR' },
      { name: 'description', label: 'Description', type: 'text' },
      { name: 'customer_name', label: 'Customer Name', type: 'text' },
      { name: 'customer_email', label: 'Customer Email', type: 'text' }
    ]
  },

  // Twilio
  twilio_send_sms: {
    label: 'Twilio: Send SMS',
    icon: MessageSquare,
    color: '#F22F46',
    bgColor: '#FEF2F3',
    category: 'integration',
    description: 'Send SMS via Twilio',
    configFields: [
      { name: 'to', label: 'To Number', type: 'text', placeholder: '{{contact.phone}}', required: true },
      { name: 'body', label: 'Message Body', type: 'textarea', required: true },
      { name: 'from', label: 'From Number', type: 'text' }
    ]
  },
  twilio_make_call: {
    label: 'Twilio: Make Call',
    icon: Phone,
    color: '#F22F46',
    bgColor: '#FEF2F3',
    category: 'integration',
    description: 'Initiate a voice call via Twilio',
    configFields: [
      { name: 'to', label: 'To Number', type: 'text', required: true },
      { name: 'from', label: 'From Number', type: 'text', required: true },
      { name: 'twiml_url', label: 'TwiML URL', type: 'text' }
    ]
  },

  // SendGrid
  sendgrid_send_email: {
    label: 'SendGrid: Send Email',
    icon: Mail,
    color: '#1A82E2',
    bgColor: '#E8F4FD',
    category: 'integration',
    description: 'Send email via SendGrid',
    configFields: [
      { name: 'to', label: 'To Email', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'template_id', label: 'Template ID', type: 'text' },
      { name: 'dynamic_data', label: 'Dynamic Data', type: 'json' }
    ]
  },

  // Slack
  slack_send_message: {
    label: 'Slack: Send Message',
    icon: MessageCircle,
    color: '#4A154B',
    bgColor: '#F4ECF4',
    category: 'integration',
    description: 'Send a message to Slack channel',
    configFields: [
      { name: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
      { name: 'text', label: 'Message', type: 'textarea', required: true },
      { name: 'blocks', label: 'Block Kit JSON', type: 'json' }
    ]
  },
  slack_notify_user: {
    label: 'Slack: Notify User',
    icon: Bell,
    color: '#4A154B',
    bgColor: '#F4ECF4',
    category: 'integration',
    description: 'Send direct message to Slack user',
    configFields: [
      { name: 'user_id', label: 'User ID', type: 'text', required: true },
      { name: 'text', label: 'Message', type: 'textarea', required: true }
    ]
  },

  // Google Calendar
  google_calendar_create: {
    label: 'Google Calendar: Create Event',
    icon: Calendar,
    color: '#4285F4',
    bgColor: '#EBF3FE',
    category: 'integration',
    description: 'Create a Google Calendar event',
    configFields: [
      { name: 'summary', label: 'Event Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'start_time', label: 'Start Time', type: 'text', placeholder: '2024-01-15T10:00:00' },
      { name: 'end_time', label: 'End Time', type: 'text', placeholder: '2024-01-15T11:00:00' },
      { name: 'attendees', label: 'Attendees (emails)', type: 'json', placeholder: '["email@example.com"]' }
    ]
  },

  // Calendly
  calendly_create_invite: {
    label: 'Calendly: Create Invite Link',
    icon: Calendar,
    color: '#006BFF',
    bgColor: '#E6F0FF',
    category: 'integration',
    description: 'Generate a Calendly scheduling link',
    configFields: [
      { name: 'event_type', label: 'Event Type URI', type: 'text', required: true },
      { name: 'invitee_email', label: 'Invitee Email', type: 'text' }
    ]
  },

  // Shopify
  shopify_create_customer: {
    label: 'Shopify: Create Customer',
    icon: UserPlus,
    color: '#96BF48',
    bgColor: '#F4F9EC',
    category: 'integration',
    description: 'Create a customer in Shopify',
    configFields: [
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'first_name', label: 'First Name', type: 'text' },
      { name: 'last_name', label: 'Last Name', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'tags', label: 'Tags', type: 'text' }
    ]
  },
  shopify_create_order: {
    label: 'Shopify: Create Order',
    icon: ShoppingCart,
    color: '#96BF48',
    bgColor: '#F4F9EC',
    category: 'integration',
    description: 'Create an order in Shopify',
    configFields: [
      { name: 'customer_id', label: 'Customer ID', type: 'text' },
      { name: 'line_items', label: 'Line Items', type: 'json', placeholder: '[{"variant_id": 123, "quantity": 1}]' },
      { name: 'financial_status', label: 'Financial Status', type: 'select', options: [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' }
      ]}
    ]
  },

  // Zapier
  zapier_trigger_webhook: {
    label: 'Zapier: Trigger Webhook',
    icon: Zap,
    color: '#FF4A00',
    bgColor: '#FFF0EB',
    category: 'integration',
    description: 'Trigger a Zapier webhook',
    configFields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text', required: true },
      { name: 'payload', label: 'Payload', type: 'json' }
    ]
  },

  // Make (Integromat)
  make_trigger_webhook: {
    label: 'Make: Trigger Scenario',
    icon: Share2,
    color: '#6D00CC',
    bgColor: '#F5EBFF',
    category: 'integration',
    description: 'Trigger a Make scenario via webhook',
    configFields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text', required: true },
      { name: 'payload', label: 'Payload', type: 'json' }
    ]
  },

  // WhatsApp Business
  whatsapp_send_template: {
    label: 'WhatsApp: Send Template',
    icon: MessageCircle,
    color: '#25D366',
    bgColor: '#E9FBF0',
    category: 'integration',
    description: 'Send WhatsApp template message',
    configFields: [
      { name: 'to', label: 'To Number', type: 'text', required: true },
      { name: 'template_name', label: 'Template Name', type: 'text', required: true },
      { name: 'template_params', label: 'Template Parameters', type: 'json' },
      { name: 'language', label: 'Language Code', type: 'text', placeholder: 'en' }
    ]
  },

  // Zoho CRM
  zoho_create_lead: {
    label: 'Zoho: Create Lead',
    icon: UserPlus,
    color: '#D4382C',
    bgColor: '#FCEFEE',
    category: 'integration',
    description: 'Create a lead in Zoho CRM',
    configFields: [
      { name: 'first_name', label: 'First Name', type: 'text' },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'lead_source', label: 'Lead Source', type: 'text' }
    ]
  },

  // Pipedrive
  pipedrive_create_deal: {
    label: 'Pipedrive: Create Deal',
    icon: DollarSign,
    color: '#017737',
    bgColor: '#E6F5EC',
    category: 'integration',
    description: 'Create a deal in Pipedrive',
    configFields: [
      { name: 'title', label: 'Deal Title', type: 'text', required: true },
      { name: 'value', label: 'Value', type: 'number' },
      { name: 'currency', label: 'Currency', type: 'text', placeholder: 'USD' },
      { name: 'person_id', label: 'Person ID', type: 'text' },
      { name: 'stage_id', label: 'Stage ID', type: 'text' }
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
  integration: {
    label: 'Integrations',
    description: 'Third-party services',
    color: '#0ea5e9'
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
