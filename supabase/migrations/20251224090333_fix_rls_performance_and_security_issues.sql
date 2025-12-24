/*
  # Fix RLS Performance and Security Issues

  ## Changes

  1. **RLS Performance Optimization**
     - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
     - This prevents function re-evaluation for each row, improving query performance at scale
     - Affected tables:
       - notification_history (3 policies)
       - daily_usage_limits (3 policies)
       - weekly_usage_limits (3 policies)
       - ad_watch_history (2 policies)
       - diet_profiles (4 policies)
       - diet_plans (4 policies)
       - weight_history (4 policies)
       - water_intake (4 policies)

  2. **Unused Index Cleanup**
     - Drop unused indexes to reduce storage overhead and improve write performance
     - Indexes removed:
       - idx_ai_analysis_meal_log_id
       - idx_favorite_meals_user_id
       - idx_subscriptions_user_id
       - idx_notification_history_sent_at
       - idx_profiles_onboarding_completed
       - idx_daily_usage_limits_user_date
       - idx_weekly_usage_limits_user_week
       - idx_ad_watch_history_user_type
       - idx_ad_watch_history_completed

  3. **Function Security Fixes**
     - Fix search_path for all functions to prevent search_path hijacking
     - Set explicit search_path to 'public, pg_temp' for security
     - Affected functions:
       - update_water_intake_updated_at
       - update_diet_profile_updated_at
       - deactivate_old_diet_plans
       - get_or_create_daily_usage
       - get_or_create_weekly_usage
       - is_user_premium
       - update_updated_at_column
       - delete_user_cascade

  ## Notes
  - All changes are backward compatible
  - No data loss or schema changes
  - Policies maintain the same security guarantees with better performance
*/

-- =====================================================
-- 1. FIX RLS POLICIES FOR PERFORMANCE
-- =====================================================

-- notification_history policies
DROP POLICY IF EXISTS "Users can view their own notification history" ON notification_history;
CREATE POLICY "Users can view their own notification history"
  ON notification_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own notification history" ON notification_history;
CREATE POLICY "Users can insert their own notification history"
  ON notification_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own notification history" ON notification_history;
CREATE POLICY "Users can update their own notification history"
  ON notification_history FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- daily_usage_limits policies
DROP POLICY IF EXISTS "Users can view own daily limits" ON daily_usage_limits;
CREATE POLICY "Users can view own daily limits"
  ON daily_usage_limits FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own daily limits" ON daily_usage_limits;
CREATE POLICY "Users can insert own daily limits"
  ON daily_usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own daily limits" ON daily_usage_limits;
CREATE POLICY "Users can update own daily limits"
  ON daily_usage_limits FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- weekly_usage_limits policies
DROP POLICY IF EXISTS "Users can view own weekly limits" ON weekly_usage_limits;
CREATE POLICY "Users can view own weekly limits"
  ON weekly_usage_limits FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own weekly limits" ON weekly_usage_limits;
CREATE POLICY "Users can insert own weekly limits"
  ON weekly_usage_limits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own weekly limits" ON weekly_usage_limits;
CREATE POLICY "Users can update own weekly limits"
  ON weekly_usage_limits FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ad_watch_history policies
DROP POLICY IF EXISTS "Users can view own ad history" ON ad_watch_history;
CREATE POLICY "Users can view own ad history"
  ON ad_watch_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own ad history" ON ad_watch_history;
CREATE POLICY "Users can insert own ad history"
  ON ad_watch_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- diet_profiles policies
DROP POLICY IF EXISTS "Users can view own diet profile" ON diet_profiles;
CREATE POLICY "Users can view own diet profile"
  ON diet_profiles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own diet profile" ON diet_profiles;
CREATE POLICY "Users can insert own diet profile"
  ON diet_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own diet profile" ON diet_profiles;
CREATE POLICY "Users can update own diet profile"
  ON diet_profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own diet profile" ON diet_profiles;
CREATE POLICY "Users can delete own diet profile"
  ON diet_profiles FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- diet_plans policies
