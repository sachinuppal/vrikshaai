
-- CRM Phase 1: Foundation Schema

-- 1. CRM Contacts - Unified customer identity with computed scores
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core identity
  full_name TEXT,
  email TEXT,
  phone TEXT UNIQUE,
  country_code TEXT,
  company_name TEXT,
  
  -- Classification
  user_type TEXT, -- investor, founder, developer, enterprise, general
  primary_industry TEXT,
  lifecycle_stage TEXT DEFAULT 'lead', -- lead, qualified, opportunity, customer, churned
  
  -- Computed scores (0-100)
  intent_score INTEGER DEFAULT 0,
  urgency_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  ltv_prediction NUMERIC DEFAULT 0,
  churn_risk INTEGER DEFAULT 0,
  
  -- Dynamic profile data
  base_profile JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  -- Source tracking
  source TEXT, -- voice_widget, lead_form, manual, whatsapp, email
  source_id UUID,
  
  -- Channel preferences (learned from behavior)
  preferred_channel TEXT,
  optimal_contact_time TEXT,
  
  -- Activity tracking
  total_interactions INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  last_channel TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CRM Variables - Progressive variable store (each data point captured)
CREATE TABLE public.crm_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  
  -- Variable details
  variable_name TEXT NOT NULL, -- e.g., 'budget', 'timeline', 'interest_area', 'pain_point'
  variable_value TEXT NOT NULL,
  variable_type TEXT DEFAULT 'text', -- text, number, date, boolean, json
  
  -- Source tracking
  source_channel TEXT NOT NULL, -- voice_ai, voice_human, whatsapp, sms, email, telegram, web
  source_interaction_id UUID,
  
  -- Confidence and recency
  confidence NUMERIC DEFAULT 0.8,
  extracted_by TEXT DEFAULT 'ai', -- ai, human, system
  
  -- Versioning (same variable can be updated)
  is_current BOOLEAN DEFAULT true,
  superseded_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CRM Interactions - All touchpoints unified
CREATE TABLE public.crm_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  
  -- Channel info
  channel TEXT NOT NULL, -- voice_ai, voice_human, whatsapp, sms, email, telegram, web, meeting
  direction TEXT NOT NULL, -- inbound, outbound
  
  -- Content
  summary TEXT,
  raw_content JSONB, -- transcript, message body, email content
  
  -- AI Analysis
  sentiment TEXT, -- positive, negative, neutral, mixed
  sentiment_score NUMERIC,
  intent_detected TEXT[], -- inquiry, complaint, purchase_intent, support, etc.
  entities_extracted JSONB, -- names, dates, amounts, products mentioned
  ai_insights JSONB, -- full analysis from AI
  
  -- Call-specific
  duration_seconds INTEGER,
  recording_url TEXT,
  
  -- Source reference
  source_type TEXT, -- voice_widget_call, whatsapp_message, email, manual
  source_id UUID,
  
  -- Timestamps
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CRM Scores - Time-series computed scores for trend analysis
CREATE TABLE public.crm_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  
  -- Score type and value
  score_type TEXT NOT NULL, -- intent, urgency, engagement, ltv, churn_risk
  score_value INTEGER NOT NULL,
  
  -- Factors that contributed
  factors JSONB, -- { "recent_calls": 3, "positive_sentiment": true, "budget_mentioned": "$50k" }
  
  -- Tracking
  computed_at TIMESTAMPTZ DEFAULT now(),
  triggered_by TEXT -- interaction_id, scheduled, manual
);

-- 5. CRM Predictions - AI predictions per contact
CREATE TABLE public.crm_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  
  -- Prediction type
  prediction_type TEXT NOT NULL, -- next_action, next_product, conversion_probability
  
  -- Prediction details
  prediction_value JSONB NOT NULL, -- { "action": "send_demo_email", "product": "Voice AI", "probability": 0.75 }
  confidence NUMERIC,
  reasoning TEXT,
  
  -- Validity
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  generated_at TIMESTAMPTZ DEFAULT now(),
  acted_upon BOOLEAN DEFAULT false,
  acted_at TIMESTAMPTZ
);

