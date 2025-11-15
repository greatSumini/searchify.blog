-- Migration: Allow multiple style guides per user
-- Remove UNIQUE constraint on profile_id to allow users to create multiple style guides

BEGIN;

-- Drop UNIQUE constraint on style_guides.profile_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'style_guides_profile_id_key'
  ) THEN
    ALTER TABLE public.style_guides DROP CONSTRAINT style_guides_profile_id_key;
  END IF;
END$$;

COMMIT;
