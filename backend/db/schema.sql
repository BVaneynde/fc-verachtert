-- FC Verachtert Wedstrijdtracker Database Schema
-- Run this in Supabase SQL editor to set up the database

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  number INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP NOT NULL,
  opponent VARCHAR(255) NOT NULL,
  score_home INT,
  score_away INT,
  location VARCHAR(255),
  notes TEXT,
  is_official_match BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match appearances table (speler aanwezigheid per wedstrijd)
CREATE TABLE IF NOT EXISTS match_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  was_present BOOLEAN DEFAULT false,
  goals INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, player_id)
);

-- Calendar events table (voor Google Calendar sync)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_event_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  event_date TIMESTAMP NOT NULL,
  is_match BOOLEAN DEFAULT false,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_match_appearances_match ON match_appearances(match_id);
CREATE INDEX IF NOT EXISTS idx_match_appearances_player ON match_appearances(player_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access to matches, players, stats
CREATE POLICY "Allow public read access to matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to players" ON players
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to match_appearances" ON match_appearances
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to calendar_events" ON calendar_events
  FOR SELECT USING (true);

-- Admin-only write access (will be enforced via backend)
CREATE POLICY "Allow authenticated admin to write matches" ON matches
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated admin to write players" ON players
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated admin to write match_appearances" ON match_appearances
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated admin to write calendar_events" ON calendar_events
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Initial admin users (replace with real emails)
-- These will be created via admin setup endpoint
-- INSERT INTO users (email, password_hash, role) VALUES 
-- ('benjamin@fcverachtert.be', 'hashed_password', 'admin'),
-- ('lander@fcverachtert.be', 'hashed_password', 'admin');

-- Initial players data
INSERT INTO players (name, is_active) VALUES 
  ('Tijs', true),
  ('Nathan', true),
  ('Remko', true),
  ('Lander T', true),
  ('Lander V', true),
  ('Benjamin', true),
  ('Tom', true),
  ('Niels', true),
  ('Stef B', true),
  ('Putte', true),
  ('Simon', true),
  ('Karel', true),
  ('Floure', true),
  ('Stan', true),
  ('Jelle', true),
  ('Lukas', true),
  ('Geert', true),
  ('Wout', true),
  ('Jorrit', true),
  ('Arne', true),
  ('Lennert', true),
  ('Jens', true)
ON CONFLICT DO NOTHING;
