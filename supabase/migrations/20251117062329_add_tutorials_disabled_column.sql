/*
  # Add tutorials_disabled column to profiles table

  1. Changes
    - Add `tutorials_disabled` boolean column to profiles table
    - Set default value to false
    - This allows users to permanently disable tutorial hints

  2. Notes
    - Users who check "Don't show again" will have this field set to true
    - This prevents all future tutorial auto-displays
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tutorials_disabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tutorials_disabled boolean DEFAULT false;
  END IF;
END $$;