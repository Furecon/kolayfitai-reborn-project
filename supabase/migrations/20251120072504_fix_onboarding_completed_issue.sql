/*
  # Fix Onboarding Completed Issue

  1. Ensure onboarding_completed column exists and has proper default
  2. Fix any existing profiles that might have NULL values
  3. Add indexes for better query performance

  This migration addresses the issue where users get stuck in an onboarding loop
  by ensuring the onboarding_completed column is properly set.
*/

-- Ensure onboarding_completed column exists with proper default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update any NULL values to false for safety
UPDATE public.profiles 
SET onboarding_completed = false 
WHERE onboarding_completed IS NULL;

-- Ensure the column is NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN onboarding_completed SET NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN onboarding_completed SET DEFAULT false;

-- Add index for faster queries on onboarding_completed
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON public.profiles(user_id, onboarding_completed);

-- Add index for user_id alone if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles(user_id);

-- Verify data integrity: Log any profiles with missing required fields
-- This is just for monitoring, not enforcing
DO $$
DECLARE
  incomplete_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO incomplete_count
  FROM public.profiles
  WHERE onboarding_completed = true 
    AND (age IS NULL OR gender IS NULL OR height IS NULL OR weight IS NULL OR activity_level IS NULL);
  
  IF incomplete_count > 0 THEN
    RAISE NOTICE 'Found % profiles marked as completed but missing required fields', incomplete_count;
  END IF;
END $$;