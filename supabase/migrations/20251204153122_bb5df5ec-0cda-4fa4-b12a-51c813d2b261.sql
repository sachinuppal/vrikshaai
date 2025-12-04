-- Create crm_leads table for pilot requests
CREATE TABLE public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  estimated_lead_volume TEXT,
  current_crm TEXT,
  key_pain_point TEXT NOT NULL,
  pilot_path TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  preferred_time TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" 
ON public.crm_leads 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated inserts
CREATE POLICY "Allow authenticated inserts" 
ON public.crm_leads 
FOR INSERT 
TO authenticated
WITH CHECK (true);