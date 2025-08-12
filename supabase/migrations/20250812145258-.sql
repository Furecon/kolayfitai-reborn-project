-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_foods_name_trgm ON public.foods USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_name_en_trgm ON public.foods USING gin (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods (category);

-- Update search_foods function with better fallback logic
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
SET search_path TO 'public', 'pg_temp'
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
      COALESCE(similarity(f.name, search_term), 0),
      COALESCE(similarity(COALESCE(f.name_en, ''), search_term), 0)
    ) as similarity
  FROM public.foods f
  WHERE 
    -- Exact and partial matches
    f.name ILIKE '%' || search_term || '%' 
    OR f.name_en ILIKE '%' || search_term || '%'
    -- Fuzzy matches (similarity > 0.2 for broader results)
    OR similarity(f.name, search_term) > 0.2
    OR similarity(COALESCE(f.name_en, ''), search_term) > 0.2
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