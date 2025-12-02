/*
  # Add notification alert style column

  1. Changes
    - Add `notification_alert_style` column to `user_preferences` table
    - Type: text with check constraint (sound, vibrate, both)
    - Default: 'both'

  2. Purpose
    - Allow users to customize how they want to be alerted (sound only, vibrate only, or both)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'notification_alert_style'
  ) THEN
    ALTER TABLE user_preferences 
    ADD COLUMN notification_alert_style TEXT DEFAULT 'both' CHECK (notification_alert_style IN ('sound', 'vibrate', 'both'));
  END IF;
END $$;