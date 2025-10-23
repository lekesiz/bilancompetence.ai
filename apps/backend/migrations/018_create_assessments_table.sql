-- Migration 018: Create Assessments Table for Assessment Wizard
-- Date: 2025-10-23
-- Purpose: Create dedicated table for Assessment Wizard (Y2) functionality
-- Status: READY FOR APPLICATION
-- Dependencies: 001_create_schema.sql (users table must exist)

-- ============================================================================
-- CREATE ASSESSMENTS TABLE (NEW)
-- ============================================================================
-- This table is dedicated to Assessment Wizard functionality
-- Separate from 'bilans' table which handles traditional consulting processes

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User relationships
  beneficiary_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID,  -- Optional for standalone assessments

  -- Assessment properties
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assessment_type VARCHAR(50) NOT NULL DEFAULT 'career',

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  current_step INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Timeline
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_assessments_beneficiary ON assessments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_assessments_consultant ON assessments(consultant_id);

-- Filter indexes
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_assessment_type ON assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessments_current_step ON assessments(current_step);

-- Progress indexes
CREATE INDEX IF NOT EXISTS idx_assessments_progress ON assessments(progress_percentage);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_assessments_submitted ON assessments(submitted_at);
CREATE INDEX IF NOT EXISTS idx_assessments_completed ON assessments(completed_at);

-- Combined indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assessments_beneficiary_status
ON assessments(beneficiary_id, status);

CREATE INDEX IF NOT EXISTS idx_assessments_beneficiary_type
ON assessments(beneficiary_id, assessment_type);

CREATE INDEX IF NOT EXISTS idx_assessments_status_progress
ON assessments(status, progress_percentage);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own assessments (as beneficiary)
CREATE POLICY IF NOT EXISTS assessments_beneficiary_read
ON assessments FOR SELECT
USING (beneficiary_id = auth.uid());

-- Policy: Consultants can view assessments they're assigned to
CREATE POLICY IF NOT EXISTS assessments_consultant_read
ON assessments FOR SELECT
USING (consultant_id = auth.uid() OR beneficiary_id = auth.uid());

-- Policy: Users can only insert their own assessments
CREATE POLICY IF NOT EXISTS assessments_beneficiary_create
ON assessments FOR INSERT
WITH CHECK (beneficiary_id = auth.uid());

-- Policy: Users can only update their own assessments
CREATE POLICY IF NOT EXISTS assessments_beneficiary_update
ON assessments FOR UPDATE
USING (beneficiary_id = auth.uid())
WITH CHECK (beneficiary_id = auth.uid());

-- Policy: Users can only delete their own assessments
CREATE POLICY IF NOT EXISTS assessments_beneficiary_delete
ON assessments FOR DELETE
USING (beneficiary_id = auth.uid());

-- ============================================================================
-- ADD COLUMN DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE assessments IS 'Assessment Wizard responses - Self-evaluation responses for users during 5-step wizard process';
COMMENT ON COLUMN assessments.id IS 'Unique assessment identifier';
COMMENT ON COLUMN assessments.beneficiary_id IS 'User taking the assessment (foreign key to users)';
COMMENT ON COLUMN assessments.consultant_id IS 'Consultant reviewing the assessment (optional)';
COMMENT ON COLUMN assessments.organization_id IS 'Organization context (optional)';
COMMENT ON COLUMN assessments.title IS 'Assessment title (e.g., "Career Assessment 2025")';
COMMENT ON COLUMN assessments.description IS 'Detailed description of the assessment purpose';
COMMENT ON COLUMN assessments.assessment_type IS 'Type: career, skills, or comprehensive';
COMMENT ON COLUMN assessments.status IS 'Status: DRAFT, IN_PROGRESS, SUBMITTED, COMPLETED, ARCHIVED';
COMMENT ON COLUMN assessments.current_step IS 'Current wizard step (0=not started, 1-5=step number)';
COMMENT ON COLUMN assessments.progress_percentage IS 'Completion percentage (0-100)';
COMMENT ON COLUMN assessments.started_at IS 'When assessment wizard was started';
COMMENT ON COLUMN assessments.submitted_at IS 'When assessment was submitted for review';
COMMENT ON COLUMN assessments.completed_at IS 'When assessment was finalized and closed';
COMMENT ON COLUMN assessments.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN assessments.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN assessments.deleted_at IS 'Soft delete timestamp (NULL = active)';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify the table was created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'assessments';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assessments' ORDER BY ordinal_position;
