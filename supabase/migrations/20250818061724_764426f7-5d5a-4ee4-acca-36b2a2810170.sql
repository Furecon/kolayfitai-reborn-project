-- Update profiles table to track tutorial completion per screen
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS tutorial_seen;

-- Add comprehensive tutorial tracking
ALTER TABLE public.profiles 
ADD COLUMN tutorials_completed jsonb DEFAULT '{
  "dashboard": false,
  "food_analysis": false, 
  "photo_recognition": false,
  "detailed_analysis": false,
  "profile_setup": false
}'::jsonb;