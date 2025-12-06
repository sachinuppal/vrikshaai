-- Create table for voice widget calls
CREATE TABLE public.voice_widget_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country_code TEXT NOT NULL,
  full_phone TEXT NOT NULL,
  source TEXT DEFAULT 'voice_widget',
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_widget_calls ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form)
CREATE POLICY "Allow anonymous inserts" ON public.voice_widget_calls
FOR INSERT WITH CHECK (true);

-- Allow authenticated inserts
CREATE POLICY "Allow authenticated inserts" ON public.voice_widget_calls
FOR INSERT TO authenticated WITH CHECK (true);