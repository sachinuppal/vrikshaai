-- Create enterprise_leads table for enterprise pilot/partnership inquiries
CREATE TABLE public.enterprise_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  use_cases TEXT[] NOT NULL,
  contact_name TEXT NOT NULL,
  role TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  deployment_mode TEXT,
  estimated_scale TEXT,
  additional_notes TEXT,
  best_time_for_demo TEXT,
  nda_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enterprise_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous inserts (public form submissions)
CREATE POLICY "Allow anonymous inserts" 
ON public.enterprise_leads 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy for authenticated inserts
CREATE POLICY "Allow authenticated inserts" 
ON public.enterprise_leads 
FOR INSERT 
TO authenticated
WITH CHECK (true);