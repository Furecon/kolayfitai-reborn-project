-- Add estimation source and confidence fields to meal_logs table
ALTER TABLE public.meal_logs 
ADD COLUMN IF NOT EXISTS estimation_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS confidence NUMERIC DEFAULT NULL;

-- Update existing records to have default estimation_source
UPDATE public.meal_logs 
SET estimation_source = 'manual' 
WHERE estimation_source IS NULL;