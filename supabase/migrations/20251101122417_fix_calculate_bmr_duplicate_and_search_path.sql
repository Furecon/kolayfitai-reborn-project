/*
  # Fix calculate_bmr Function Issues

  ## Overview
  
  There are two versions of the calculate_bmr function with different signatures.
  This migration removes the old version without proper search_path and ensures
  only the secure version remains.

  ## Changes
  
  **Functions Modified:**
  - Drops old calculate_bmr(gender_param, weight_param, height_param, age_param)
  - Keeps calculate_bmr(weight_kg, height_cm, age, gender) with proper SECURITY DEFINER and search_path
  
  ## Security Impact
  
  - Eliminates function overload ambiguity
  - Ensures all calls use the secure version with explicit search_path
  - Prevents potential SQL injection via search_path manipulation
*/

-- Drop the old version without proper security settings
DROP FUNCTION IF EXISTS public.calculate_bmr(text, numeric, integer, integer);

-- Ensure the secure version exists with proper settings
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

-- Add comment for documentation
COMMENT ON FUNCTION public.calculate_bmr(numeric, numeric, integer, text) IS 
'Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation. 
Parameters: weight_kg, height_cm, age, gender (male/female).
Returns: BMR in kcal/day rounded to 2 decimal places.';
