-- User API Keys table for storing external provider keys
CREATE TABLE public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'google', 'anthropic')),
  key_name TEXT,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- AI Usage Log table for tracking all token usage
CREATE TABLE public.ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('script_chat', 'flowchart_generation', 'observability', 'crm_flow_builder')),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  api_key_id UUID REFERENCES public.user_api_keys(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_api_keys
CREATE POLICY "Users can view their own API keys"
  ON public.user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
  ON public.user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON public.user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON public.user_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_usage_log
CREATE POLICY "Users can view their own usage logs"
  ON public.ai_usage_log FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow insert from edge functions"
  ON public.ai_usage_log FOR INSERT
  WITH CHECK (true);

-- Admins can view all usage
CREATE POLICY "Admins can view all usage logs"
  ON public.ai_usage_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_ai_usage_log_user_id ON public.ai_usage_log(user_id);
CREATE INDEX idx_ai_usage_log_created_at ON public.ai_usage_log(created_at);
CREATE INDEX idx_ai_usage_log_feature ON public.ai_usage_log(feature);
CREATE INDEX idx_user_api_keys_user_provider ON public.user_api_keys(user_id, provider);

-- Update trigger for user_api_keys
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();