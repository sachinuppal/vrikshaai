-- Create table for agentic flows
CREATE TABLE public.crm_agentic_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  flow_json JSONB DEFAULT '{}'::jsonb,
  global_prompt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for flow nodes
CREATE TABLE public.crm_flow_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.crm_agentic_flows(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  label TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  position_x NUMERIC DEFAULT 0,
  position_y NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for flow edges
CREATE TABLE public.crm_flow_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.crm_agentic_flows(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES public.crm_flow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.crm_flow_nodes(id) ON DELETE CASCADE,
  label TEXT,
  condition JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for agent chat history
CREATE TABLE public.crm_flow_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID REFERENCES public.crm_agentic_flows(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'thinking')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_agentic_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_flow_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for crm_agentic_flows
CREATE POLICY "Admins can manage flows" ON public.crm_agentic_flows
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view flows" ON public.crm_agentic_flows
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for crm_flow_nodes
CREATE POLICY "Admins can manage flow nodes" ON public.crm_flow_nodes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view flow nodes" ON public.crm_flow_nodes
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for crm_flow_edges
CREATE POLICY "Admins can manage flow edges" ON public.crm_flow_edges
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view flow edges" ON public.crm_flow_edges
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for crm_flow_chat_messages
CREATE POLICY "Admins can manage chat messages" ON public.crm_flow_chat_messages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view chat messages" ON public.crm_flow_chat_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_flow_nodes_flow_id ON public.crm_flow_nodes(flow_id);
CREATE INDEX idx_flow_edges_flow_id ON public.crm_flow_edges(flow_id);
CREATE INDEX idx_flow_edges_source ON public.crm_flow_edges(source_node_id);
CREATE INDEX idx_flow_edges_target ON public.crm_flow_edges(target_node_id);
CREATE INDEX idx_chat_messages_flow_id ON public.crm_flow_chat_messages(flow_id);
CREATE INDEX idx_chat_messages_session ON public.crm_flow_chat_messages(session_id);

-- Trigger for updated_at
CREATE TRIGGER update_crm_agentic_flows_updated_at
  BEFORE UPDATE ON public.crm_agentic_flows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();