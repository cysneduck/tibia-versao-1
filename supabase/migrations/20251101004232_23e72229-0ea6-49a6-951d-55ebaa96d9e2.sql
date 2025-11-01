-- Update handle_new_user function to assign default guild
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_default_guild_id UUID;
BEGIN
  -- Get the default guild ID
  SELECT id INTO v_default_guild_id
  FROM public.guilds
  WHERE name = 'genesis-mystian'
  LIMIT 1;

  -- Insert profile with email and default guild
  INSERT INTO public.profiles (id, email, guild_id)
  VALUES (NEW.id, NEW.email, v_default_guild_id);
  
  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'neutro');
  
  RETURN NEW;
END;
$function$;