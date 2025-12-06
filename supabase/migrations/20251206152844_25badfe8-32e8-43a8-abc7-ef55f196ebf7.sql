-- Available integrations catalog
CREATE TABLE public.crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  auth_type TEXT NOT NULL DEFAULT 'oauth2',
  oauth_config JSONB DEFAULT '{}',
  api_base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  node_types JSONB DEFAULT '[]',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User's connected integrations
CREATE TABLE public.crm_integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.crm_integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  credentials JSONB DEFAULT '{}',
  scopes TEXT[] DEFAULT '{}',
  account_name TEXT,
  account_id TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_integration_connections ENABLE ROW LEVEL SECURITY;

-- Policies for integrations catalog (public read)
CREATE POLICY "Anyone can view integrations" ON public.crm_integrations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage integrations" ON public.crm_integrations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for connections (user-specific)
CREATE POLICY "Users can view their own connections" ON public.crm_integration_connections
  FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own connections" ON public.crm_integration_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" ON public.crm_integration_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON public.crm_integration_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Seed initial integrations
INSERT INTO public.crm_integrations (name, slug, category, description, auth_type, logo_url, features) VALUES
  ('Salesforce', 'salesforce', 'crm', 'Sync leads, contacts, and opportunities with Salesforce CRM', 'oauth2', 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg', ARRAY['sync_contacts', 'sync_leads', 'sync_opportunities']),
  ('HubSpot', 'hubspot', 'crm', 'Connect with HubSpot for marketing automation and CRM', 'oauth2', 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png', ARRAY['sync_contacts', 'sync_deals', 'marketing_automation']),
  ('Zoho CRM', 'zoho', 'crm', 'Integrate with Zoho CRM for sales and customer management', 'oauth2', 'https://www.zohowebstatic.com/sites/default/files/zoho_general_pages/zoho-logo.png', ARRAY['sync_contacts', 'sync_leads']),
  ('Pipedrive', 'pipedrive', 'crm', 'Connect Pipedrive for deal and pipeline management', 'api_key', 'https://www.pipedrive.com/favicon.ico', ARRAY['sync_deals', 'sync_contacts']),
  ('Stripe', 'stripe', 'payments', 'Process payments and manage subscriptions with Stripe', 'api_key', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', ARRAY['payments', 'subscriptions', 'invoices']),
  ('Razorpay', 'razorpay', 'payments', 'Accept payments in India with Razorpay', 'api_key', 'https://razorpay.com/favicon.ico', ARRAY['payments', 'subscriptions']),
  ('Twilio', 'twilio', 'communication', 'Send SMS and make voice calls via Twilio', 'api_key', 'https://www.twilio.com/favicon.ico', ARRAY['sms', 'voice', 'whatsapp']),
  ('SendGrid', 'sendgrid', 'communication', 'Send transactional and marketing emails', 'api_key', 'https://sendgrid.com/favicon.ico', ARRAY['email', 'templates']),
  ('Slack', 'slack', 'communication', 'Send notifications and messages to Slack channels', 'oauth2', 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png', ARRAY['notifications', 'channels']),
  ('Google Calendar', 'google_calendar', 'calendar', 'Sync meetings and appointments with Google Calendar', 'oauth2', 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png', ARRAY['events', 'scheduling']),
  ('Calendly', 'calendly', 'calendar', 'Automate scheduling with Calendly integration', 'oauth2', 'https://assets.calendly.com/assets/favicon-32x32.png', ARRAY['scheduling', 'availability']),
  ('Shopify', 'shopify', 'ecommerce', 'Connect your Shopify store for order and customer data', 'oauth2', 'https://cdn.shopify.com/shopifycloud/web/assets/v1/favicon-32x32.png', ARRAY['orders', 'customers', 'products']),
  ('Zapier', 'zapier', 'automation', 'Connect to 5000+ apps via Zapier webhooks', 'webhook', 'https://cdn.zapier.com/ssr/build/favicon.ico', ARRAY['webhooks', 'automation']),
  ('Make', 'make', 'automation', 'Build complex automations with Make (Integromat)', 'webhook', 'https://www.make.com/favicon.ico', ARRAY['webhooks', 'automation']),
  ('WhatsApp Business', 'whatsapp', 'communication', 'Send WhatsApp messages via Business API', 'api_key', 'https://static.whatsapp.net/rsrc.php/v3/yP/r/rYZqPCBaG70.png', ARRAY['messaging', 'templates'])
ON CONFLICT (slug) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_crm_integration_connections_updated_at
  BEFORE UPDATE ON public.crm_integration_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();