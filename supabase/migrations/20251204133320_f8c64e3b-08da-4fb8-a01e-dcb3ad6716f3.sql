-- Create investor_leads table for investor/partner inquiries
CREATE TABLE public.investor_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role TEXT,
  interest_types TEXT[] NOT NULL,
  comments TEXT,
  estimated_budget TEXT,
  preferred_followup TEXT,
  best_time_to_contact TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.investor_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" 
ON public.investor_leads 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow authenticated inserts
CREATE POLICY "Allow authenticated inserts" 
ON public.investor_leads 
FOR INSERT 
TO authenticated
WITH CHECK (true);