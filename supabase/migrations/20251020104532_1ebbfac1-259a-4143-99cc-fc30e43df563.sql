-- Add email back to profiles with strict RLS for admin-only access
ALTER TABLE public.profiles ADD COLUMN email text;

-- Update handle_new_user to sync email from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'neutro');
  
  RETURN NEW;
END;
$function$;

-- Update ensure_user_data to sync email
CREATE OR REPLACE FUNCTION public.ensure_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_email text;
BEGIN
  -- Get email from auth.users
  SELECT email INTO v_email FROM auth.users WHERE id = p_user_id;
  
  -- Insert profile with email if missing
  INSERT INTO public.profiles (id, email)
  VALUES (p_user_id, v_email)
  ON CONFLICT (id) DO UPDATE SET email = v_email;
  
  -- Insert role if missing
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'neutro'::app_role)
  ON CONFLICT (user_id) DO NOTHING;
END;
$function$;

-- Update get_admin_user_list to use profiles.email
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
    p.email,
    COALESCE(ur.role, 'neutro'::app_role) as role,
    p.active_character_id,
    c.name as active_character_name
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  LEFT JOIN public.characters c ON c.id = p.active_character_id
  ORDER BY p.email;
END;
$function$;

-- Add RLS policy: only admins can see email column
CREATE POLICY "Only admins can view user emails" ON public.profiles
FOR SELECT
USING (
  is_admin_or_master(auth.uid()) OR id = auth.uid()
);

-- Sync existing user emails from auth.users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email 
    FROM auth.users au
    JOIN public.profiles p ON p.id = au.id
  LOOP
    UPDATE public.profiles 
    SET email = user_record.email 
    WHERE id = user_record.id;
  END LOOP;
END $$;