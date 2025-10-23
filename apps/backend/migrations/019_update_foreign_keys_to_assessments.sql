-- Migration 019: Update Foreign Keys to Reference Assessments Table
-- Date: 2025-10-23
-- Purpose: Update assessment_answers and assessment_competencies to reference new assessments table
-- Status: READY FOR APPLICATION
-- Dependencies: 018_create_assessments_table.sql must be applied first

-- ============================================================================
-- UPDATE ASSESSMENT_ANSWERS TABLE FOREIGN KEY
-- ============================================================================

-- Check and drop existing foreign key if it references bilans
ALTER TABLE IF EXISTS assessment_answers
DROP CONSTRAINT IF EXISTS assessment_answers_bilan_id_fkey;

-- Drop old column if it exists
ALTER TABLE IF EXISTS assessment_answers
DROP COLUMN IF EXISTS bilan_id;

-- Ensure assessment_id column exists
ALTER TABLE IF EXISTS assessment_answers
ADD COLUMN IF NOT EXISTS assessment_id UUID;

-- Add new foreign key constraint referencing assessments
ALTER TABLE IF EXISTS assessment_answers
ADD CONSTRAINT assessment_answers_assessment_id_fkey
FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id
ON assessment_answers(assessment_id);

-- ============================================================================
-- UPDATE ASSESSMENT_COMPETENCIES TABLE FOREIGN KEY
-- ============================================================================

-- Check and drop existing foreign key if it references bilans
ALTER TABLE IF EXISTS assessment_competencies
DROP CONSTRAINT IF EXISTS assessment_competencies_bilan_id_fkey;

-- Drop old column if it exists
ALTER TABLE IF EXISTS assessment_competencies
DROP COLUMN IF EXISTS bilan_id;

-- Ensure assessment_id column exists
ALTER TABLE IF EXISTS assessment_competencies
ADD COLUMN IF NOT EXISTS assessment_id UUID;

-- Add new foreign key constraint referencing assessments
ALTER TABLE IF EXISTS assessment_competencies
ADD CONSTRAINT assessment_competencies_assessment_id_fkey
FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_assessment_competencies_assessment_id
ON assessment_competencies(assessment_id);

-- ============================================================================
-- UPDATE ASSESSMENT_DRAFTS TABLE FOREIGN KEY
-- ============================================================================

-- Check and drop existing foreign key if it exists
ALTER TABLE IF EXISTS assessment_drafts
DROP CONSTRAINT IF EXISTS assessment_drafts_bilan_id_fkey;
ALTER TABLE IF EXISTS assessment_drafts
DROP CONSTRAINT IF EXISTS assessment_drafts_assessment_id_fkey;

-- Drop old column if it exists
ALTER TABLE IF EXISTS assessment_drafts
DROP COLUMN IF EXISTS bilan_id;

-- Ensure assessment_id column exists
ALTER TABLE IF EXISTS assessment_drafts
ADD COLUMN IF NOT EXISTS assessment_id UUID;

-- Add new foreign key constraint referencing assessments
ALTER TABLE IF EXISTS assessment_drafts
ADD CONSTRAINT assessment_drafts_assessment_id_fkey
FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_assessment_drafts_assessment_id
ON assessment_drafts(assessment_id);

-- ============================================================================
-- UPDATE ASSESSMENT_QUESTIONS TABLE (if needed)
-- ============================================================================

-- Assessment questions are likely shared/static, but if they have FK to bilans, update it
ALTER TABLE IF EXISTS assessment_questions
DROP CONSTRAINT IF EXISTS assessment_questions_bilan_id_fkey;

-- Only add FK if the column exists and should reference assessments
-- (This depends on actual schema - adjust as needed)
-- ALTER TABLE assessment_questions
-- ADD CONSTRAINT assessment_questions_assessment_id_fkey
-- FOREIGN KEY (assessment_id) REFERENCES assessments(id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the foreign keys were created successfully:
-- SELECT constraint_name, table_name, column_name
-- FROM information_schema.key_column_usage
-- WHERE table_name IN ('assessment_answers', 'assessment_competencies', 'assessment_drafts')
-- ORDER BY table_name;

-- SELECT indexname FROM pg_indexes
-- WHERE tablename IN ('assessment_answers', 'assessment_competencies', 'assessment_drafts')
-- ORDER BY tablename;