-- 6. CRM Tasks - Next actions queue (AI-generated + human)
CREATE TABLE public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT, -- follow_up, demo, proposal, call, email, whatsapp, meeting
  
  -- Channel routing
  suggested_channel TEXT, -- email, whatsapp, phone, meeting, sms
  suggested_content TEXT, -- AI-generated message template
  
  -- Priority and timing
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  due_at TIMESTAMPTZ,
  optimal_time TEXT, -- "morning", "afternoon", "evening"
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled, snoozed
  completed_at TIMESTAMPTZ,
  
  -- AI tracking
  ai_generated BOOLEAN DEFAULT false,
  ai_reason TEXT,
  prediction_id UUID REFERENCES public.crm_predictions(id),
  
  -- Assignment
  assigned_to UUID,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CRM Industry Nodes - Industry taxonomy
CREATE TABLE public.crm_industry_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Industry details
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Hierarchy
  parent_industry_id UUID REFERENCES public.crm_industry_nodes(id),
  
  -- Auto-trigger conditions
  trigger_keywords TEXT[],
  trigger_conditions JSONB,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CRM Allied Industries - Cross-sell graph
CREATE TABLE public.crm_allied_industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationship
  primary_industry_id UUID REFERENCES public.crm_industry_nodes(id) ON DELETE CASCADE NOT NULL,
  allied_industry_id UUID REFERENCES public.crm_industry_nodes(id) ON DELETE CASCADE NOT NULL,
  
  -- Relationship strength
  relationship_type TEXT, -- upsell, cross_sell, partnership
  relationship_strength NUMERIC DEFAULT 0.5, -- 0-1
  
  -- Trigger conditions
  trigger_stage TEXT, -- qualified, opportunity, closed_won
  trigger_conditions JSONB,
  
  -- Action templates
  action_template JSONB, -- { "type": "email", "template_id": "...", "to": "partner" }
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(primary_industry_id, allied_industry_id)
);

-- 9. CRM Triggers - Agentic rules engine
CREATE TABLE public.crm_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Trigger details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Conditions (when to fire)
  trigger_event TEXT NOT NULL, -- interaction_created, score_changed, stage_changed, variable_added
  conditions JSONB NOT NULL, -- { "intent_score": { "gte": 70 }, "lifecycle_stage": "qualified" }
  
  -- Actions (what to do)
  actions JSONB NOT NULL, -- [{ "type": "create_task", "params": {...} }, { "type": "send_whatsapp", "params": {...} }]
  
  -- Control
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  -- Rate limiting
  cooldown_minutes INTEGER DEFAULT 60,
  max_executions_per_contact INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. CRM Trigger Executions - Log of trigger fires
