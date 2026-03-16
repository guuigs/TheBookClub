-- Migration: Create user_favorites table for explicit "coups de coeur"
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_favorites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 1 CHECK (position >= 1 AND position <= 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, book_id)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all favorites" ON user_favorites
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Grant access
GRANT SELECT ON user_favorites TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON user_favorites TO authenticated;

-- Comment
COMMENT ON TABLE user_favorites IS 'User favorite books (coups de coeur) - max 4 per user';
