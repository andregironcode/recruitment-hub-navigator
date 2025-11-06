-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can insert roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy: Admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Fix Jobs Table Policies
-- ============================================

-- Drop existing public view policy
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;

-- Allow anyone to view jobs (public access)
CREATE POLICY "Anyone can view jobs"
ON public.jobs
FOR SELECT
USING (true);

-- Allow admins to insert jobs
CREATE POLICY "Admins can insert jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update jobs
CREATE POLICY "Admins can update jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete jobs
CREATE POLICY "Admins can delete jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Fix Applications Table Policies (SECURITY FIX)
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;

-- Allow anyone to submit applications (public job seekers)
CREATE POLICY "Anyone can submit applications"
ON public.applications
FOR INSERT
WITH CHECK (true);

-- Only admins can view applications (protects PII)
CREATE POLICY "Admins can view applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update applications
CREATE POLICY "Admins can update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.applications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Fix Application Analyses Table Policies (SECURITY FIX)
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view application analyses" ON public.application_analyses;
DROP POLICY IF EXISTS "Service role can insert analyses" ON public.application_analyses;

-- Only admins can view analyses
CREATE POLICY "Admins can view analyses"
ON public.application_analyses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert analyses
CREATE POLICY "Admins can insert analyses"
ON public.application_analyses
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update analyses
CREATE POLICY "Admins can update analyses"
ON public.application_analyses
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete analyses
CREATE POLICY "Admins can delete analyses"
ON public.application_analyses
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- Fix Job Categories Table Policies
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view job categories" ON public.job_categories;

-- Allow anyone to view categories
CREATE POLICY "Anyone can view job categories"
ON public.job_categories
FOR SELECT
USING (true);

-- Allow admins to manage categories
CREATE POLICY "Admins can insert categories"
ON public.job_categories
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.job_categories
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.job_categories
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));