-- Add new columns for enhanced contact form
ALTER TABLE public.lead_submissions 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);