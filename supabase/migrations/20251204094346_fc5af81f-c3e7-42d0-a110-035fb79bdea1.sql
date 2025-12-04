-- Create lead_submissions table for storing form data from modals
CREATE TABLE public.lead_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  mobile VARCHAR(50),
  use_case TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for lead capture without requiring auth)
CREATE POLICY "Allow anonymous inserts" ON public.lead_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated inserts as well
CREATE POLICY "Allow authenticated inserts" ON public.lead_submissions
  FOR INSERT TO authenticated WITH CHECK (true);