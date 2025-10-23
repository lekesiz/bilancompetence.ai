-- Migration 018: Add Assessment Wizard Support to Bilans Table
-- Date: 2025-10-23
-- Purpose: Add columns required for Y2 Assessment Wizard functionality
-- Status: READY FOR APPLICATION
-- Dependencies: 001_create_schema.sql (bilans table must exist)

-- ============================================================================
-- ADD ASSESSMENT WIZARD COLUMNS TO BILANS TABLE
-- ============================================================================

-- Add assessment-specific columns for wizard-based assessments
ALTER TABLE IF EXISTS bilans
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS assessment_type VARCHAR(50) DEFAULT 'career',
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- MODIFY CONSTRAINTS FOR ASSESSMENT FLEXIBILITY
-- ============================================================================

-- Make start_date optional (assessments may not have traditional start dates)
ALTER TABLE IF EXISTS bilans
ALTER COLUMN start_date DROP NOT NULL;

-- Make organization_id optional (assessments might be standalone)
ALTER TABLE IF EXISTS bilans
ALTER COLUMN organization_id DROP NOT NULL;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for filtering by assessment type
CREATE INDEX IF NOT EXISTS idx_bilans_assessment_type ON bilans(assessment_type);

-- Index for filtering by current step
CREATE INDEX IF NOT EXISTS idx_bilans_current_step ON bilans(current_step);

-- Index for sorting by progress
CREATE INDEX IF NOT EXISTS idx_bilans_progress ON bilans(progress_percentage);

-- Index for finding submitted assessments
CREATE INDEX IF NOT EXISTS idx_bilans_submitted ON bilans(submitted_at);

-- Index for finding completed assessments
CREATE INDEX IF NOT EXISTS idx_bilans_completed ON bilans(completed_at);

-- Combined index for common queries
CREATE INDEX IF NOT EXISTS idx_bilans_beneficiary_status_type
ON bilans(beneficiary_id, status, assessment_type);

-- ============================================================================
-- ADD COLUMN DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN bilans.title IS 'Assessment title (required for wizard-based assessments)';
COMMENT ON COLUMN bilans.description IS 'Detailed description of the assessment';
COMMENT ON COLUMN bilans.assessment_type IS 'Type of assessment: career, skills, or comprehensive';
COMMENT ON COLUMN bilans.current_step IS 'Current step in assessment wizard (0=not started, 1-5=step number)';
COMMENT ON COLUMN bilans.progress_percentage IS 'Overall progress percentage (0-100) for wizard completion tracking';
COMMENT ON COLUMN bilans.started_at IS 'Timestamp when the assessment wizard was started';
COMMENT ON COLUMN bilans.submitted_at IS 'Timestamp when the assessment was submitted for review';
COMMENT ON COLUMN bilans.completed_at IS 'Timestamp when the assessment was fully completed and closed';

-- ============================================================================
-- VALIDATION & VERIFICATION
-- ============================================================================

-- Verify all columns exist (run this to confirm migration success)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'bilans'
-- ORDER BY ordinal_position;
