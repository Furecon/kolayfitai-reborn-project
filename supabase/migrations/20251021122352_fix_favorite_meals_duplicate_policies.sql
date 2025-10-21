/*
  # Fix Duplicate Policies on favorite_meals Table

  This migration removes duplicate RLS policies on the favorite_meals table.
  Multiple permissive policies for the same action cause redundancy and 
  potential confusion. We keep the more specific policies and remove the 
  generic "manage" policy.

  ## Changes

  **favorite_meals table**
  - Remove "Users can manage their own favorite meals" policy (covers all operations)
  - Keep specific policies:
    - "Users can view their own favorite meals" (SELECT)
    - "Users can create their own favorite meals" (INSERT)
    - "Users can delete their own favorite meals" (DELETE)
  
  ## Impact
  - Eliminates duplicate policy warnings
  - Maintains same security level
  - Improves policy clarity and maintainability
*/

-- Drop the generic "manage" policy that duplicates other policies
DROP POLICY IF EXISTS "Users can manage their own favorite meals" ON public.favorite_meals;

-- Ensure specific policies exist and are optimized
-- These should already be created/updated by the previous migration

-- Verify SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorite_meals' 
    AND policyname = 'Users can view their own favorite meals'
  ) THEN
    CREATE POLICY "Users can view their own favorite meals" 
    ON public.favorite_meals FOR SELECT 
    TO authenticated 
    USING (user_id = (select auth.uid()));
  END IF;
END $$;

-- Verify INSERT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorite_meals' 
    AND policyname = 'Users can create their own favorite meals'
  ) THEN
    CREATE POLICY "Users can create their own favorite meals" 
    ON public.favorite_meals FOR INSERT 
    TO authenticated 
    WITH CHECK (user_id = (select auth.uid()));
  END IF;
END $$;

-- Verify DELETE policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorite_meals' 
    AND policyname = 'Users can delete their own favorite meals'
  ) THEN
    CREATE POLICY "Users can delete their own favorite meals" 
    ON public.favorite_meals FOR DELETE 
    TO authenticated 
    USING (user_id = (select auth.uid()));
  END IF;
END $$;

-- Add UPDATE policy if it doesn't exist (was missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'favorite_meals' 
    AND policyname = 'Users can update their own favorite meals'
  ) THEN
    CREATE POLICY "Users can update their own favorite meals" 
    ON public.favorite_meals FOR UPDATE 
    TO authenticated 
    USING (user_id = (select auth.uid()))
    WITH CHECK (user_id = (select auth.uid()));
  END IF;
END $$;