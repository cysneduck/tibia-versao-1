-- Ensure full row replication for real-time to work properly
ALTER TABLE public.notifications REPLICA IDENTITY FULL;