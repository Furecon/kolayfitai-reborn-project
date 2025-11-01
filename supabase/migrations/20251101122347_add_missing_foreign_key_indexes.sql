/*
  # Add Missing Foreign Key Indexes

  ## Overview
  
  Adds covering indexes for all foreign key constraints that are currently unindexed.
  Foreign keys without indexes can cause significant performance degradation on JOIN
  operations and cascading deletes/updates.

  ## Performance Impact
  
  - Faster JOIN operations on foreign key columns
  - Improved query performance for filtering by foreign keys
  - More efficient cascading operations
  - Better query planner optimization

  ## Indexes Added
  
  **ai_analysis table:**
  - idx_ai_analysis_meal_log_id - Covers meal_log_id foreign key
  
  **ai_chat_history table:**
  - idx_ai_chat_history_user_id - Covers user_id foreign key
  
  **custom_recipes table:**
  - idx_custom_recipes_user_id - Covers user_id foreign key
  
  **favorite_meals table:**
  - idx_favorite_meals_user_id - Covers user_id foreign key
  
  **meal_suggestions table:**
  - idx_meal_suggestions_user_id - Covers user_id foreign key
  
  **scanned_products table:**
  - idx_scanned_products_created_by - Covers created_by foreign key
  
  **subscriptions table:**
  - idx_subscriptions_user_id - Covers user_id foreign key

  ## Notes
  
  These indexes were previously removed as "unused" but are actually critical for
  foreign key performance. Foreign key indexes are used by the database engine
  internally even if they don't show up in query plans.
*/

-- ============================================================================
-- Create indexes for foreign key columns
-- ============================================================================

-- ai_analysis: meal_log_id foreign key
CREATE INDEX IF NOT EXISTS idx_ai_analysis_meal_log_id 
ON public.ai_analysis (meal_log_id);

-- ai_chat_history: user_id foreign key
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id 
ON public.ai_chat_history (user_id);

-- custom_recipes: user_id foreign key
CREATE INDEX IF NOT EXISTS idx_custom_recipes_user_id 
ON public.custom_recipes (user_id);

-- favorite_meals: user_id foreign key
CREATE INDEX IF NOT EXISTS idx_favorite_meals_user_id 
ON public.favorite_meals (user_id);

-- meal_suggestions: user_id foreign key
CREATE INDEX IF NOT EXISTS idx_meal_suggestions_user_id 
ON public.meal_suggestions (user_id);

-- scanned_products: created_by foreign key
CREATE INDEX IF NOT EXISTS idx_scanned_products_created_by 
ON public.scanned_products (created_by);

-- subscriptions: user_id foreign key
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON public.subscriptions (user_id);

-- ============================================================================
-- Verify all foreign keys have covering indexes
-- ============================================================================

-- This query will help verify that all foreign keys now have indexes
-- Run this in Supabase SQL editor to check:
/*
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  EXISTS(
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = tc.table_name
    AND indexdef LIKE '%' || kcu.column_name || '%'
  ) AS has_index
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
*/
