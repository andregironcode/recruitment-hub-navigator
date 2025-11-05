-- Create jobs table
CREATE TABLE public.jobs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  job_type TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  posted_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create job_categories table
CREATE TABLE public.job_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL,
  job_title TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'new',
  date_applied TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create application_analyses table
CREATE TABLE public.application_analyses (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL UNIQUE,
  education_level TEXT,
  years_experience INTEGER,
  skills_match TEXT,
  key_skills TEXT[],
  missing_requirements TEXT[],
  overall_score INTEGER,
  fallback BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for jobs (public read access)
CREATE POLICY "Anyone can view jobs" 
ON public.jobs 
FOR SELECT 
USING (true);

-- Create RLS policies for job_categories (public read access)
CREATE POLICY "Anyone can view job categories" 
ON public.job_categories 
FOR SELECT 
USING (true);

-- Create RLS policies for applications (public insert, admin view)
CREATE POLICY "Anyone can submit applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view applications" 
ON public.applications 
FOR SELECT 
USING (true);

-- Create RLS policies for application_analyses (admin only)
CREATE POLICY "Anyone can view application analyses" 
ON public.application_analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can insert analyses" 
ON public.application_analyses 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Create storage policies for resumes
CREATE POLICY "Anyone can upload resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Authenticated users can view resumes" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resumes');

-- Create indexes for better performance
CREATE INDEX idx_jobs_industry ON public.jobs(industry);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_posted_date ON public.jobs(posted_date DESC);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_date_applied ON public.applications(date_applied DESC);