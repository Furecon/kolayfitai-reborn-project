-- Add tutorial_seen field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tutorial_seen boolean DEFAULT false;