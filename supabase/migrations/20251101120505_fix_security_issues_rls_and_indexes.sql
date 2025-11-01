/*
  # Fix Security Issues: RLS Performance and Unused Indexes

  ## RLS Performance Optimization
  
  Optimizes Row Level Security policies on the favorite_meals table by wrapping
  auth.uid() calls in SELECT statements. This prevents re-evaluation of auth 
  functions for each row, significantly improving query performance at scale.
  
  **Tables Modified:**
  - `favorite_meals` - Optimized all RLS policies

  ## Unused Index Cleanup
  
  Removes database indexes that are not being used. Unused indexes consume storage
  and slow down write operations without providing any query performance benefits.
  
  **Indexes Removed:**
  - idx_ai_analysis_meal_log_id
  - idx_ai_chat_history_user_id
  - idx_custom_recipes_user_id
  - idx_favorite_meals_user_id
  - idx_meal_suggestions_user_id
  - idx_scanned_products_created_by
  - idx_subscriptions_user_id
  - idx_foods_category
  - idx_foods_name_trgm
  - idx_foods_name_en_trgm
  - idx_analysis_cache_user_hash
  - idx_analysis_cache_expires

  ## Function Search Path Fix
  
  Sets explicit search_path for database functions to prevent security issues
  from role-mutable search paths.
  
  **Functions Fixed:**
  - update_updated_at_column
  - calculate_bmr
  - get_or_create_daily_goals

  ## Security Impact
  - Improved RLS query performance
  - Reduced storage and write overhead
  - Enhanced function security
*/

-- ============================================================================
-- PART 1: Fix RLS Policies for favorite_meals
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorite meals" ON public.favorite_meals;
DROP POLICY IF EXISTS "Users can create their own favorite meals" ON public.favorite_meals;
DROP POLICY IF EXISTS "Users can update their own favorite meals" ON public.favorite_meals;
DROP POLICY IF EXISTS "Users can delete their own favorite meals" ON public.favorite_meals;

-- Recreate policies with optimized auth.uid() calls wrapped in SELECT
CREATE POLICY "Users can view their own favorite meals"
ON public.favorite_meals FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own favorite meals"
ON public.favorite_meals FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own favorite meals"
ON public.favorite_meals FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own favorite meals"
ON public.favorite_meals FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 2: Remove Unused Indexes
-- ============================================================================

-- Drop unused indexes if they exist
DROP INDEX IF EXISTS public.idx_ai_analysis_meal_log_id;
DROP INDEX IF EXISTS public.idx_ai_chat_history_user_id;
DROP INDEX IF EXISTS public.idx_custom_recipes_user_id;
DROP INDEX IF EXISTS public.idx_favorite_meals_user_id;
DROP INDEX IF EXISTS public.idx_meal_suggestions_user_id;
DROP INDEX IF EXISTS public.idx_scanned_products_created_by;
DROP INDEX IF EXISTS public.idx_subscriptions_user_id;
DROP INDEX IF EXISTS public.idx_foods_category;
DROP INDEX IF EXISTS public.idx_foods_name_trgm;
DROP INDEX IF EXISTS public.idx_foods_name_en_trgm;
DROP INDEX IF EXISTS public.idx_analysis_cache_user_hash;
DROP INDEX IF EXISTS public.idx_analysis_cache_expires;

-- ============================================================================
-- PART 3: Fix Function Search Paths
-- ============================================================================

-- Fix update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix calculate_bmr function
DROP FUNCTION IF EXISTS public.calculate_bmr(numeric, numeric, integer, text) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_bmr(
  weight_kg numeric,
  height_cm numeric,
  age integer,
  gender text
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  bmr numeric;
BEGIN
  IF gender = 'male' THEN
    bmr := 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  ELSE
    bmr := 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  END IF;
  
  RETURN ROUND(bmr, 2);
END;
$$;

-- Fix get_or_create_daily_goals function
DROP FUNCTION IF EXISTS public.get_or_create_daily_goals(uuid, date) CASCADE;
CREATE OR REPLACE FUNCTION public.get_or_create_daily_goals(
  p_user_id uuid,
  p_date date
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  date date,
  calorie_goal integer,
  protein_goal integer,
  carbs_goal integer,
  fat_goal integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_goals RECORD;
  v_profile RECORD;
BEGIN
  SELECT * INTO v_goals
  FROM daily_goals dg
  WHERE dg.user_id = p_user_id AND dg.date = p_date;
  
  IF NOT FOUND THEN
    SELECT * INTO v_profile
    FROM profiles p
    WHERE p.user_id = p_user_id;
    
    INSERT INTO daily_goals (user_id, date, calorie_goal, protein_goal, carbs_goal, fat_goal)
    VALUES (
      p_user_id,
      p_date,
      v_profile.daily_calorie_goal,
      v_profile.daily_protein_goal,
      v_profile.daily_carbs_goal,
      v_profile.daily_fat_goal
    )
    RETURNING * INTO v_goals;
  END IF;
  
  RETURN QUERY
  SELECT v_goals.id, v_goals.user_id, v_goals.date, 
         v_goals.calorie_goal, v_goals.protein_goal, 
         v_goals.carbs_goal, v_goals.fat_goal;
END;
$$;

-- Recreate triggers for update_updated_at_column if they were dropped
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'profiles', 'meal_logs', 'meal_items', 'custom_recipes', 
      'favorite_meals', 'meal_suggestions', 'ai_chat_history',
      'scanned_products', 'subscriptions', 'daily_goals'
    )
  LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', r.tablename, r.tablename);
      EXECUTE format(
        'CREATE TRIGGER update_%I_updated_at 
         BEFORE UPDATE ON public.%I 
         FOR EACH ROW 
         EXECUTE FUNCTION update_updated_at_column()',
        r.tablename, r.tablename
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create trigger for table %: %', r.tablename, SQLERRM;
    END;
  END LOOP;
END $$;
