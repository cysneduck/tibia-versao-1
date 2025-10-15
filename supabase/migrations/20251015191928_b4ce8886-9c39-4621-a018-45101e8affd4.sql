-- Backfill missing profiles for users that exist in auth but not in profiles
INSERT INTO public.profiles (id, email)
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Backfill missing user_roles (default to 'neutro')
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'neutro'::app_role
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE ur.user_id IS NULL;

-- Drop and recreate trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Function to ensure user has profile and role (useful for recovery)
CREATE OR REPLACE FUNCTION public.ensure_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile if missing
  INSERT INTO public.profiles (id, email)
  SELECT p_user_id, au.email
  FROM auth.users au
  WHERE au.id = p_user_id
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert role if missing
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, 'neutro'::app_role)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;