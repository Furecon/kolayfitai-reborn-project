/*
  # Add Meal Replacement Ad Tracking

  1. Changes
    - Add `meal_replacements_since_last_ad` column to user_preferences table
    - This tracks how many meal replacements the user has made since their last ad view
    - Free users will need to watch an ad every 2 meal replacements

  2. Notes
    - Default value is 0
    - Column will be reset to 0 after ad is watched
    - Counter increments after each successful meal replacement
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'meal_replacements_since_last_ad'
  ) THEN
    ALTER TABLE user_preferences 
    ADD COLUMN meal_replacements_since_last_ad integer DEFAULT 0 NOT NULL;
  END IF;
END $$;