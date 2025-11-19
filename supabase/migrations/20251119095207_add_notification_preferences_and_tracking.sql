/*
  # Enhanced Notification Preferences and Tracking

  1. Updates to user_preferences table
    - Add `quiet_hours_start` (text) - Start time for quiet hours (default: "22:00")
    - Add `quiet_hours_end` (text) - End time for quiet hours (default: "07:00")
    - Add `primary_meal_reminder` (text) - Which meal to remind (breakfast, lunch, dinner, or null for none)
    - Add `weekend_notifications_enabled` (boolean) - Enable notifications on weekends
    - Add `notification_interaction_count` (jsonb) - Track user interactions per notification type
    - Add `last_notification_sent` (jsonb) - Track last sent time per notification type
    - Update default notification_settings to minimal strategy

  2. New table: notification_history
    - Track all sent notifications
    - Monitor user interaction rates
    - Enable smart notification optimization

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users only
*/

-- Update user_preferences table with new columns
DO $$ 
BEGIN
  -- Add quiet hours
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'quiet_hours_start'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN quiet_hours_start TEXT DEFAULT '22:00';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'quiet_hours_end'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN quiet_hours_end TEXT DEFAULT '07:00';
  END IF;

  -- Add primary meal reminder
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'primary_meal_reminder'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN primary_meal_reminder TEXT DEFAULT 'lunch';
  END IF;

  -- Add weekend notifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'weekend_notifications_enabled'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN weekend_notifications_enabled BOOLEAN DEFAULT true;
  END IF;

  -- Add interaction tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'notification_interaction_count'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN notification_interaction_count JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add last notification sent tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'last_notification_sent'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN last_notification_sent JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Update default notification settings to minimal strategy
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'notification_settings'
  ) THEN
    ALTER TABLE public.user_preferences 
    ALTER COLUMN notification_settings SET DEFAULT '{"meal_reminders": true, "water_reminders": true, "goal_notifications": true, "weekly_summary": true}'::jsonb;
  END IF;
END $$;

-- Create notification_history table
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  interacted_at TIMESTAMP WITH TIME ZONE,
  interaction_type TEXT,
  was_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id 
ON public.notification_history(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at 
ON public.notification_history(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_history_type 
ON public.notification_history(notification_type);

-- Enable RLS
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_history
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_history' 
    AND policyname = 'Users can view their own notification history'
  ) THEN
    CREATE POLICY "Users can view their own notification history"
    ON public.notification_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_history' 
    AND policyname = 'Users can insert their own notification history'
  ) THEN
    CREATE POLICY "Users can insert their own notification history"
    ON public.notification_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_history' 
    AND policyname = 'Users can update their own notification history'
  ) THEN
    CREATE POLICY "Users can update their own notification history"
    ON public.notification_history
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add constraint for primary_meal_reminder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_preferences_primary_meal_reminder_check'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD CONSTRAINT user_preferences_primary_meal_reminder_check 
    CHECK (primary_meal_reminder IN ('breakfast', 'lunch', 'dinner', 'none'));
  END IF;
END $$;

-- Add constraint for notification_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notification_history_type_check'
  ) THEN
    ALTER TABLE public.notification_history 
    ADD CONSTRAINT notification_history_type_check 
    CHECK (notification_type IN ('meal_reminder', 'water_reminder', 'goal_notification', 'weekly_summary', 'motivation'));
  END IF;
END $$;