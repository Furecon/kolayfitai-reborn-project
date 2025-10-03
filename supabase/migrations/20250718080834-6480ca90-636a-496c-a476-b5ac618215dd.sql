-- Update foods table with international cuisines
INSERT INTO public.foods (name, name_en, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, category, is_turkish_cuisine) VALUES
-- Italian
('Pizza Margherita', 'Pizza Margherita', 266, 11, 33, 10, 2, 'Italian', false),
('Spaghetti Bolognese', 'Spaghetti Bolognese', 151, 7, 19, 6, 2, 'Italian', false),
('Lasagna', 'Lasagna', 135, 8, 11, 6, 1, 'Italian', false),
('Risotto', 'Risotto', 166, 4, 28, 4, 1, 'Italian', false),

-- Asian
('Sushi', 'Sushi', 143, 6, 23, 4, 0, 'Japanese', false),
('Ramen', 'Ramen', 436, 14, 59, 15, 3, 'Japanese', false),
('Pad Thai', 'Pad Thai', 181, 9, 35, 2, 2, 'Thai', false),
('Fried Rice', 'Fried Rice', 163, 4, 25, 6, 1, 'Chinese', false),
('Chicken Teriyaki', 'Chicken Teriyaki', 128, 19, 8, 3, 0, 'Japanese', false),

-- Mexican
('Tacos', 'Tacos', 226, 13, 18, 12, 3, 'Mexican', false),
('Burrito', 'Burrito', 206, 10, 26, 7, 4, 'Mexican', false),
('Quesadilla', 'Quesadilla', 234, 11, 23, 12, 2, 'Mexican', false),

-- Indian
('Chicken Curry', 'Chicken Curry', 165, 25, 5, 6, 1, 'Indian', false),
('Biryani', 'Biryani', 200, 8, 35, 4, 2, 'Indian', false),
('Naan Bread', 'Naan Bread', 262, 8, 45, 6, 2, 'Indian', false),

-- American
('Hamburger', 'Hamburger', 295, 17, 23, 17, 2, 'American', false),
('Hot Dog', 'Hot Dog', 290, 10, 25, 18, 1, 'American', false),
('Caesar Salad', 'Caesar Salad', 87, 3, 7, 6, 2, 'American', false),

-- French
('Croissant', 'Croissant', 406, 8, 45, 21, 3, 'French', false),
('French Fries', 'French Fries', 365, 4, 63, 17, 4, 'French', false),
('Quiche', 'Quiche', 243, 11, 14, 17, 1, 'French', false),

-- Mediterranean
('Greek Salad', 'Greek Salad', 121, 4, 7, 10, 3, 'Greek', false),
('Hummus', 'Hummus', 166, 8, 14, 10, 6, 'Mediterranean', false),
('Falafel', 'Falafel', 333, 13, 32, 18, 5, 'Mediterranean', false),

-- Common Foods
('Apple', 'Apple', 52, 0, 14, 0, 2, 'Fruit', false),
('Banana', 'Banana', 89, 1, 23, 0, 3, 'Fruit', false),
('Bread', 'Bread', 265, 9, 49, 3, 4, 'Grains', false),
('Chicken Breast', 'Chicken Breast', 165, 31, 0, 4, 0, 'Protein', false),
('Salmon', 'Salmon', 208, 20, 0, 13, 0, 'Protein', false),
('Egg', 'Egg', 155, 13, 1, 11, 0, 'Protein', false),
('Rice', 'Rice', 130, 3, 28, 0, 0, 'Grains', false),
('Pasta', 'Pasta', 131, 5, 25, 1, 2, 'Grains', false);

-- Add confidence_threshold column to ai_analysis table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_analysis' AND column_name = 'confidence_threshold'
  ) THEN
    ALTER TABLE public.ai_analysis ADD COLUMN confidence_threshold DECIMAL(3,2) DEFAULT 0.70;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_analysis' AND column_name = 'requires_manual_review'
  ) THEN
    ALTER TABLE public.ai_analysis ADD COLUMN requires_manual_review BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_analysis' AND column_name = 'manual_corrections'
  ) THEN
    ALTER TABLE public.ai_analysis ADD COLUMN manual_corrections JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_analysis' AND column_name = 'final_analysis'
  ) THEN
    ALTER TABLE public.ai_analysis ADD COLUMN final_analysis JSONB DEFAULT '{}';
  END IF;
END $$;

-- Create food_search function for better food matching
CREATE OR REPLACE FUNCTION search_foods(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_en TEXT,
  calories_per_100g DECIMAL(6,2),
  protein_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fat_per_100g DECIMAL(5,2),
  category TEXT,
  similarity REAL
) 
LANGUAGE plpgsql
AS $$
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
      similarity(f.name, search_term),
      similarity(COALESCE(f.name_en, ''), search_term)
    ) as similarity
  FROM public.foods f
  WHERE 
    f.name ILIKE '%' || search_term || '%' 
    OR f.name_en ILIKE '%' || search_term || '%'
    OR similarity(f.name, search_term) > 0.3
    OR similarity(COALESCE(f.name_en, ''), search_term) > 0.3
  ORDER BY similarity DESC, f.name
  LIMIT 20;
END;
$$;