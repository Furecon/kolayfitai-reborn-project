/*
  # Add Store Rating Tracking Fields

  1. Changes to profiles table
    - Add last_rating_prompt_date (timestamp) - Tracks when user was last prompted for rating
    - Add rating_prompt_dismissed (boolean) - Tracks if user permanently dismissed rating prompt

  2. Purpose
    - Enable smart timing for store rating prompts
    - Prevent over-prompting users
    - Track user feedback engagement
*/

-- Add last_rating_prompt_date column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_rating_prompt_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_rating_prompt_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add rating_prompt_dismissed column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'rating_prompt_dismissed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rating_prompt_dismissed BOOLEAN DEFAULT false;
  END IF;
END $$;