CREATE TABLE public.crm_trigger_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id UUID REFERENCES public.crm_triggers(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE NOT NULL,
  
  -- Execution details
  matched_conditions JSONB,
  actions_executed JSONB,
  execution_status TEXT, -- success, partial, failed
  error_message TEXT,
  
  executed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_industry_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_allied_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_trigger_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can access all CRM data
CREATE POLICY "Admins can view all contacts" ON public.crm_contacts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert contacts" ON public.crm_contacts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.crm_contacts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contacts" ON public.crm_contacts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all variables" ON public.crm_variables FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert variables" ON public.crm_variables FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update variables" ON public.crm_variables FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all interactions" ON public.crm_interactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert interactions" ON public.crm_interactions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update interactions" ON public.crm_interactions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all scores" ON public.crm_scores FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert scores" ON public.crm_scores FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all predictions" ON public.crm_predictions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage predictions" ON public.crm_predictions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all tasks" ON public.crm_tasks FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tasks" ON public.crm_tasks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view industry nodes" ON public.crm_industry_nodes FOR SELECT USING (true);
CREATE POLICY "Admins can manage industry nodes" ON public.crm_industry_nodes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view allied industries" ON public.crm_allied_industries FOR SELECT USING (true);
CREATE POLICY "Admins can manage allied industries" ON public.crm_allied_industries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view triggers" ON public.crm_triggers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage triggers" ON public.crm_triggers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view trigger executions" ON public.crm_trigger_executions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert trigger executions" ON public.crm_trigger_executions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_crm_contacts_phone ON public.crm_contacts(phone);
CREATE INDEX idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX idx_crm_contacts_lifecycle ON public.crm_contacts(lifecycle_stage);
CREATE INDEX idx_crm_contacts_industry ON public.crm_contacts(primary_industry);
CREATE INDEX idx_crm_contacts_intent ON public.crm_contacts(intent_score DESC);

CREATE INDEX idx_crm_variables_contact ON public.crm_variables(contact_id);
CREATE INDEX idx_crm_variables_name ON public.crm_variables(variable_name);
CREATE INDEX idx_crm_variables_current ON public.crm_variables(contact_id, is_current) WHERE is_current = true;

CREATE INDEX idx_crm_interactions_contact ON public.crm_interactions(contact_id);
CREATE INDEX idx_crm_interactions_channel ON public.crm_interactions(channel);
CREATE INDEX idx_crm_interactions_occurred ON public.crm_interactions(occurred_at DESC);

CREATE INDEX idx_crm_scores_contact ON public.crm_scores(contact_id);
CREATE INDEX idx_crm_tasks_contact ON public.crm_tasks(contact_id);
CREATE INDEX idx_crm_tasks_status ON public.crm_tasks(status) WHERE status = 'pending';
CREATE INDEX idx_crm_tasks_due ON public.crm_tasks(due_at) WHERE status = 'pending';

CREATE INDEX idx_crm_predictions_contact ON public.crm_predictions(contact_id);
CREATE INDEX idx_crm_predictions_active ON public.crm_predictions(contact_id, is_active) WHERE is_active = true;

CREATE INDEX idx_crm_triggers_active ON public.crm_triggers(is_active) WHERE is_active = true;
CREATE INDEX idx_crm_trigger_executions_trigger ON public.crm_trigger_executions(trigger_id);
CREATE INDEX idx_crm_trigger_executions_contact ON public.crm_trigger_executions(contact_id);

-- Trigger to update updated_at on crm_contacts
CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_triggers_updated_at
  BEFORE UPDATE ON public.crm_triggers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial industry nodes
INSERT INTO public.crm_industry_nodes (name, display_name, description, trigger_keywords, sort_order) VALUES
  ('real_estate', 'Real Estate', 'Property developers, builders, brokers', ARRAY['property', 'real estate', 'builder', 'construction', 'apartment', 'flat', 'villa', 'plot'], 1),
  ('edtech', 'EdTech', 'Education technology and learning platforms', ARRAY['education', 'school', 'college', 'course', 'learning', 'training', 'student'], 2),
  ('fintech', 'FinTech', 'Financial technology and services', ARRAY['finance', 'banking', 'loan', 'investment', 'insurance', 'payment'], 3),
  ('healthcare', 'Healthcare', 'Hospitals, clinics, health tech', ARRAY['health', 'hospital', 'clinic', 'doctor', 'medical', 'patient', 'wellness'], 4),
  ('ecommerce', 'E-Commerce', 'Online retail and marketplaces', ARRAY['shop', 'store', 'ecommerce', 'retail', 'product', 'order', 'delivery'], 5),
  ('saas', 'SaaS', 'Software as a service companies', ARRAY['software', 'saas', 'platform', 'tool', 'automation', 'cloud'], 6),
  ('travel', 'Travel & Hospitality', 'Travel agencies, hotels, tourism', ARRAY['travel', 'hotel', 'booking', 'flight', 'vacation', 'tourism', 'holiday'], 7),
  ('automotive', 'Automotive', 'Car dealers, service centers', ARRAY['car', 'vehicle', 'auto', 'bike', 'dealer', 'service'], 8);

-- Seed allied industry relationships
INSERT INTO public.crm_allied_industries (primary_industry_id, allied_industry_id, relationship_type, relationship_strength, trigger_stage)
SELECT 
  p.id as primary_industry_id,
  a.id as allied_industry_id,
  'cross_sell' as relationship_type,
  0.7 as relationship_strength,
  'qualified' as trigger_stage
FROM public.crm_industry_nodes p, public.crm_industry_nodes a
WHERE p.name = 'real_estate' AND a.name = 'fintech';

INSERT INTO public.crm_allied_industries (primary_industry_id, allied_industry_id, relationship_type, relationship_strength, trigger_stage)
SELECT 
  p.id as primary_industry_id,
  a.id as allied_industry_id,
  'cross_sell' as relationship_type,
  0.6 as relationship_strength,
  'opportunity' as trigger_stage
FROM public.crm_industry_nodes p, public.crm_industry_nodes a
WHERE p.name = 'edtech' AND a.name = 'fintech';
