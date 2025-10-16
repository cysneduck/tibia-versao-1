-- Create helper function to check if user is admin or master_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_master(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'master_admin'::app_role)
  )
$$;

-- Drop the old policy that only checked for 'admin'
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new policy that allows both admin and master_admin to view all profiles
CREATE POLICY "Admins and master admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_admin_or_master(auth.uid()));