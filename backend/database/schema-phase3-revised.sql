-- Phase 3 Revised: Branch Merge Scheduler (corrected migration)
-- Adds commit_message column, updates statuses/indexes, and adds comments

BEGIN;

-- Add source_branch and target_branch columns
ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS source_branch TEXT NOT NULL DEFAULT 'pushclock-temp';

ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS target_branch TEXT NOT NULL DEFAULT 'main';

-- Add commit_message column (nullable-> set NOT NULL with default to avoid locking large tables)
ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS commit_message TEXT DEFAULT 'Merge from source_branch';

-- If you prefer NOT NULL, set values then alter (safe path)
UPDATE public.schedules SET commit_message = 'Merge from source_branch' WHERE commit_message IS NULL;
ALTER TABLE public.schedules
  ALTER COLUMN commit_message SET NOT NULL;

-- Remove workflow_deployed column (not using GitHub Actions anymore)
ALTER TABLE public.schedules DROP COLUMN IF EXISTS workflow_deployed;

-- Update status constraint to remove workflow-related statuses
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS schedules_status_check;
ALTER TABLE public.schedules ADD CONSTRAINT schedules_status_check 
  CHECK (status IN ('scheduled', 'active', 'paused', 'completed', 'error', 'cancelled'));

-- Remove workflow-specific indexes
DROP INDEX IF EXISTS public.idx_schedules_workflow_deployed;
DROP INDEX IF EXISTS public.idx_schedules_status_workflow;

-- Create indexes for branch queries
CREATE INDEX IF NOT EXISTS idx_schedules_source_branch ON public.schedules(source_branch);
CREATE INDEX IF NOT EXISTS idx_schedules_target_branch ON public.schedules(target_branch);

-- Add comments
COMMENT ON COLUMN public.schedules.source_branch IS 'Branch to merge FROM (contains user commits pushed to GitHub)';
COMMENT ON COLUMN public.schedules.target_branch IS 'Branch to merge TO (e.g., main, master)';
COMMENT ON COLUMN public.schedules.commit_message IS 'Custom commit message for the merge commit';

COMMIT;