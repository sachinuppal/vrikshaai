-- Add observability analysis columns to voice_widget_calls
ALTER TABLE public.voice_widget_calls 
ADD COLUMN IF NOT EXISTS observability_analysis JSONB DEFAULT NULL;

ALTER TABLE public.voice_widget_calls 
ADD COLUMN IF NOT EXISTS observability_status TEXT DEFAULT NULL;