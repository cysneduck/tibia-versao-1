-- Step 2: Assign master_admin role and set up functions and policies
-- Assign master_admin role to mateuscysne@gmail.com
UPDATE user_roles 
SET role = 'master_admin' 
WHERE user_id = '3322d5cb-2841-4291-9f9a-bcf5810ad5fb';

-- Create is_master_admin function
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
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
      AND role = 'master_admin'
  )
$$;

-- Update RLS policies for user_roles table
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

CREATE POLICY "Master admins can manage all roles"
ON user_roles
FOR ALL
USING (public.is_master_admin(auth.uid()));

CREATE POLICY "Admins can view all roles"
ON user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update neutro and guild roles"
ON user_roles
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') 
  AND role IN ('neutro', 'guild')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  AND role IN ('neutro', 'guild')
);

-- Update RLS policies for system_settings table
DROP POLICY IF EXISTS "Admins can manage settings" ON system_settings;

CREATE POLICY "Master admins can manage settings"
ON system_settings
FOR UPDATE
USING (public.is_master_admin(auth.uid()));

CREATE POLICY "Admins can view settings"
ON system_settings
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.is_master_admin(auth.uid())
);