-- Create voice_leads table for demo requests
CREATE TABLE public.voice_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  industry TEXT NOT NULL,
  use_case TEXT,
  current_solution TEXT,
  estimated_call_volume TEXT,
  comments TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voice_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public demo form)
CREATE POLICY "Allow anonymous inserts"
ON public.voice_leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated inserts
CREATE POLICY "Allow authenticated inserts"
ON public.voice_leads
FOR INSERT
TO authenticated
WITH CHECK (true);