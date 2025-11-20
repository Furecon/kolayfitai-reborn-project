/*
  # Add Flexible Notification Preferences

  1. Updates to user_preferences table
    - Add `meal_reminders_enabled` (jsonb) - Individual meal reminder toggles
    - Add `water_reminder_times` (jsonb array) - Multiple water reminder times
    - Add `water_reminder_interval` (integer) - Interval in hours for automatic water reminders

  2. Changes
    - Remove the single primary_meal_reminder column (replaced by meal_reminders_enabled)
    - Keep backward compatibility where possible
*/

-- Add new flexible notification columns
DO $$ 
BEGIN
  -- Add meal_reminders_enabled for individual meal control
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'meal_reminders_enabled'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN meal_reminders_enabled JSONB DEFAULT '{"breakfast": true, "lunch": true, "dinner": true}'::jsonb;
  END IF;

  -- Add water_reminder_times for multiple water reminders
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'water_reminder_times'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN water_reminder_times JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add water_reminder_interval for interval-based reminders
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'water_reminder_interval'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN water_reminder_interval INTEGER DEFAULT 0;
  END IF;
END $$;

-- Migrate existing primary_meal_reminder data to new structure
UPDATE public.user_preferences
SET meal_reminders_enabled = 
  CASE 
    WHEN primary_meal_reminder = 'breakfast' THEN '{"breakfast": true, "lunch": false, "dinner": false}'::jsonb
    WHEN primary_meal_reminder = 'lunch' THEN '{"breakfast": false, "lunch": true, "dinner": false}'::jsonb
    WHEN primary_meal_reminder = 'dinner' THEN '{"breakfast": false, "lunch": false, "dinner": true}'::jsonb
    WHEN primary_meal_reminder = 'none' THEN '{"breakfast": false, "lunch": false, "dinner": false}'::jsonb
    ELSE '{"breakfast": true, "lunch": true, "dinner": true}'::jsonb
  END
WHERE meal_reminders_enabled = '{"breakfast": true, "lunch": true, "dinner": true}'::jsonb
  AND primary_meal_reminder IS NOT NULL;

-- Set default water reminder time if water_time exists
UPDATE public.user_preferences
SET water_reminder_times = jsonb_build_array(
  jsonb_build_object('time', COALESCE((reminder_times->>'water_time'), '14:30'))
)
WHERE water_reminder_times = '[]'::jsonb
  AND reminder_times ? 'water_time';