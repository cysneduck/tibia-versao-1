-- Update claim_respawn function to handle all role durations correctly
CREATE OR REPLACE FUNCTION public.claim_respawn(p_respawn_id uuid, p_character_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_character_name TEXT;
  v_claim_duration INTERVAL;
  v_has_priority BOOLEAN;
  v_priority_user_id UUID;
  v_existing_claim_id UUID;
BEGIN
  -- Get the user ID from auth context
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if user already has an active claim
  SELECT id INTO v_existing_claim_id
  FROM claims
  WHERE user_id = v_user_id
    AND is_active = true
    AND expires_at > NOW();
    
  IF v_existing_claim_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You already have an active claim');
  END IF;
  
  -- Get character name
  SELECT name INTO v_character_name
  FROM characters
  WHERE id = p_character_id AND user_id = v_user_id;
  
  IF v_character_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Character not found or does not belong to user');
  END IF;
  
  -- Check if there's already an active claim on this respawn
  SELECT id INTO v_existing_claim_id
  FROM claims
  WHERE respawn_id = p_respawn_id
    AND is_active = true
    AND expires_at > NOW();
    
  IF v_existing_claim_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'This respawn is already claimed');
  END IF;
  
  -- Check if someone has priority for this respawn
  SELECT user_id INTO v_priority_user_id
  FROM respawn_queue
  WHERE respawn_id = p_respawn_id
    AND priority_expires_at > NOW()
  ORDER BY priority_given_at
  LIMIT 1;
  
  -- If someone else has priority, prevent claim
  IF v_priority_user_id IS NOT NULL AND v_priority_user_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Someone else has priority to claim this respawn');
  END IF;
  
  -- Check if current user has priority
  v_has_priority := (v_priority_user_id = v_user_id);
  
  -- Get claim duration from user role
  -- Guild, Admin, and Master Admin: 2 hours 30 minutes
  -- Neutro: 1 hour 15 minutes
  SELECT 
    CASE 
      WHEN ur.role IN ('guild', 'admin', 'master_admin') THEN INTERVAL '2 hours 30 minutes'
      ELSE INTERVAL '1 hour 15 minutes'
    END INTO v_claim_duration
  FROM user_roles ur
  WHERE ur.user_id = v_user_id;
  
  -- Default to neutro duration if no role found
  IF v_claim_duration IS NULL THEN
    v_claim_duration := INTERVAL '1 hour 15 minutes';
  END IF;
  
  -- Create the claim
  INSERT INTO claims (
    respawn_id,
    user_id,
    character_id,
    character_name,
    expires_at,
    is_active
  ) VALUES (
    p_respawn_id,
    v_user_id,
    p_character_id,
    v_character_name,
    NOW() + v_claim_duration,
    true
  );
  
  -- Remove user from queue for this respawn
  DELETE FROM respawn_queue
  WHERE respawn_id = p_respawn_id
    AND user_id = v_user_id;
  
  -- If there are people in queue, give priority to the next person
  UPDATE respawn_queue
  SET 
    priority_given_at = NOW(),
    priority_expires_at = NOW() + INTERVAL '5 minutes',
    notified = true
  WHERE id = (
    SELECT id
    FROM respawn_queue
    WHERE respawn_id = p_respawn_id
      AND priority_expires_at IS NULL
    ORDER BY joined_at
    LIMIT 1
  );
  
  RETURN json_build_object('success', true);
END;
$function$;