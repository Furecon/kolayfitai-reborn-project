
-- Add new nutrition fields to meal_logs table
ALTER TABLE meal_logs 
ADD COLUMN total_fiber numeric DEFAULT 0,
ADD COLUMN total_sugar numeric DEFAULT 0,
ADD COLUMN total_sodium numeric DEFAULT 0;

-- Add macro goal fields to profiles table  
ALTER TABLE profiles
ADD COLUMN daily_protein_goal numeric DEFAULT 0,
ADD COLUMN daily_carbs_goal numeric DEFAULT 0,
ADD COLUMN daily_fat_goal numeric DEFAULT 0;

-- Add new nutrition fields to foods table for better database coverage
ALTER TABLE foods
ADD COLUMN sugar_per_100g numeric DEFAULT 0,
ADD COLUMN sodium_per_100g numeric DEFAULT 0;

-- Update existing profiles to have default macro goals based on their calorie goals
UPDATE profiles 
SET 
  daily_protein_goal = CASE 
    WHEN daily_calorie_goal IS NOT NULL THEN daily_calorie_goal * 0.30 / 4 -- 30% of calories from protein (4 cal/g)
    ELSE 125 -- Default 125g protein for 2000 cal diet
  END,
  daily_carbs_goal = CASE 
    WHEN daily_calorie_goal IS NOT NULL THEN daily_calorie_goal * 0.40 / 4 -- 40% of calories from carbs (4 cal/g)  
    ELSE 200 -- Default 200g carbs for 2000 cal diet
  END,
  daily_fat_goal = CASE 
    WHEN daily_calorie_goal IS NOT NULL THEN daily_calorie_goal * 0.30 / 9 -- 30% of calories from fat (9 cal/g)
    ELSE 67 -- Default 67g fat for 2000 cal diet
  END
WHERE daily_protein_goal IS NULL OR daily_carbs_goal IS NULL OR daily_fat_goal IS NULL;
