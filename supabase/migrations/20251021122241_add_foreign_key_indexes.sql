/*
  # Add Foreign Key Indexes for Performance

  This migration adds indexes to foreign key columns that were missing them.
  These indexes significantly improve query performance for joins and foreign key lookups.

  ## Changes
  
  1. **ai_analysis table**
     - Add index on `meal_log_id` foreign key
  
  2. **ai_chat_history table**
     - Add index on `user_id` foreign key
  
  3. **custom_recipes table**
     - Add index on `user_id` foreign key
  
  4. **favorite_meals table**
     - Add index on `user_id` foreign key
  
  5. **meal_logs table**
     - Add index on `user_id` foreign key
  
  6. **meal_suggestions table**
     - Add index on `user_id` foreign key
  
  7. **scanned_products table**
     - Add index on `created_by` foreign key
  
  8. **subscriptions table**
     - Add index on `user_id` foreign key

  ## Performance Impact
  - Improves JOIN performance
  - Speeds up foreign key constraint checks
  - Optimizes queries filtering by user_id or foreign keys
*/

-- Add index for ai_analysis.meal_log_id
CREATE INDEX IF NOT EXISTS idx_ai_analysis_meal_log_id 
ON public.ai_analysis(meal_log_id);

-- Add index for ai_chat_history.user_id
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id 
ON public.ai_chat_history(user_id);

-- Add index for custom_recipes.user_id
CREATE INDEX IF NOT EXISTS idx_custom_recipes_user_id 
ON public.custom_recipes(user_id);

-- Add index for favorite_meals.user_id
CREATE INDEX IF NOT EXISTS idx_favorite_meals_user_id 
ON public.favorite_meals(user_id);

-- Add index for meal_logs.user_id
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_id 
ON public.meal_logs(user_id);

-- Add index for meal_suggestions.user_id
CREATE INDEX IF NOT EXISTS idx_meal_suggestions_user_id 
ON public.meal_suggestions(user_id);

-- Add index for scanned_products.created_by
CREATE INDEX IF NOT EXISTS idx_scanned_products_created_by 
ON public.scanned_products(created_by);

-- Add index for subscriptions.user_id
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON public.subscriptions(user_id);