-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: Only admins can view roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 4: Fix voice_widget_calls - Drop dangerous public SELECT policy
DROP POLICY IF EXISTS "Allow reading calls" ON public.voice_widget_calls;

-- Only admins can view all calls
CREATE POLICY "Admins can view all calls" ON public.voice_widget_calls
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 5: Fix cofounder_invites - Drop the dangerous public SELECT policy
DROP POLICY IF EXISTS "Anyone can view invite by token" ON public.cofounder_invites;