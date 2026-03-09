-- Phase 1: Add Users Table and Update Schedules
-- Run this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- Add user_id column to schedules table
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for user_id in schedules
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);

-- Make repo_path nullable (will be replaced with GitHub repo URL later)
ALTER TABLE schedules ALTER COLUMN repo_path DROP NOT NULL;

-- Add github_repo_url column for future use
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS github_repo_url TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS repo_owner TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS repo_name TEXT;

-- Optional: Enable Row Level Security (commented out for now)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Optional: Create policy for users to only see their own data
-- CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can view own schedules" ON schedules FOR SELECT USING (auth.uid() = user_id);
