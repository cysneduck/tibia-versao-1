-- Fix real-time subscription for notifications table
-- Set replica identity to capture all column changes for real-time updates

ALTER TABLE public.notifications REPLICA IDENTITY FULL;