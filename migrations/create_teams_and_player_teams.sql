-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on team name for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read teams (for public display)
CREATE POLICY "Allow public to read teams"
  ON teams
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins and super_admins can insert teams
CREATE POLICY "Only admins can insert teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND role IN ('super_admin', 'admin')
    )
  );

-- Policy: Only admins and super_admins can update teams
CREATE POLICY "Only admins can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND role IN ('super_admin', 'admin')
    )
  );

-- Policy: Only admins and super_admins can delete teams
CREATE POLICY "Only admins can delete teams"
  ON teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND role IN ('super_admin', 'admin')
    )
  );

-- Create player_teams junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS player_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, team_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_player_teams_player_id ON player_teams(player_id);
CREATE INDEX IF NOT EXISTS idx_player_teams_team_id ON player_teams(team_id);

-- Enable Row Level Security
ALTER TABLE player_teams ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read player_teams (for public display)
CREATE POLICY "Allow public to read player_teams"
  ON player_teams
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Only admins and super_admins can manage player_teams
CREATE POLICY "Only admins can insert player_teams"
  ON player_teams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only admins can delete player_teams"
  ON player_teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
      AND role IN ('super_admin', 'admin')
    )
  );

-- Create a function to update the updated_at timestamp for teams
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

-- Insert initial teams
INSERT INTO teams (name, description) VALUES
  ('Overwatch', 'Competitive Overwatch team'),
  ('League of Legends', 'Competitive League of Legends team')
ON CONFLICT (name) DO NOTHING;

-- Migrate existing player team data to the new structure
-- This will create team entries and link players to teams based on the old 'team' varchar column
DO $$
DECLARE
  team_record RECORD;
  player_record RECORD;
  team_uuid UUID;
BEGIN
  -- For each player with a team value
  FOR player_record IN
    SELECT id, team FROM players WHERE team IS NOT NULL AND team != ''
  LOOP
    -- Get or create the team
    SELECT id INTO team_uuid FROM teams WHERE name = player_record.team;

    -- If team doesn't exist, create it
    IF team_uuid IS NULL THEN
      INSERT INTO teams (name, description)
      VALUES (player_record.team, 'Team created from player migration')
      RETURNING id INTO team_uuid;
    END IF;

    -- Link player to team (ignore if already exists)
    INSERT INTO player_teams (player_id, team_id)
    VALUES (player_record.id, team_uuid)
    ON CONFLICT (player_id, team_id) DO NOTHING;
  END LOOP;
END $$;
