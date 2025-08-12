-- Drop existing indexes that depend on pg_trgm
DROP INDEX IF EXISTS idx_foods_name_trgm;
DROP INDEX IF EXISTS idx_foods_name_en_trgm;

-- Drop and recreate extension in proper schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Recreate indexes with proper schema reference
CREATE INDEX IF NOT EXISTS idx_foods_name_trgm ON public.foods USING gin (name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_name_en_trgm ON public.foods USING gin (name_en extensions.gin_trgm_ops);

-- Update search_foods function with secure search_path and proper schema references
CREATE OR REPLACE FUNCTION public.search_foods(search_term text)
RETURNS TABLE(
  id uuid, 
  name text, 
  name_en text, 
  calories_per_100g numeric, 
  protein_per_100g numeric, 
  carbs_per_100g numeric, 
  fat_per_100g numeric, 
  category text, 
  similarity real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.name_en,
    f.calories_per_100g,
    f.protein_per_100g,
    f.carbs_per_100g,
    f.fat_per_100g,
    f.category,
    GREATEST(
      COALESCE(extensions.similarity(f.name, search_term), 0),
      COALESCE(extensions.similarity(COALESCE(f.name_en, ''), search_term), 0)
    ) as similarity
  FROM public.foods f
  WHERE 
    -- Exact and partial matches
    f.name ILIKE '%' || search_term || '%' 
    OR f.name_en ILIKE '%' || search_term || '%'
    -- Fuzzy matches (similarity > 0.2 for broader results)
    OR extensions.similarity(f.name, search_term) > 0.2
    OR extensions.similarity(COALESCE(f.name_en, ''), search_term) > 0.2
    -- Word boundary matches
    OR f.name ~* ('\y' || search_term || '\y')
    OR f.name_en ~* ('\y' || search_term || '\y')
  ORDER BY 
    -- Prioritize exact matches, then similarity, then name
    CASE WHEN f.name ILIKE search_term OR f.name_en ILIKE search_term THEN 1 ELSE 2 END,
    similarity DESC, 
    f.name
  LIMIT 30;
END;
$function$;