-- Fix subscription_status check constraint to allow 'premium' value
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

-- Add new check constraint that includes 'premium' as valid value
ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN ('trial', 'premium', 'cancelled', 'expired'));