DROP POLICY IF EXISTS "Users can view own diet plans" ON diet_plans;
CREATE POLICY "Users can view own diet plans"
  ON diet_plans FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own diet plans" ON diet_plans;
CREATE POLICY "Users can insert own diet plans"
  ON diet_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own diet plans" ON diet_plans;
CREATE POLICY "Users can update own diet plans"
  ON diet_plans FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own diet plans" ON diet_plans;
CREATE POLICY "Users can delete own diet plans"
  ON diet_plans FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- weight_history policies
DROP POLICY IF EXISTS "Users can view own weight history" ON weight_history;
CREATE POLICY "Users can view own weight history"
  ON weight_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own weight history" ON weight_history;
CREATE POLICY "Users can insert own weight history"
  ON weight_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own weight history" ON weight_history;
CREATE POLICY "Users can update own weight history"
  ON weight_history FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own weight history" ON weight_history;
CREATE POLICY "Users can delete own weight history"
  ON weight_history FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- water_intake policies
DROP POLICY IF EXISTS "Users can view own water intake" ON water_intake;
CREATE POLICY "Users can view own water intake"
  ON water_intake FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own water intake" ON water_intake;
CREATE POLICY "Users can insert own water intake"
  ON water_intake FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own water intake" ON water_intake;
CREATE POLICY "Users can update own water intake"
  ON water_intake FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own water intake" ON water_intake;
CREATE POLICY "Users can delete own water intake"
  ON water_intake FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 2. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_ai_analysis_meal_log_id;
DROP INDEX IF EXISTS idx_favorite_meals_user_id;
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_notification_history_sent_at;
DROP INDEX IF EXISTS idx_profiles_onboarding_completed;
DROP INDEX IF EXISTS idx_daily_usage_limits_user_date;
DROP INDEX IF EXISTS idx_weekly_usage_limits_user_week;
DROP INDEX IF EXISTS idx_ad_watch_history_user_type;
DROP INDEX IF EXISTS idx_ad_watch_history_completed;

-- =====================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix update_water_intake_updated_at
CREATE OR REPLACE FUNCTION update_water_intake_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_diet_profile_updated_at
CREATE OR REPLACE FUNCTION update_diet_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix deactivate_old_diet_plans
CREATE OR REPLACE FUNCTION deactivate_old_diet_plans()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE diet_plans
  SET is_active = false
  WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_active = true;
  RETURN NEW;
END;
$$;

-- Fix get_or_create_daily_usage
CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id uuid)
RETURNS daily_usage_limits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result daily_usage_limits;
BEGIN
  SELECT * INTO v_result
  FROM daily_usage_limits
  WHERE user_id = p_user_id
    AND usage_date = CURRENT_DATE;

  IF NOT FOUND THEN
    INSERT INTO daily_usage_limits (user_id, usage_date, analyses_used, daily_limit)
    VALUES (p_user_id, CURRENT_DATE, 0, 3)
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- Fix get_or_create_weekly_usage
CREATE OR REPLACE FUNCTION get_or_create_weekly_usage(p_user_id uuid)
RETURNS weekly_usage_limits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result weekly_usage_limits;
  v_week_start date;
BEGIN
  v_week_start := date_trunc('week', CURRENT_DATE)::date;

  SELECT * INTO v_result
  FROM weekly_usage_limits
  WHERE user_id = p_user_id
    AND week_start = v_week_start;

  IF NOT FOUND THEN
    INSERT INTO weekly_usage_limits (user_id, week_start, analyses_used, weekly_limit)
    VALUES (p_user_id, v_week_start, 0, 10)
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

-- Fix is_user_premium
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_premium boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_is_premium;

  RETURN COALESCE(v_is_premium, false);
END;
$$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix delete_user_cascade
CREATE OR REPLACE FUNCTION delete_user_cascade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- All cascade deletes are handled by foreign key constraints
  -- This function is kept for potential future custom logic
  RETURN OLD;
END;
$$;
