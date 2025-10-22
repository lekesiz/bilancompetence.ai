-- Migration 006: Create Assessment Drafts Table
-- Date: 2025-10-22
-- Purpose: Store auto-save drafts for wizard in-progress work
-- Status: PENDING

-- Create assessment_drafts table
CREATE TABLE IF NOT EXISTS assessment_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,

  -- Draft progress tracking
  current_step_number INTEGER DEFAULT 0 CHECK (current_step_number BETWEEN 0 AND 5),

  -- Actual draft data stored as JSONB
  -- Structure: { step1: {...}, step2: {...}, ..., step5: {...} }
  draft_data JSONB NOT NULL DEFAULT '{}',

  -- Auto-save configuration
  auto_save_enabled BOOLEAN DEFAULT true,

  -- Metadata
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_assessment_drafts_assessment_id
ON assessment_drafts(assessment_id);

CREATE INDEX idx_assessment_drafts_last_saved
ON assessment_drafts(last_saved_at);

CREATE INDEX idx_assessment_drafts_current_step
ON assessment_drafts(current_step_number);

-- Add comments for documentation
COMMENT ON TABLE assessment_drafts IS 'Stores auto-save drafts for assessments in progress';
COMMENT ON COLUMN assessment_drafts.id IS 'Unique identifier';
COMMENT ON COLUMN assessment_drafts.assessment_id IS 'Foreign key to assessments table (one-to-one)';
COMMENT ON COLUMN assessment_drafts.current_step_number IS 'Current step being edited (0-5)';
COMMENT ON COLUMN assessment_drafts.draft_data IS 'JSON object containing all step data and form responses';
COMMENT ON COLUMN assessment_drafts.auto_save_enabled IS 'Whether auto-save is enabled for this assessment';
COMMENT ON COLUMN assessment_drafts.last_saved_at IS 'Timestamp of last auto-save';
COMMENT ON COLUMN assessment_drafts.created_at IS 'Timestamp when draft was created';
COMMENT ON COLUMN assessment_drafts.updated_at IS 'Timestamp of last update';

-- Create a trigger to update updated_at and last_saved_at
CREATE OR REPLACE FUNCTION update_assessment_drafts_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_saved_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assessment_drafts_timestamps ON assessment_drafts;
CREATE TRIGGER trigger_assessment_drafts_timestamps
BEFORE UPDATE ON assessment_drafts
FOR EACH ROW
EXECUTE FUNCTION update_assessment_drafts_timestamps();

-- Example draft_data structure (for documentation):
-- {
--   "step1": {
--     "section": "work_history",
--     "answers": {
--       "question_id_1": "Value 1",
--       "question_id_2": "Value 2"
--     }
--   },
--   "step2": {
--     "section": "education",
--     "answers": {...}
--   },
--   ...
-- }
