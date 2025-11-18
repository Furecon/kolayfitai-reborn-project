/*
  # Remove Tutorial System

  1. Changes
    - Remove `tutorials_completed` column from profiles table
    - Remove `tutorial_seen` column from profiles table
    - Remove `tutorials_disabled` column from profiles table
  
  2. Notes
    - Tutorial system has been removed from the application
    - These columns are no longer needed
*/

-- Remove tutorial-related columns
ALTER TABLE profiles DROP COLUMN IF EXISTS tutorials_completed;
ALTER TABLE profiles DROP COLUMN IF EXISTS tutorial_seen;
ALTER TABLE profiles DROP COLUMN IF EXISTS tutorials_disabled;
