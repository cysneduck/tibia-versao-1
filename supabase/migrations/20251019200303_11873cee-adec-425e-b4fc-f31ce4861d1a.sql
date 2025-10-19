-- Force refresh of real-time configuration
-- Remove and re-add notifications table to publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;