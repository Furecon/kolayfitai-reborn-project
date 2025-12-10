/*
  # Add Cascade Delete for User Data

  ## Changes
  This migration adds ON DELETE CASCADE to all foreign key constraints that reference auth.users.id
  or profiles.user_id. When a user is deleted from auth.users, all their data across all tables
  will be automatically deleted.

  ## Affected Tables
  
  ### Direct auth.users.id references:
  1. `meal_logs` - User's meal history
  2. `subscriptions` - User's subscription records
  3. `favorite_meals` - User's favorite meals
  4. `meal_suggestions` - AI-generated meal suggestions
  5. `favorite_products` - User's favorite scanned products
  6. `scanned_products` - Products created by user
  7. `analysis_cache` - Cached food analysis results
  8. `water_intake` - Daily water consumption tracking
  9. `weight_history` - Weight progress tracking
  10. `notification_history` - Notification logs
  11. `diet_profiles` - User's diet preferences
  12. `diet_plans` - Generated diet plans
  
  ### Indirect profiles.user_id references:
  - `custom_recipes` - User's custom recipes
  - `ai_chat_history` - Chat history with AI
  - `daily_goals` - Daily nutritional goals
  
  ## Important Notes
  - profiles.user_id already has CASCADE from auth.users.id, so dropping it first
  - All user data will be permanently deleted when user is deleted
  - This ensures GDPR compliance for user data deletion
  - Backup recommended before deleting users in production
*/

-- First, drop existing foreign key constraints
ALTER TABLE meal_logs 
  DROP CONSTRAINT IF EXISTS meal_logs_user_id_fkey;

ALTER TABLE subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

ALTER TABLE favorite_meals 
  DROP CONSTRAINT IF EXISTS favorite_meals_user_id_fkey;

ALTER TABLE meal_suggestions 
  DROP CONSTRAINT IF EXISTS meal_suggestions_user_id_fkey;

ALTER TABLE favorite_products 
  DROP CONSTRAINT IF EXISTS favorite_products_user_id_fkey;

ALTER TABLE scanned_products 
  DROP CONSTRAINT IF EXISTS scanned_products_created_by_fkey;

ALTER TABLE analysis_cache 
  DROP CONSTRAINT IF EXISTS analysis_cache_user_id_fkey;

ALTER TABLE water_intake 
  DROP CONSTRAINT IF EXISTS water_intake_user_id_fkey;

ALTER TABLE weight_history 
  DROP CONSTRAINT IF EXISTS weight_history_user_id_fkey;

ALTER TABLE notification_history 
  DROP CONSTRAINT IF EXISTS notification_history_user_id_fkey;

ALTER TABLE diet_profiles 
  DROP CONSTRAINT IF EXISTS diet_profiles_user_id_fkey;

ALTER TABLE diet_plans 
  DROP CONSTRAINT IF EXISTS diet_plans_user_id_fkey;

-- Drop profiles constraint to recreate with CASCADE
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Drop constraints for tables referencing profiles.user_id
ALTER TABLE custom_recipes 
  DROP CONSTRAINT IF EXISTS custom_recipes_user_id_fkey;

ALTER TABLE ai_chat_history 
  DROP CONSTRAINT IF EXISTS ai_chat_history_user_id_fkey;

ALTER TABLE daily_goals 
  DROP CONSTRAINT IF EXISTS daily_goals_user_id_fkey;

-- Now add all constraints back WITH CASCADE DELETE

-- Direct auth.users references
ALTER TABLE meal_logs 
  ADD CONSTRAINT meal_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE subscriptions 
  ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE favorite_meals 
  ADD CONSTRAINT favorite_meals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE meal_suggestions 
  ADD CONSTRAINT meal_suggestions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE favorite_products 
  ADD CONSTRAINT favorite_products_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE scanned_products 
  ADD CONSTRAINT scanned_products_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) 
  ON DELETE SET NULL;  -- Keep product but remove creator reference

ALTER TABLE analysis_cache 
  ADD CONSTRAINT analysis_cache_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE water_intake 
  ADD CONSTRAINT water_intake_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE weight_history 
  ADD CONSTRAINT weight_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE notification_history 
  ADD CONSTRAINT notification_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE diet_profiles 
  ADD CONSTRAINT diet_profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE diet_plans 
  ADD CONSTRAINT diet_plans_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Profiles with CASCADE (this will cascade to tables referencing profiles.user_id)
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Tables referencing profiles.user_id (CASCADE from profiles)
ALTER TABLE custom_recipes 
  ADD CONSTRAINT custom_recipes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE ai_chat_history 
  ADD CONSTRAINT ai_chat_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

ALTER TABLE daily_goals 
  ADD CONSTRAINT daily_goals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

-- Create a helpful function for safe user deletion (optional but recommended)
CREATE OR REPLACE FUNCTION delete_user_cascade(target_user_id UUID)
RETURNS TABLE (
  deleted_table TEXT,
  deleted_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log what will be deleted
  RETURN QUERY
  SELECT 'meal_logs'::TEXT, COUNT(*)::BIGINT FROM meal_logs WHERE user_id = target_user_id
  UNION ALL
  SELECT 'subscriptions'::TEXT, COUNT(*)::BIGINT FROM subscriptions WHERE user_id = target_user_id
  UNION ALL
  SELECT 'favorite_meals'::TEXT, COUNT(*)::BIGINT FROM favorite_meals WHERE user_id = target_user_id
  UNION ALL
  SELECT 'meal_suggestions'::TEXT, COUNT(*)::BIGINT FROM meal_suggestions WHERE user_id = target_user_id
  UNION ALL
  SELECT 'favorite_products'::TEXT, COUNT(*)::BIGINT FROM favorite_products WHERE user_id = target_user_id
  UNION ALL
  SELECT 'analysis_cache'::TEXT, COUNT(*)::BIGINT FROM analysis_cache WHERE user_id = target_user_id
  UNION ALL
  SELECT 'water_intake'::TEXT, COUNT(*)::BIGINT FROM water_intake WHERE user_id = target_user_id
  UNION ALL
  SELECT 'weight_history'::TEXT, COUNT(*)::BIGINT FROM weight_history WHERE user_id = target_user_id
  UNION ALL
  SELECT 'notification_history'::TEXT, COUNT(*)::BIGINT FROM notification_history WHERE user_id = target_user_id
  UNION ALL
  SELECT 'diet_profiles'::TEXT, COUNT(*)::BIGINT FROM diet_profiles WHERE user_id = target_user_id
  UNION ALL
  SELECT 'diet_plans'::TEXT, COUNT(*)::BIGINT FROM diet_plans WHERE user_id = target_user_id
  UNION ALL
  SELECT 'profiles'::TEXT, COUNT(*)::BIGINT FROM profiles WHERE user_id = target_user_id
  UNION ALL
  SELECT 'custom_recipes'::TEXT, COUNT(*)::BIGINT FROM custom_recipes WHERE user_id IN (SELECT user_id FROM profiles WHERE user_id = target_user_id)
  UNION ALL
  SELECT 'ai_chat_history'::TEXT, COUNT(*)::BIGINT FROM ai_chat_history WHERE user_id IN (SELECT user_id FROM profiles WHERE user_id = target_user_id)
  UNION ALL
  SELECT 'daily_goals'::TEXT, COUNT(*)::BIGINT FROM daily_goals WHERE user_id IN (SELECT user_id FROM profiles WHERE user_id = target_user_id);
END;
$$;

-- Grant execute permission to authenticated users (for viewing their own data before deletion)
GRANT EXECUTE ON FUNCTION delete_user_cascade TO authenticated;
