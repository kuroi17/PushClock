-- Run this SQL in Supabase SQL Editor
-- (Supabase Dashboard → SQL Editor → New Query → Paste and Run)

CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repo_path TEXT NOT NULL,
  branch TEXT NOT NULL,
  push_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'error', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries on push_time
CREATE INDEX IF NOT EXISTS idx_schedules_push_time ON schedules(push_time);

-- Create an index for status queries
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);

-- Enable Row Level Security (RLS) - optional for now, can enable later
-- ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
