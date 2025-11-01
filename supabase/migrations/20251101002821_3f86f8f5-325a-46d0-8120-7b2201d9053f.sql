-- Create guilds table
CREATE TABLE IF NOT EXISTS public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  world TEXT NOT NULL,
  display_name TEXT NOT NULL,
  subtitle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on guilds
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

-- Add guild_id to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guild_id UUID REFERENCES public.guilds(id);

-- Create default guild
INSERT INTO public.guilds (name, world, display_name, subtitle)
VALUES ('genesis-mystian', 'Mystian', 'Genesis - Mystian', 'Default Guild')
ON CONFLICT (name) DO NOTHING;

-- RLS policies for guilds
CREATE POLICY "Everyone can view guilds"
ON public.guilds
FOR SELECT
USING (true);

CREATE POLICY "Master admins can manage guilds"
ON public.guilds
FOR ALL
USING (is_master_admin(auth.uid()));

-- Create trigger for updated_at on guilds
CREATE TRIGGER update_guilds_updated_at
BEFORE UPDATE ON public.guilds
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();