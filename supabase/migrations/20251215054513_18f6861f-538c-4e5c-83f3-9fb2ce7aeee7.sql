-- Create agent_scripts table for storing structured voice agent scripts
CREATE TABLE public.agent_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft', -- draft, active, archived
  
  -- The complete 18-section structured script as JSON
  script_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Flowchart representation
  flowchart_json JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  use_case TEXT, -- e.g., 'store_locator', 'debt_collection', 'appointment_booking'
  industry TEXT,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_scripts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage scripts" ON public.agent_scripts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active scripts" ON public.agent_scripts
  FOR SELECT USING (status = 'active' OR has_role(auth.uid(), 'admin'::app_role));

-- Create agent_script_versions for version history
CREATE TABLE public.agent_script_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES public.agent_scripts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  script_json JSONB NOT NULL,
  flowchart_json JSONB,
  change_summary TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_script_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage script versions" ON public.agent_script_versions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view script versions" ON public.agent_script_versions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create observability_sessions table for comprehensive call analysis
CREATE TABLE public.observability_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES public.agent_scripts(id) ON DELETE SET NULL,
  voice_call_id UUID REFERENCES public.voice_widget_calls(id) ON DELETE SET NULL,
  
  -- Session metadata
  session_type TEXT DEFAULT 'call', -- call, test, simulation
  source TEXT DEFAULT 'ringg',
  external_call_id TEXT,
  
  -- Input data
  transcript JSONB,
  platform_analysis JSONB,
  client_analysis JSONB,
  
  -- Comprehensive observability output
  observability_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- 5 Pillars scores (0-100)
  reliability_score INTEGER,
  latency_score INTEGER,
  accuracy_score INTEGER,
  adherence_score INTEGER,
  outcome_score INTEGER,
  overall_score INTEGER,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, analyzing, complete, error
  error_message TEXT,
  
  -- Flags
  anomalies_detected JSONB DEFAULT '[]'::jsonb,
  violations JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT DEFAULT 'low', -- low, medium, high, critical
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.observability_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage observability sessions" ON public.observability_sessions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view observability sessions" ON public.observability_sessions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Create script_chat_messages for chat history
CREATE TABLE public.script_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID REFERENCES public.agent_scripts(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.script_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage chat messages" ON public.script_chat_messages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view chat messages" ON public.script_chat_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_agent_scripts_updated_at
  BEFORE UPDATE ON public.agent_scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_observability_sessions_updated_at
  BEFORE UPDATE ON public.observability_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();