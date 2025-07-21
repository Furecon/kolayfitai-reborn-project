
-- Enable RLS for foods table (critical security fix)
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Update function security settings to prevent warnings
ALTER FUNCTION public.search_foods SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user SET search_path = public, pg_temp;

-- Note: The following settings should be configured in Supabase Dashboard:
-- 1. Auth > Settings > OTP Expiry: Set to 3600 seconds (1 hour) instead of default
-- 2. Auth > Settings > Enable "Breached Password Protection"
-- 3. Auth > Settings > Enable "Session Management"
