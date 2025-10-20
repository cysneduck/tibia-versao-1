-- Create hunted_characters table
CREATE TABLE public.hunted_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_name TEXT NOT NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hunted_characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view hunted characters"
ON public.hunted_characters
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert hunted characters"
ON public.hunted_characters
FOR INSERT
WITH CHECK (is_admin_or_master(auth.uid()));

CREATE POLICY "Admins can update hunted characters"
ON public.hunted_characters
FOR UPDATE
USING (is_admin_or_master(auth.uid()));

CREATE POLICY "Admins can delete hunted characters"
ON public.hunted_characters
FOR DELETE
USING (is_admin_or_master(auth.uid()));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_hunted_characters_updated_at
BEFORE UPDATE ON public.hunted_characters
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.hunted_characters;