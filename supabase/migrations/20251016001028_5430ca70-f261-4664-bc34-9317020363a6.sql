-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule the queue automation function to run every minute
SELECT cron.schedule(
  'queue-automation',
  '* * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://qjlueotimnjfpuhvshgd.supabase.co/functions/v1/handle-queue-automation',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbHVlb3RpbW5qZnB1aHZzaGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzA2OTcsImV4cCI6MjA3NjEwNjY5N30.NquZc4IS0RtQc9QffQnPRKp0siA32G_TDROAh_UfXgM"}'::jsonb
    ) as request_id;
  $$
);