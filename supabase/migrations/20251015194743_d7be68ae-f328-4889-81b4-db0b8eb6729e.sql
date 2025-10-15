-- Update claim_respawn function to enforce one active claim per user
CREATE OR REPLACE FUNCTION public.claim_respawn(p_respawn_id uuid, p_character_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  
  -- Check if respawn is already claimed
  SELECT id INTO v_existing_claim
  FROM public.claims
  WHERE respawn_id = p_respawn_id
    AND is_active = true
    AND expires_at > NOW();
  
  IF v_existing_claim IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Respawn is already claimed');
  END IF;
  
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
  
  RETURN json_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'expires_at', v_expires_at,
    'character_name', v_character_name
  );
END;
$function$;