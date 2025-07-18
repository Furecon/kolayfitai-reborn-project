-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  height INTEGER,
  gender TEXT CHECK (gender IN ('erkek', 'kadın', 'belirtmek_istemiyorum')),
  activity_level TEXT CHECK (activity_level IN ('sedanter', 'az_aktif', 'orta_aktif', 'çok_aktif', 'extra_aktif')),
  daily_calorie_goal INTEGER,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '3 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create foods database table (international cuisines)
CREATE TABLE public.foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  calories_per_100g DECIMAL(6,2) NOT NULL,
  protein_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0,
  carbs_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0,
  fat_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0,
  fiber_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0,
  category TEXT,
  is_turkish_cuisine BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal logs table
CREATE TABLE public.meal_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT CHECK (meal_type IN ('kahvaltı', 'öğle', 'akşam', 'atıştırmalık')) NOT NULL,
  food_items JSONB NOT NULL DEFAULT '[]',
  total_calories DECIMAL(7,2) NOT NULL DEFAULT 0,
  total_protein DECIMAL(6,2) NOT NULL DEFAULT 0,
  total_carbs DECIMAL(6,2) NOT NULL DEFAULT 0,
  total_fat DECIMAL(6,2) NOT NULL DEFAULT 0,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI analysis results table with confidence tracking
CREATE TABLE public.ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_log_id UUID REFERENCES public.meal_logs NOT NULL,
  detected_foods JSONB NOT NULL DEFAULT '[]',
  confidence_scores JSONB NOT NULL DEFAULT '{}',
  nutritional_analysis JSONB NOT NULL DEFAULT '{}',
  ai_suggestions TEXT,
  processing_time_ms INTEGER,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.70,
  requires_manual_review BOOLEAN DEFAULT false,
  manual_corrections JSONB DEFAULT '{}',
  final_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table for Google Play Billing tracking
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'cancelled', 'pending')) NOT NULL,
  purchase_token TEXT,
  order_id TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  price_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'TRY',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meal_logs
CREATE POLICY "Users can view their own meal logs" ON public.meal_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal logs" ON public.meal_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs" ON public.meal_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs" ON public.meal_logs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_analysis
CREATE POLICY "Users can view AI analysis of their meals" ON public.ai_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_logs 
      WHERE meal_logs.id = ai_analysis.meal_log_id 
      AND meal_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert AI analysis" ON public.ai_analysis
  FOR INSERT WITH CHECK (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Foods table is public for reading
CREATE POLICY "Anyone can view foods" ON public.foods
  FOR SELECT USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, subscription_status, trial_end_date)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    'trial',
    now() + interval '3 days'
  );
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();