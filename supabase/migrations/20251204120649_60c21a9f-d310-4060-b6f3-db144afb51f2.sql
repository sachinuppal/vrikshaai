-- Create cohorts table
CREATE TABLE public.cohorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  late_deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cohorts
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- Everyone can view cohorts
CREATE POLICY "Anyone can view cohorts"
ON public.cohorts
FOR SELECT
USING (true);

-- Add cohort_id to accelerator_applications
ALTER TABLE public.accelerator_applications
ADD COLUMN cohort_id UUID REFERENCES public.cohorts(id);

-- Drop the unique constraint on user_id to allow multiple applications per user
ALTER TABLE public.accelerator_applications
DROP CONSTRAINT IF EXISTS accelerator_applications_user_id_key;

-- Add unique constraint on user_id + cohort_id (one application per cohort per user)
ALTER TABLE public.accelerator_applications
ADD CONSTRAINT unique_user_cohort UNIQUE (user_id, cohort_id);

-- Add trigger for cohorts updated_at
CREATE TRIGGER update_cohorts_updated_at
BEFORE UPDATE ON public.cohorts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial cohorts
INSERT INTO public.cohorts (name, code, description, deadline, is_active) VALUES
('Winter 2026', 'W26', 'Winter 2026 Cohort', '2026-01-15 23:59:59+00', true),
('Summer 2026', 'S26', 'Summer 2026 Cohort', '2026-06-15 23:59:59+00', false),
('Winter 2025', 'W25', 'Winter 2025 Cohort', '2025-01-15 23:59:59+00', false);