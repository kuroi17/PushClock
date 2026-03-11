-- Phase 5: Rollback/Undo Merge Feature
-- Run this SQL in Supabase SQL Editor

BEGIN;

-- Add merge_commit_sha column to store the merge commit SHA for rollback
ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS merge_commit_sha TEXT;

-- Add revert_commit_sha column to store the revert commit SHA after rollback
ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS revert_commit_sha TEXT;

-- Add rollback_at timestamp to track when rollback was performed
ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS rollback_at TIMESTAMP WITH TIME ZONE;

-- Update status constraint to include rollback-related statuses
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS schedules_status_check;
ALTER TABLE public.schedules ADD CONSTRAINT schedules_status_check 
  CHECK (status IN ('scheduled', 'active', 'paused', 'in-progress', 'completed', 'error', 'cancelled', 'rollback-completed'));

-- Create index for merge_commit_sha queries (for rollback lookups)
CREATE INDEX IF NOT EXISTS idx_schedules_merge_commit_sha ON public.schedules(merge_commit_sha);

-- Add comments for documentation
COMMENT ON COLUMN public.schedules.merge_commit_sha IS 'SHA of the merge commit created by GitHub API (required for rollback)';
COMMENT ON COLUMN public.schedules.revert_commit_sha IS 'SHA of the revert commit created during rollback';
COMMENT ON COLUMN public.schedules.rollback_at IS 'Timestamp when the rollback was performed';

COMMIT;
