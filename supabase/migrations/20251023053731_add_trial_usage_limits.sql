/*
  # Add Trial Usage Limits

  1. Changes
    - Add trial_photo_analysis_count to profiles (tracks used photo analyses)
    - Add trial_photo_analysis_limit to profiles (default 10)
    - Add trial_meal_suggestion_count to profiles (tracks used meal suggestions)
    - Add trial_meal_suggestion_limit to profiles (default 10)
  
  2. Security
    - RLS policies remain unchanged
    - Users can only update their own usage counts
*/

DO $$
BEGIN
  -- Add trial photo analysis tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_photo_analysis_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_photo_analysis_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_photo_analysis_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_photo_analysis_limit INTEGER DEFAULT 10;
  END IF;

  -- Add trial meal suggestion tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_meal_suggestion_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_meal_suggestion_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_meal_suggestion_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_meal_suggestion_limit INTEGER DEFAULT 10;
  END IF;
END $$;