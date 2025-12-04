-- Add company registration status to accelerator_applications
ALTER TABLE public.accelerator_applications
ADD COLUMN IF NOT EXISTS company_registered boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'registered';

-- Create cofounder_invites table
CREATE TABLE public.cofounder_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.accelerator_applications(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_by uuid NOT NULL REFERENCES public.profiles(id),
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on cofounder_invites
ALTER TABLE public.cofounder_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for cofounder_invites
CREATE POLICY "Users can view invites for their applications"
ON public.cofounder_invites FOR SELECT
USING (
  invited_by = auth.uid() OR 
  application_id IN (SELECT id FROM public.accelerator_applications WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create invites for their applications"
ON public.cofounder_invites FOR INSERT
WITH CHECK (
  application_id IN (SELECT id FROM public.accelerator_applications WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own invites"
ON public.cofounder_invites FOR UPDATE
USING (invited_by = auth.uid());

CREATE POLICY "Users can delete their own invites"
ON public.cofounder_invites FOR DELETE
USING (invited_by = auth.uid());

-- Public policy for accepting invites via token
CREATE POLICY "Anyone can view invite by token"
ON public.cofounder_invites FOR SELECT
USING (true);

-- Create application_collaborators table
CREATE TABLE public.application_collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.accelerator_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(application_id, user_id)
);

-- Enable RLS on application_collaborators
ALTER TABLE public.application_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS policies for application_collaborators
CREATE POLICY "Users can view collaborators for their applications"
ON public.application_collaborators FOR SELECT
USING (
  user_id = auth.uid() OR
  application_id IN (SELECT id FROM public.accelerator_applications WHERE user_id = auth.uid())
);

CREATE POLICY "Application owners can manage collaborators"
ON public.application_collaborators FOR INSERT
WITH CHECK (
  application_id IN (SELECT id FROM public.accelerator_applications WHERE user_id = auth.uid())
);

CREATE POLICY "Application owners can update collaborators"
ON public.application_collaborators FOR UPDATE
USING (
  application_id IN (SELECT id FROM public.accelerator_applications WHERE user_id = auth.uid())
);

CREATE POLICY "Application owners can delete collaborators"
ON public.application_collaborators FOR DELETE
USING (
  application_id IN (SELECT id FROM public.accelerator_applications WHERE user_id = auth.uid())
);

-- Add trigger for updated_at on cofounder_invites
CREATE TRIGGER update_cofounder_invites_updated_at
BEFORE UPDATE ON public.cofounder_invites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();