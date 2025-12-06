-- Create flow executions table for tracking execution history
CREATE TABLE public.crm_flow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_flow_id UUID REFERENCES crm_contact_flows(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL REFERENCES crm_agentic_flows(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running',
  nodes_executed JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  triggered_by TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_flow_executions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view flow executions"
ON public.crm_flow_executions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage flow executions"
ON public.crm_flow_executions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster queries
CREATE INDEX idx_crm_flow_executions_contact_id ON public.crm_flow_executions(contact_id);
CREATE INDEX idx_crm_flow_executions_flow_id ON public.crm_flow_executions(flow_id);
CREATE INDEX idx_crm_flow_executions_started_at ON public.crm_flow_executions(started_at DESC);