-- Create favorite_respawns table
CREATE TABLE favorite_respawns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  respawn_id uuid NOT NULL REFERENCES respawns(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, respawn_id)
);

-- Enable RLS
ALTER TABLE favorite_respawns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own favorites"
  ON favorite_respawns FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own favorites"
  ON favorite_respawns FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own favorites"
  ON favorite_respawns FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all favorites"
  ON favorite_respawns FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE favorite_respawns;