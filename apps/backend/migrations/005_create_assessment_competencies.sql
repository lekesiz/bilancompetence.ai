-- Migration 005: Create Assessment Competencies Table
-- Date: 2025-10-22
-- Purpose: Store detailed competency/skill assessments for each bilan
-- Status: PENDING

-- Create assessment_competencies table
CREATE TABLE IF NOT EXISTS assessment_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'soft', 'language', 'other')),

  -- Self-assessment fields
  self_assessment_level INTEGER CHECK (self_assessment_level BETWEEN 1 AND 4), -- 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert
  self_interest_level INTEGER CHECK (self_interest_level BETWEEN 1 AND 10),
  context TEXT, -- Where learned, how used, etc.

  -- Consultant validation fields
  consultant_assessment_level INTEGER CHECK (consultant_assessment_level BETWEEN 1 AND 4),
  consultant_notes TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure assessment_id + skill_name are unique per assessment
  UNIQUE(assessment_id, skill_name)
);

-- Create indexes for performance
CREATE INDEX idx_assessment_competencies_assessment_id
ON assessment_competencies(assessment_id);

CREATE INDEX idx_assessment_competencies_category
ON assessment_competencies(category);

CREATE INDEX idx_assessment_competencies_skill_name
ON assessment_competencies(skill_name);

CREATE INDEX idx_assessment_competencies_assessment_category
ON assessment_competencies(assessment_id, category);

-- Add comments for documentation
COMMENT ON TABLE assessment_competencies IS 'Stores detailed competency/skill assessments for each bilan';
COMMENT ON COLUMN assessment_competencies.id IS 'Unique identifier';
COMMENT ON COLUMN assessment_competencies.assessment_id IS 'Foreign key to assessments table';
COMMENT ON COLUMN assessment_competencies.skill_name IS 'Name/title of the skill or competency';
COMMENT ON COLUMN assessment_competencies.category IS 'Category of competency (technical, soft, language, other)';
COMMENT ON COLUMN assessment_competencies.self_assessment_level IS 'Beneficiary''s self-rated level (1-4)';
COMMENT ON COLUMN assessment_competencies.self_interest_level IS 'Beneficiary''s interest in this skill (1-10)';
COMMENT ON COLUMN assessment_competencies.context IS 'Additional context about how/where skill was learned or used';
COMMENT ON COLUMN assessment_competencies.consultant_assessment_level IS 'Consultant''s assessment of the skill level (1-4)';
COMMENT ON COLUMN assessment_competencies.consultant_notes IS 'Consultant''s observations or feedback';
COMMENT ON COLUMN assessment_competencies.validated_at IS 'Timestamp when consultant validated this competency';
COMMENT ON COLUMN assessment_competencies.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN assessment_competencies.updated_at IS 'Timestamp of last update';

-- Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_assessment_competencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assessment_competencies_updated_at ON assessment_competencies;
CREATE TRIGGER trigger_assessment_competencies_updated_at
BEFORE UPDATE ON assessment_competencies
FOR EACH ROW
EXECUTE FUNCTION update_assessment_competencies_updated_at();
