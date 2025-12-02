/*
  # Add unique constraint to user_preferences

  1. Changes
    - Add UNIQUE constraint on user_id column
    - This ensures one row per user and makes upsert work correctly
  
  2. Why
    - Without unique constraint, upsert() creates duplicate rows
    - This fixes the notification settings save issue
*/

-- Add unique constraint on user_id
ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);
