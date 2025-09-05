-- Add RTDN tracking columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS rtdn_notification_type TEXT,
ADD COLUMN IF NOT EXISTS last_rtdn_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;