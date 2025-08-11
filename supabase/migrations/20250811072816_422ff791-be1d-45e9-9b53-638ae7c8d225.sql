-- Add diet_goal column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN diet_goal text;