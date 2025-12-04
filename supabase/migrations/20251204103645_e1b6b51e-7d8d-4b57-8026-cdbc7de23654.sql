-- Add AI calling consent column to lead_submissions table
ALTER TABLE public.lead_submissions 
ADD COLUMN ai_calling_consent boolean NOT NULL DEFAULT false;