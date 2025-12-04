-- Add edit_count column to track number of post-submission edits
ALTER TABLE public.accelerator_applications 
ADD COLUMN edit_count INTEGER NOT NULL DEFAULT 0;