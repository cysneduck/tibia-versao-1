-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'guild', 'neutro');

-- Create user_roles table with proper security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'neutro',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  active_character_id UUID,
  email_notifications BOOLEAN DEFAULT true,
  claim_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create characters table
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER,
  vocation TEXT CHECK (vocation IN ('EK', 'RP', 'ED', 'MS', '')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Add foreign key for active character
ALTER TABLE public.profiles 
  ADD CONSTRAINT fk_active_character 
  FOREIGN KEY (active_character_id) 
  REFERENCES public.characters(id) 
  ON DELETE SET NULL;

CREATE POLICY "Users can view their own characters"
  ON public.characters FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own characters"
  ON public.characters FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all characters"
  ON public.characters FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view character names for claims"
  ON public.characters FOR SELECT
  TO authenticated
  USING (true);

-- Create respawns table (master list)
CREATE TABLE public.respawns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.respawns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view respawns"
  ON public.respawns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage respawns"
  ON public.respawns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respawn_id UUID REFERENCES public.respawns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE NOT NULL,
  character_name TEXT NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claims_respawn_active ON public.claims(respawn_id, is_active) WHERE is_active = true;
CREATE INDEX idx_claims_user ON public.claims(user_id);
CREATE INDEX idx_claims_expires ON public.claims(expires_at) WHERE is_active = true;

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active claims"
  ON public.claims FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create their own claims"
  ON public.claims FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own claims"
  ON public.claims FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all claims"
  ON public.claims FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
  ('guild_claim_hours', '2'),
  ('guild_claim_minutes', '15'),
  ('neutro_claim_hours', '1'),
  ('neutro_claim_minutes', '15');

-- Auto-create profile and assign neutro role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'neutro');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply timestamp triggers to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.respawns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to claim a respawn with validation
CREATE OR REPLACE FUNCTION public.claim_respawn(
  p_respawn_id UUID,
  p_character_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_character_name TEXT;
  v_user_role app_role;
  v_duration_hours INTEGER;
  v_duration_minutes INTEGER;
  v_expires_at TIMESTAMPTZ;
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
$$;

-- Function to release a claim
CREATE OR REPLACE FUNCTION public.release_claim(p_claim_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
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
  
  -- Release the claim
  UPDATE public.claims
  SET is_active = false,
      released_at = NOW()
  WHERE id = p_claim_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Seed respawns data
INSERT INTO public.respawns (code, name, city) VALUES
  ('B17', 'Cobra Bastion', 'Ankrahmun'),
  ('C5', 'Secret Library (Fire Area)', 'Carlin'),
  ('C7', 'Secret Library (Energy Area)', 'Carlin'),
  ('X2', 'Inqol -2', 'Cormaya'),
  ('X3', 'Inqol -3', 'Cormaya'),
  ('D19', 'Ferumbra''s Lair (Entrance)', 'Darashia'),
  ('D20', 'Ferumbra''s Plague Seal - 2', 'Darashia'),
  ('D21', 'Ferumbra''s Plague Seal - 1', 'Darashia'),
  ('E29', 'Falcon Bastion', 'Edron'),
  ('K12', 'Ruins of Nuur (Blu)', 'Issavi'),
  ('K13', 'Salt Caves (Bashmu)', 'Issavi'),
  ('P19', 'True Asura -1', 'Port Hope'),
  ('P20', 'True Asura -2', 'Port Hope'),
  ('Q3', 'Guzzlemaw Valley (East)', 'Roshamuul'),
  ('Q4', 'Guzzlemaw Valley (West)', 'Roshamuul'),
  ('T13', 'Flimsy -1', 'Venore'),
  ('T14', 'Flimsy -2', 'Venore'),
  ('U5', 'Warzone 3', 'Warzone'),
  ('U16', 'Warzone 7 -1', 'Warzone'),
  ('U17', 'Warzone 7 -2', 'Warzone'),
  ('U18', 'Warzone 8', 'Warzone');

-- Enable realtime for claims table
ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;