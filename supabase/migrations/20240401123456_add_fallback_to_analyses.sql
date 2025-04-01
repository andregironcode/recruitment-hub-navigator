
-- Add the fallback column to application_analyses if it doesn't exist
ALTER TABLE public.application_analyses ADD COLUMN IF NOT EXISTS fallback BOOLEAN DEFAULT FALSE;

-- Recreate the publication to include the fallback column
BEGIN;
  -- Check if the publication exists
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      -- Update the publication
      ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.application_analyses;
      ALTER PUBLICATION supabase_realtime ADD TABLE public.application_analyses;
    END IF;
  END
  $$;
COMMIT;

-- Add storage bucket policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'resumes'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (
      'resumes',
      'Resumes Storage',
      false,
      false,
      10485760, -- 10MB
      '{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document}'
    );
  END IF;
END
$$;

-- Create storage policy to allow authenticated users to upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Anyone can upload resumes' AND bucket_id = 'resumes'
  ) THEN
    CREATE POLICY "Anyone can upload resumes"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'resumes');
  END IF;
END
$$;

-- Create storage policy to allow authenticated users to read their own resumes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Anyone can read resumes' AND bucket_id = 'resumes'
  ) THEN
    CREATE POLICY "Anyone can read resumes"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'resumes');
  END IF;
END
$$;
