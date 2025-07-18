
-- Update profiles table with BMR and diet tracking fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bmr DECIMAL(7,2),
ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER DEFAULT 2000,
ADD COLUMN IF NOT EXISTS diet_goal TEXT DEFAULT 'maintain' CHECK (diet_goal IN ('lose', 'gain', 'maintain')),
ADD COLUMN IF NOT EXISTS water_goal INTEGER DEFAULT 2000,
ADD COLUMN IF NOT EXISTS activity_multiplier DECIMAL(3,2) DEFAULT 1.2;

-- Create daily_goals table for tracking daily targets
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calorie_goal INTEGER NOT NULL,
  protein_goal DECIMAL(6,2) DEFAULT 0,
  carbs_goal DECIMAL(6,2) DEFAULT 0,
  fat_goal DECIMAL(6,2) DEFAULT 0,
  water_goal INTEGER DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create ai_chat_history table for diet assistant conversations
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) NOT NULL,
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorite_meals table for user's favorite meals
CREATE TABLE IF NOT EXISTS public.favorite_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) NOT NULL,
  meal_name TEXT NOT NULL,
  food_items JSONB NOT NULL DEFAULT '[]',
  total_calories DECIMAL(7,2) NOT NULL DEFAULT 0,
  total_protein DECIMAL(6,2) NOT NULL DEFAULT 0,
  total_carbs DECIMAL(6,2) NOT NULL DEFAULT 0,
  total_fat DECIMAL(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_recipes table for user's custom recipes
CREATE TABLE IF NOT EXISTS public.custom_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  calories_per_serving DECIMAL(7,2),
  protein_per_serving DECIMAL(6,2),
  carbs_per_serving DECIMAL(6,2),
  fat_per_serving DECIMAL(6,2),
  servings INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for daily_goals
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily goals" 
  ON public.daily_goals 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_id = daily_goals.user_id));

CREATE POLICY "Users can insert their own daily goals" 
  ON public.daily_goals 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_id = daily_goals.user_id));

CREATE POLICY "Users can update their own daily goals" 
  ON public.daily_goals 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_id = daily_goals.user_id));

-- Add RLS policies for ai_chat_history
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history" 
  ON public.ai_chat_history 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_id = ai_chat_history.user_id));

CREATE POLICY "Users can insert their own chat messages" 
  ON public.ai_chat_history 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_id = ai_chat_history.user_id));

-- Add RLS policies for favorite_meals
ALTER TABLE public.favorite_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorite meals" 
  ON public.favorite_meals 
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_id = favorite_meals.user_id));

-- Add RLS policies for custom_recipes
ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own custom recipes" 
  ON public.custom_recipes 
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_id = custom_recipes.user_id));

-- Create function to calculate BMR
CREATE OR REPLACE FUNCTION calculate_bmr(
  gender_param TEXT,
  weight_param DECIMAL,
  height_param INTEGER,
  age_param INTEGER
) RETURNS DECIMAL AS $$
BEGIN
  IF gender_param = 'male' THEN
    RETURN 88.362 + (13.397 * weight_param) + (4.799 * height_param) - (5.677 * age_param);
  ELSE
    RETURN 447.593 + (9.247 * weight_param) + (3.098 * height_param) - (4.330 * age_param);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get or create daily goals
CREATE OR REPLACE FUNCTION get_or_create_daily_goals(
  user_id_param UUID,
  date_param DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  id UUID,
  calorie_goal INTEGER,
  protein_goal DECIMAL,
  carbs_goal DECIMAL,
  fat_goal DECIMAL,
  water_goal INTEGER
) AS $$
DECLARE
  goal_record RECORD;
  user_profile RECORD;
BEGIN
  -- Try to get existing daily goal
  SELECT * INTO goal_record 
  FROM public.daily_goals dg 
  WHERE dg.user_id = user_id_param AND dg.date = date_param;
  
  -- If no goal exists, create one based on user profile
  IF NOT FOUND THEN
    SELECT * INTO user_profile 
    FROM public.profiles p 
    WHERE p.user_id = user_id_param;
    
    INSERT INTO public.daily_goals (user_id, date, calorie_goal, water_goal)
    VALUES (user_id_param, date_param, COALESCE(user_profile.daily_calorie_goal, 2000), COALESCE(user_profile.water_goal, 2000))
    RETURNING * INTO goal_record;
  END IF;
  
  RETURN QUERY SELECT 
    goal_record.id,
    goal_record.calorie_goal,
    goal_record.protein_goal,
    goal_record.carbs_goal,
    goal_record.fat_goal,
    goal_record.water_goal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
