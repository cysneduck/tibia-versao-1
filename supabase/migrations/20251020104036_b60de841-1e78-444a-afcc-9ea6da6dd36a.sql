-- Remove email column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Update handle_new_user function to not insert email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'neutro');
  
  RETURN NEW;
END;
$function$;

-- Create secure function for admins to get user data including emails
CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS TABLE (
  id uuid,
  email text,
  role app_role,
  active_character_id uuid,
  active_character_name text
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
    au.email,
    COALESCE(ur.role, 'neutro'::app_role) as role,
    p.active_character_id,
    c.name as active_character_name
  FROM public.profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  LEFT JOIN public.characters c ON c.id = p.active_character_id
  ORDER BY au.email;
END;
$function$;

-- Update ensure_user_data function to not use email
CREATE OR REPLACE FUNCTION public.ensure_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile if missing (no email needed)
  INSERT INTO public.profiles (id)
  VALUES (p_user_id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert role if missing
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'neutro'::app_role)
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;