
-- Favori yemekler tablosu
CREATE TABLE public.favorite_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  meal_name TEXT NOT NULL,
  recipe JSONB NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Öğün önerileri geçmişi tablosu
CREATE TABLE public.meal_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  suggestion_data JSONB NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikaları - favorite_meals
ALTER TABLE public.favorite_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorite meals" 
  ON public.favorite_meals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite meals" 
  ON public.favorite_meals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite meals" 
  ON public.favorite_meals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS politikaları - meal_suggestions
ALTER TABLE public.meal_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal suggestions" 
  ON public.meal_suggestions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal suggestions" 
  ON public.meal_suggestions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
