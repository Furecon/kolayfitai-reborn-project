/*
  # Add Diet Profile and AI-Generated Diet Plans

  ## 1. New Tables

  ### `diet_profiles`
  Stores user's dietary preferences and restrictions for AI-powered meal planning.
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `age` (integer) - User's age
  - `gender` (text) - male/female/other
  - `height_cm` (integer) - Height in centimeters
  - `weight_kg` (decimal) - Current weight in kilograms
  - `goal` (text) - lose_weight/gain_weight/maintain_weight
  - `activity_level` (text) - sedentary/light/moderate/very_active/extra_active
  - `diet_type` (text) - normal/vegan/vegetarian/pescatarian/low_carb/high_protein/gluten_free
  - `allergens` (jsonb array) - List of allergens: dairy, gluten, eggs, nuts, shellfish, etc.
  - `disliked_foods` (text) - Free text list of disliked ingredients/meals
  - `preferred_cuisines` (text) - Free text list of preferred cuisines (Turkish, Mediterranean, Asian, etc.)
  - `has_seen_onboarding` (boolean) - Whether user has seen the diet onboarding wizard
  - `hide_diet_tips` (boolean) - Whether to hide diet plan usage tips
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `diet_plans`
  Stores AI-generated 7-day diet plans for users.
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `plan_data` (jsonb) - Complete 7-day plan structure with days, meals, macros
  - `start_date` (date) - When this plan starts (for date-based meal display)
  - `generated_at` (timestamptz) - When AI generated this plan
  - `is_active` (boolean) - Whether this is the user's current active plan
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on both tables
  - Users can only read/write their own diet profiles and plans
  - Authenticated access only

  ## 3. Indexes
  - Index on user_id for fast lookups
  - Index on is_active for finding current plans
*/

-- Create diet_profiles table
CREATE TABLE IF NOT EXISTS public.diet_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm INTEGER,
  weight_kg DECIMAL(5, 2),
  goal TEXT CHECK (goal IN ('lose_weight', 'gain_weight', 'maintain_weight')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'extra_active')),
  diet_type TEXT CHECK (diet_type IN ('normal', 'vegan', 'vegetarian', 'pescatarian', 'low_carb', 'high_protein', 'gluten_free')) DEFAULT 'normal',
  allergens JSONB DEFAULT '[]'::jsonb,
  disliked_foods TEXT,
  preferred_cuisines TEXT,
  has_seen_onboarding BOOLEAN DEFAULT false,
  hide_diet_tips BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  generated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_diet_profiles_user_id ON public.diet_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON public.diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_active ON public.diet_plans(user_id, is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.diet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diet_profiles
CREATE POLICY "Users can view own diet profile"
  ON public.diet_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet profile"
  ON public.diet_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet profile"
  ON public.diet_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet profile"
  ON public.diet_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for diet_plans
CREATE POLICY "Users can view own diet plans"
  ON public.diet_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plans"
  ON public.diet_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans"
  ON public.diet_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plans"
  ON public.diet_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_diet_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_diet_profile_timestamp
  BEFORE UPDATE ON public.diet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diet_profile_updated_at();

-- Function to deactivate old plans when new one is created
CREATE OR REPLACE FUNCTION public.deactivate_old_diet_plans()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE public.diet_plans
    SET is_active = false
    WHERE user_id = NEW.user_id 
      AND id != NEW.id
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-deactivate old plans
CREATE TRIGGER deactivate_old_plans_on_insert
  AFTER INSERT ON public.diet_plans
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION public.deactivate_old_diet_plans();