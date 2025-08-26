-- Create favorites table for quick meal suggestions
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  default_calories NUMERIC NOT NULL DEFAULT 0,
  default_protein NUMERIC DEFAULT 0,
  default_carbs NUMERIC DEFAULT 0,
  default_fat NUMERIC DEFAULT 0,
  default_amount_value NUMERIC DEFAULT 100,
  default_amount_unit TEXT DEFAULT 'g',
  default_cooking_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" 
ON public.favorites 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_favorites_updated_at
BEFORE UPDATE ON public.favorites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update meal_logs table to ensure photo_url is nullable (it should already be)
-- Add more detailed meal information columns
ALTER TABLE public.meal_logs 
ADD COLUMN IF NOT EXISTS meal_name TEXT,
ADD COLUMN IF NOT EXISTS amount_value NUMERIC,
ADD COLUMN IF NOT EXISTS amount_unit TEXT DEFAULT 'g',
ADD COLUMN IF NOT EXISTS cooking_method TEXT;