-- Add priority tracking to respawn_queue
ALTER TABLE respawn_queue 
ADD COLUMN IF NOT EXISTS priority_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS priority_given_at TIMESTAMPTZ;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  respawn_id UUID REFERENCES respawns(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Update release_claim function to handle priority
CREATE OR REPLACE FUNCTION public.release_claim(p_claim_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_respawn_id UUID;
  v_respawn_name TEXT;
  v_next_queue_id UUID;
  v_next_user_id UUID;
  v_next_character_name TEXT;
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
  
  -- Get respawn info
  SELECT c.respawn_id, r.name INTO v_respawn_id, v_respawn_name
  FROM public.claims c
  JOIN public.respawns r ON c.respawn_id = r.id
  WHERE c.id = p_claim_id;
  
  -- Release the claim
  UPDATE public.claims
  SET is_active = false,
      released_at = NOW()
  WHERE id = p_claim_id;
  
  -- Get next person in queue
  SELECT id, user_id, character_name INTO v_next_queue_id, v_next_user_id, v_next_character_name
  FROM public.respawn_queue
  WHERE respawn_id = v_respawn_id
  ORDER BY joined_at ASC
  LIMIT 1;
  
  IF v_next_queue_id IS NOT NULL THEN
    -- Give priority to next person (5 minutes)
    UPDATE public.respawn_queue
    SET notified = true,
        priority_given_at = NOW(),
        priority_expires_at = NOW() + INTERVAL '5 minutes'
    WHERE id = v_next_queue_id;
    
    -- Create notification for next person
    INSERT INTO public.notifications (user_id, title, message, type, respawn_id, expires_at)
    VALUES (
      v_next_user_id,
      'It''s your turn!',
      'You have 5 minutes to claim ' || v_respawn_name,
      'claim_ready',
      v_respawn_id,
      NOW() + INTERVAL '5 minutes'
    );
  END IF;
  
  RETURN json_build_object('success', true);
END;
$function$;

-- Update claim_respawn function to enforce priority
CREATE OR REPLACE FUNCTION public.claim_respawn(p_respawn_id uuid, p_character_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_character_name TEXT;
  v_user_role app_role;
  v_duration_hours INTEGER;
  v_duration_minutes INTEGER;
  v_expires_at TIMESTAMPTZ;
  v_user_existing_claim UUID;
  v_existing_claim UUID;
  v_claim_id UUID;
  v_priority_user_id UUID;
  v_priority_expires_at TIMESTAMPTZ;
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
    RETURN json_build_object('success', false, 'error', 'You already have an active claim. Please leave your current respawn before claiming another one.');
  END IF;
  
  -- Check if respawn is already claimed
  SELECT id INTO v_existing_claim
  FROM public.claims
  WHERE respawn_id = p_respawn_id
    AND is_active = true
    AND expires_at > NOW();
  
  IF v_existing_claim IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Respawn is already claimed');
  END IF;
  
  -- Check if someone else has priority
  SELECT user_id, priority_expires_at INTO v_priority_user_id, v_priority_expires_at
  FROM public.respawn_queue
  WHERE respawn_id = p_respawn_id
    AND priority_expires_at IS NOT NULL
    AND priority_expires_at > NOW()
  ORDER BY priority_given_at ASC
  LIMIT 1;
  
  IF v_priority_user_id IS NOT NULL AND v_priority_user_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Someone else has priority to claim this respawn');
  END IF;
  
  -- Get user role
  SELECT role INTO v_user_role
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- Get claim duration based on role
  IF v_user_role = 'guild' THEN
    SELECT setting_value::INTEGER INTO v_duration_hours
    FROM public.system_settings WHERE setting_key = 'guild_claim_hours';
    SELECT setting_value::INTEGER INTO v_duration_minutes
    FROM public.system_settings WHERE setting_key = 'guild_claim_minutes';
  ELSE
    SELECT setting_value::INTEGER INTO v_duration_hours
    FROM public.system_settings WHERE setting_key = 'neutro_claim_hours';
    SELECT setting_value::INTEGER INTO v_duration_minutes
    FROM public.system_settings WHERE setting_key = 'neutro_claim_minutes';
  END IF;
  
  v_expires_at := NOW() + (v_duration_hours || ' hours')::INTERVAL + (v_duration_minutes || ' minutes')::INTERVAL;
  
  -- Create claim
  INSERT INTO public.claims (
    respawn_id,
    user_id,
    character_id,
    character_name,
    expires_at
  ) VALUES (
    p_respawn_id,
    v_user_id,
    p_character_id,
    v_character_name,
    v_expires_at
  ) RETURNING id INTO v_claim_id;
  
  -- Remove user from queue
  DELETE FROM public.respawn_queue
  WHERE respawn_id = p_respawn_id AND user_id = v_user_id;
  
  -- Mark notification as read
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = v_user_id 
    AND respawn_id = p_respawn_id 
    AND type = 'claim_ready';
  
  RETURN json_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'expires_at', v_expires_at,
    'character_name', v_character_name
  );
END;
$function$;

-- Create function to cleanup expired priorities
CREATE OR REPLACE FUNCTION public.cleanup_expired_priorities()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_expired_record RECORD;
  v_next_queue_id UUID;
  v_next_user_id UUID;
  v_respawn_name TEXT;
  v_removed_count INTEGER := 0;
BEGIN
  -- Find and process expired priorities
  FOR v_expired_record IN
    SELECT id, user_id, respawn_id, character_name
    FROM public.respawn_queue
    WHERE priority_expires_at IS NOT NULL
      AND priority_expires_at < NOW()
      AND notified = true
  LOOP
    -- Remove expired user from queue
    DELETE FROM public.respawn_queue WHERE id = v_expired_record.id;
    v_removed_count := v_removed_count + 1;
    
    -- Create notification for user who lost priority
    INSERT INTO public.notifications (user_id, title, message, type, respawn_id, expires_at)
    SELECT 
      v_expired_record.user_id,
      'Priority Lost',
      'You lost priority to claim ' || r.name || ' (time expired)',
      'priority_lost',
      v_expired_record.respawn_id,
      NOW() + INTERVAL '1 hour'
    FROM public.respawns r
    WHERE r.id = v_expired_record.respawn_id;
    
    -- Give priority to next person
    SELECT id, user_id INTO v_next_queue_id, v_next_user_id
    FROM public.respawn_queue
    WHERE respawn_id = v_expired_record.respawn_id
    ORDER BY joined_at ASC
    LIMIT 1;
    
    IF v_next_queue_id IS NOT NULL THEN
      UPDATE public.respawn_queue
      SET notified = true,
          priority_given_at = NOW(),
          priority_expires_at = NOW() + INTERVAL '5 minutes'
      WHERE id = v_next_queue_id;
      
      -- Get respawn name and create notification
      SELECT name INTO v_respawn_name
      FROM public.respawns
      WHERE id = v_expired_record.respawn_id;
      
      INSERT INTO public.notifications (user_id, title, message, type, respawn_id, expires_at)
      VALUES (
        v_next_user_id,
        'It''s your turn!',
        'You have 5 minutes to claim ' || v_respawn_name,
        'claim_ready',
        v_expired_record.respawn_id,
        NOW() + INTERVAL '5 minutes'
      );
    END IF;
  END LOOP;
  
  RETURN json_build_object('success', true, 'removed_count', v_removed_count);
END;
$function$;

-- Create function to handle expired claims
CREATE OR REPLACE FUNCTION public.handle_expired_claims()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_expired_claim RECORD;
  v_next_queue_id UUID;
  v_next_user_id UUID;
  v_respawn_name TEXT;
  v_expired_count INTEGER := 0;
BEGIN
  -- Find and process expired claims
  FOR v_expired_claim IN
    SELECT c.id, c.user_id, c.respawn_id, r.name as respawn_name
    FROM public.claims c
    JOIN public.respawns r ON c.respawn_id = r.id
    WHERE c.expires_at < NOW()
      AND c.is_active = true
  LOOP
    -- Release the claim
    UPDATE public.claims
    SET is_active = false,
        released_at = NOW()
    WHERE id = v_expired_claim.id;
    
    v_expired_count := v_expired_count + 1;
    
    -- Notify user their claim expired
    INSERT INTO public.notifications (user_id, title, message, type, respawn_id, expires_at)
    VALUES (
      v_expired_claim.user_id,
      'Claim Expired',
      'Your claim on ' || v_expired_claim.respawn_name || ' has expired',
      'claim_expired',
      v_expired_claim.respawn_id,
      NOW() + INTERVAL '1 hour'
    );
    
    -- Give priority to next person in queue
    SELECT id, user_id INTO v_next_queue_id, v_next_user_id
    FROM public.respawn_queue
    WHERE respawn_id = v_expired_claim.respawn_id
    ORDER BY joined_at ASC
    LIMIT 1;
    
    IF v_next_queue_id IS NOT NULL THEN
      UPDATE public.respawn_queue
      SET notified = true,
          priority_given_at = NOW(),
          priority_expires_at = NOW() + INTERVAL '5 minutes'
      WHERE id = v_next_queue_id;
      
      INSERT INTO public.notifications (user_id, title, message, type, respawn_id, expires_at)
      VALUES (
        v_next_user_id,
        'It''s your turn!',
        'You have 5 minutes to claim ' || v_expired_claim.respawn_name,
        'claim_ready',
        v_expired_claim.respawn_id,
        NOW() + INTERVAL '5 minutes'
      );
    END IF;
  END LOOP;
  
  RETURN json_build_object('success', true, 'expired_count', v_expired_count);
END;
$function$;

-- Update leave_respawn_queue to handle priority transfer
CREATE OR REPLACE FUNCTION public.leave_respawn_queue(p_respawn_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_had_priority BOOLEAN;
  v_next_queue_id UUID;
  v_next_user_id UUID;
  v_respawn_name TEXT;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if user had priority
  SELECT (priority_expires_at IS NOT NULL AND priority_expires_at > NOW()) INTO v_had_priority
  FROM public.respawn_queue
  WHERE respawn_id = p_respawn_id AND user_id = v_user_id;
  
  -- Delete from queue
  DELETE FROM public.respawn_queue
  WHERE respawn_id = p_respawn_id AND user_id = v_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'You are not in the queue for this respawn');
  END IF;
  
  -- Clear notifications
  DELETE FROM public.notifications
  WHERE user_id = v_user_id AND respawn_id = p_respawn_id AND is_read = false;
  
  -- If user had priority, give it to next person
  IF v_had_priority THEN
    SELECT id, user_id INTO v_next_queue_id, v_next_user_id
    FROM public.respawn_queue
    WHERE respawn_id = p_respawn_id
    ORDER BY joined_at ASC
    LIMIT 1;
    
    IF v_next_queue_id IS NOT NULL THEN
      UPDATE public.respawn_queue
      SET notified = true,
          priority_given_at = NOW(),
          priority_expires_at = NOW() + INTERVAL '5 minutes'
      WHERE id = v_next_queue_id;
      
      SELECT name INTO v_respawn_name FROM public.respawns WHERE id = p_respawn_id;
      
      INSERT INTO public.notifications (user_id, title, message, type, respawn_id, expires_at)
      VALUES (
        v_next_user_id,
        'It''s your turn!',
        'You have 5 minutes to claim ' || v_respawn_name,
        'claim_ready',
        p_respawn_id,
        NOW() + INTERVAL '5 minutes'
      );
    END IF;
  END IF;
  
  RETURN json_build_object('success', true);
END;
$function$;