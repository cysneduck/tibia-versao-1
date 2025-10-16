
-- Enable real-time for respawn_queue table
ALTER TABLE public.respawn_queue REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.respawn_queue;

-- Also ensure claims has full replica identity
ALTER TABLE public.claims REPLICA IDENTITY FULL;
