
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
