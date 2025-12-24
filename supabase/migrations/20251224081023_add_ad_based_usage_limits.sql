/*
  # Ad-Based Usage Limits System
  
  ## Overview
  Implements ad-rewarded usage system for FREE users.
  
  ## New Tables
  
  ### `daily_usage_limits`
  Tracks daily ad-based usage limits
  - `user_id` (uuid, unique per date) - References auth.users
  - `date` (date) - The tracking date
  - `photo_analysis_ads_watched` (int) - Ads watched for photo analysis (max 3/day)
  - `detailed_analysis_ads_watched` (int) - Ads watched for detailed analysis (unlimited)
  - `created_at`, `updated_at` (timestamptz)
  
  ### `weekly_usage_limits`
  Tracks weekly ad-based usage limits
  - `user_id` (uuid) - References auth.users
  - `week_start_date` (date) - Monday of the week
  - `diet_plan_ads_watched` (int) - Ads watched for diet plan (max 1/week)
  - `created_at`, `updated_at` (timestamptz)
  
  ### `ad_watch_history`
  Complete audit trail of all ad views
  - `user_id` (uuid) - References auth.users
  - `ad_type` (text) - Type: photo_analysis, detailed_analysis, diet_plan
  - `feature_unlocked` (text) - What feature was unlocked
  - `ad_network` (text) - Which ad network was used
  - `ad_placement_id` (text) - Ad placement identifier
  - `ad_duration_seconds` (int) - How long the ad ran
  - `completed` (boolean) - Whether user watched the full ad
  - `reward_granted` (boolean) - Whether the reward was granted
  - `watched_at` (timestamptz) - When the ad was watched
  
  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Premium users bypass these limits (checked in app logic)
  
  ## Notes
  - Premium status checked via profiles.subscription_status = 'premium'
  - FREE users: subscription_status IN ('trial', 'expired', 'cancelled')
  - Daily limits reset at midnight (handled by cron job)
  - Weekly limits reset on Monday (handled by cron job)
*/

-- =====================================================
-- TABLE: daily_usage_limits
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Photo analysis: max 3 ads per day
  photo_analysis_ads_watched INT NOT NULL DEFAULT 0,
  
  -- Detailed analysis: unlimited ads
  detailed_analysis_ads_watched INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date),
  CHECK (photo_analysis_ads_watched >= 0 AND photo_analysis_ads_watched <= 3),
  CHECK (detailed_analysis_ads_watched >= 0)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_usage_limits_user_date 
  ON daily_usage_limits(user_id, date DESC);

-- =====================================================
-- TABLE: weekly_usage_limits
-- =====================================================
CREATE TABLE IF NOT EXISTS weekly_usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Always Monday
  
  -- Diet plan: max 1 ad per week
  diet_plan_ads_watched INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, week_start_date),
  CHECK (diet_plan_ads_watched >= 0 AND diet_plan_ads_watched <= 1)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_weekly_usage_limits_user_week 
  ON weekly_usage_limits(user_id, week_start_date DESC);

-- =====================================================
-- TABLE: ad_watch_history
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Ad type: what kind of ad was shown
  ad_type TEXT NOT NULL CHECK (ad_type IN ('photo_analysis', 'detailed_analysis', 'diet_plan')),
  
  -- Feature unlocked after watching
  feature_unlocked TEXT NOT NULL,
  
  -- Ad network details (for analytics)
  ad_network TEXT, -- e.g., 'admob', 'unity', etc.
  ad_placement_id TEXT,
  ad_duration_seconds INT,
  
  -- Completion tracking
  completed BOOLEAN NOT NULL DEFAULT false,
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  
  -- Error tracking
  error_message TEXT,
  
  watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CHECK (ad_duration_seconds IS NULL OR ad_duration_seconds > 0)
);

-- Indexes for analytics and lookups
CREATE INDEX IF NOT EXISTS idx_ad_watch_history_user_type 
  ON ad_watch_history(user_id, ad_type, watched_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_ad_watch_history_completed 
  ON ad_watch_history(completed, reward_granted, watched_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE daily_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_watch_history ENABLE ROW LEVEL SECURITY;

-- daily_usage_limits policies
CREATE POLICY "Users can view own daily limits"
  ON daily_usage_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily limits"
  ON daily_usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily limits"
  ON daily_usage_limits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- weekly_usage_limits policies
CREATE POLICY "Users can view own weekly limits"
  ON weekly_usage_limits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly limits"
  ON weekly_usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly limits"
  ON weekly_usage_limits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ad_watch_history policies (read-only for users, insert via backend)
CREATE POLICY "Users can view own ad history"
  ON ad_watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad history"
  ON ad_watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get or create daily usage record
CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id UUID, p_date DATE)
RETURNS daily_usage_limits
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record daily_usage_limits;
BEGIN
  -- Try to get existing record
  SELECT * INTO v_record
  FROM daily_usage_limits
  WHERE user_id = p_user_id AND date = p_date;
  
  -- If not found, create new one
  IF NOT FOUND THEN
    INSERT INTO daily_usage_limits (user_id, date)
    VALUES (p_user_id, p_date)
    RETURNING * INTO v_record;
  END IF;
  
  RETURN v_record;
END;
$$;

-- Function to get or create weekly usage record
CREATE OR REPLACE FUNCTION get_or_create_weekly_usage(p_user_id UUID, p_week_start DATE)
RETURNS weekly_usage_limits
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record weekly_usage_limits;
BEGIN
  -- Try to get existing record
  SELECT * INTO v_record
  FROM weekly_usage_limits
  WHERE user_id = p_user_id AND week_start_date = p_week_start;
  
  -- If not found, create new one
  IF NOT FOUND THEN
    INSERT INTO weekly_usage_limits (user_id, week_start_date)
    VALUES (p_user_id, p_week_start)
    RETURNING * INTO v_record;
  END IF;
  
  RETURN v_record;
END;
$$;

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT subscription_status INTO v_status
  FROM profiles
  WHERE user_id = p_user_id;
  
  RETURN v_status = 'premium';
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_daily_usage_limits_updated_at ON daily_usage_limits;
CREATE TRIGGER update_daily_usage_limits_updated_at
  BEFORE UPDATE ON daily_usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_usage_limits_updated_at ON weekly_usage_limits;
CREATE TRIGGER update_weekly_usage_limits_updated_at
  BEFORE UPDATE ON weekly_usage_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
