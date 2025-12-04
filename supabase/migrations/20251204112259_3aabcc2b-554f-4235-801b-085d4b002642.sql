-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  country_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('draft', 'submitted', 'under_review', 'accepted', 'rejected');

-- Create accelerator_applications table
CREATE TABLE public.accelerator_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'draft',
  batch text,
  
  -- Founders section (JSONB for flexibility with multiple cofounders)
  cofounder_details jsonb DEFAULT '[]'::jsonb,
  
  -- Company section
  company_name text,
  company_description text,
  company_url text,
  company_location text,
  founding_date date,
  logo_url text,
  
  -- Progress section
  current_progress text,
  tech_stack text,
  traction_metrics text,
  
  -- Idea section
  problem_statement text,
  solution text,
  competitors text,
  differentiation text,
  business_model text,
  
  -- Equity section
  previous_funding text,
  equity_raised text,
  current_valuation text,
  
  submitted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS on applications
ALTER TABLE public.accelerator_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for applications
CREATE POLICY "Users can view their own application"
ON public.accelerator_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application"
ON public.accelerator_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application"
ON public.accelerator_applications FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.accelerator_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();