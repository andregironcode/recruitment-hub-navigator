
-- Add the fallback column to application_analyses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'application_analyses' 
        AND column_name = 'fallback'
    ) THEN
        ALTER TABLE public.application_analyses ADD COLUMN fallback BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
