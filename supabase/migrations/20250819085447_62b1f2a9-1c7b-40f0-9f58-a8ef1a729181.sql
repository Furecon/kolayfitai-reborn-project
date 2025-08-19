-- Add tutorial_seen column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tutorial_seen boolean DEFAULT false;