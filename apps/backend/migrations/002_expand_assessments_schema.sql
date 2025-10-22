-- Migration 002: Expand Assessments Schema for Wizard
-- Date: 2025-10-22
-- Purpose: Add wizard-specific columns to assessments table
-- Status: PENDING

-- Add columns to assessments table for wizard tracking
ALTER TABLE IF EXISTS assessments
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_status_beneficiary
ON assessments(status, beneficiary_id);

CREATE INDEX IF NOT EXISTS idx_assessments_current_step
ON assessments(current_step);

CREATE INDEX IF NOT EXISTS idx_assessments_progress
ON assessments(progress_percentage);

-- Add comment for documentation
COMMENT ON COLUMN assessments.current_step IS 'Current step in the wizard (0-5)';
COMMENT ON COLUMN assessments.progress_percentage IS 'Overall completion percentage (0-100)';
COMMENT ON COLUMN assessments.submitted_at IS 'Timestamp when assessment was submitted for review';
COMMENT ON COLUMN assessments.completed_at IS 'Timestamp when assessment was fully completed';
