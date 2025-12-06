-- Create junction table for contact-flow assignments
CREATE TABLE public.crm_contact_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL REFERENCES public.crm_agentic_flows(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  custom_config JSONB DEFAULT '{}',
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contact_id, flow_id)
);

-- Enable RLS
ALTER TABLE public.crm_contact_flows ENABLE ROW LEVEL SECURITY;

-- RLS policies for admins
CREATE POLICY "Admins can view contact flows"
ON public.crm_contact_flows
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage contact flows"
ON public.crm_contact_flows
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_crm_contact_flows_updated_at
BEFORE UPDATE ON public.crm_contact_flows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_crm_contact_flows_contact_id ON public.crm_contact_flows(contact_id);
CREATE INDEX idx_crm_contact_flows_flow_id ON public.crm_contact_flows(flow_id);