-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_admin_user_list();

-- Recreate get_admin_user_list with guild information
CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS TABLE (
  id uuid,
  email text,
  role app_role,
  active_character_id uuid,
  active_character_name text,
  guild_id uuid,
  guild_name text,
  guild_world text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins and master admins to call this function
  IF NOT is_admin_or_master(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only admins can view user list';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    COALESCE(ur.role, 'neutro'::app_role) as role,
    p.active_character_id,
    c.name as active_character_name,
    p.guild_id,
    g.name as guild_name,
    g.world as guild_world
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  LEFT JOIN public.characters c ON c.id = p.active_character_id
  LEFT JOIN public.guilds g ON g.id = p.guild_id
  ORDER BY p.email;
END;
$function$;