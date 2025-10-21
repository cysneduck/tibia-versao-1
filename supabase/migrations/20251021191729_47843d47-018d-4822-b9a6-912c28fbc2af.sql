-- Add online status tracking columns to hunted_characters table
ALTER TABLE public.hunted_characters
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_seen_online TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_checked TIMESTAMP WITH TIME ZONE;

-- Create online_check_logs table for monitoring scraper health
CREATE TABLE IF NOT EXISTS public.online_check_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_hunted INTEGER NOT NULL,
  total_online INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on online_check_logs
ALTER TABLE public.online_check_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view logs
CREATE POLICY "Admins can view online check logs"
ON public.online_check_logs
FOR SELECT
USING (is_admin_or_master(auth.uid()));

-- Schedule the online check to run every 1 minute
-- Note: pg_cron and pg_net extensions should already be enabled in Supabase
SELECT cron.schedule(
  'check-hunted-online-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://qjlueotimnjfpuhvshgd.supabase.co/functions/v1/check-hunted-online',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbHVlb3RpbW5qZnB1aHZzaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzA2OTcsImV4cCI6MjA3NjEwNjY5N30.NquZc4IS0RtQc9QffQnPRKp0siA32G_TDROAh_UfXgM"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);