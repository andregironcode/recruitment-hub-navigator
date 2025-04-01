
-- Create application_analyses table to store AI screening results
CREATE TABLE IF NOT EXISTS public.application_analyses (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  education_level TEXT,
  years_experience TEXT,
  skills_match TEXT,
  key_skills TEXT[],
  missing_requirements TEXT[],
  overall_score INTEGER,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(application_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_application_analyses_job_id ON public.application_analyses(job_id);
CREATE INDEX IF NOT EXISTS idx_application_analyses_application_id ON public.application_analyses(application_id);
