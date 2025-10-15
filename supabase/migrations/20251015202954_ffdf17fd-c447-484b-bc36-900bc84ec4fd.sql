-- Create respawn queue table
CREATE TABLE public.respawn_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respawn_id UUID NOT NULL REFERENCES public.respawns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(respawn_id, user_id)
);

-- Enable RLS
ALTER TABLE public.respawn_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view queue for any respawn"
ON public.respawn_queue
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join queue"
ON public.respawn_queue
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave their own queue position"
ON public.respawn_queue
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage queue"
ON public.respawn_queue
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER handle_respawn_queue_updated_at
BEFORE UPDATE ON public.respawn_queue
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to join respawn queue
CREATE OR REPLACE FUNCTION public.join_respawn_queue(
  p_respawn_id UUID,
  p_character_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_character_name TEXT;
  v_queue_position INTEGER;
  v_user_existing_claim UUID;
  v_already_in_queue BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if character belongs to user
  SELECT name INTO v_character_name
  FROM public.characters
  WHERE id = p_character_id AND user_id = v_user_id;
  
  IF v_character_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Character not found or does not belong to you');
  END IF;
  
  -- Check if user already has an active claim
  SELECT id INTO v_user_existing_claim
  FROM public.claims
  WHERE user_id = v_user_id
    AND is_active = true
    AND expires_at > NOW();
  
  IF v_user_existing_claim IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You cannot join a queue while you have an active claim');
  END IF;
  
  -- Check if already in queue
  SELECT EXISTS(
    SELECT 1 FROM public.respawn_queue
    WHERE respawn_id = p_respawn_id AND user_id = v_user_id
  ) INTO v_already_in_queue;
  
  IF v_already_in_queue THEN
    RETURN json_build_object('success', false, 'error', 'You are already in the queue for this respawn');
  END IF;
  
  -- Add to queue
  INSERT INTO public.respawn_queue (
    respawn_id,
    user_id,
    character_id,
    character_name
  ) VALUES (
    p_respawn_id,
    v_user_id,
    p_character_id,
    v_character_name
  );
  
  -- Get queue position
  SELECT COUNT(*) INTO v_queue_position
  FROM public.respawn_queue
  WHERE respawn_id = p_respawn_id;
  
  RETURN json_build_object(
    'success', true,
    'position', v_queue_position,
    'character_name', v_character_name
  );
END;
$$;

-- Function to leave respawn queue
CREATE OR REPLACE FUNCTION public.leave_respawn_queue(
  p_respawn_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  DELETE FROM public.respawn_queue
  WHERE respawn_id = p_respawn_id
    AND user_id = v_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'You are not in the queue for this respawn');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Update release_claim function to mark next person in queue as notified
CREATE OR REPLACE FUNCTION public.release_claim(p_claim_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_respawn_id UUID;
  v_next_queue_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if claim belongs to user and is active
  IF NOT EXISTS (
    SELECT 1 FROM public.claims
    WHERE id = p_claim_id
      AND user_id = v_user_id
      AND is_active = true
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Claim not found or already released');
  END IF;
  
  -- Get respawn_id
  SELECT respawn_id INTO v_respawn_id
  FROM public.claims
  WHERE id = p_claim_id;
  
  -- Release the claim
  UPDATE public.claims
  SET is_active = false,
      released_at = NOW()
  WHERE id = p_claim_id;
  
  -- Mark next person in queue as notified
  SELECT id INTO v_next_queue_id
  FROM public.respawn_queue
  WHERE respawn_id = v_respawn_id
  ORDER BY joined_at ASC
  LIMIT 1;
  
  IF v_next_queue_id IS NOT NULL THEN
    UPDATE public.respawn_queue
    SET notified = true
    WHERE id = v_next_queue_id;
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;