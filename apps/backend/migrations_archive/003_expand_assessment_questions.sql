-- Migration 003: Expand Assessment Questions Table
-- Date: 2025-10-22
-- Purpose: Add wizard-specific columns to assessment_questions
-- Status: PENDING

-- Add columns to assessment_questions table
ALTER TABLE IF EXISTS assessment_questions
ADD COLUMN IF NOT EXISTS step_number INTEGER CHECK (step_number BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS section TEXT CHECK (section IN ('work_history', 'education', 'skills', 'motivations', 'constraints')),
ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'textarea', 'select', 'multiselect', 'rating', 'checkbox_array', 'date', 'email', 'open_ended')),
ADD COLUMN IF NOT EXISTS options JSONB,
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS help_text TEXT,
ADD COLUMN IF NOT EXISTS placeholder TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_questions_step
ON assessment_questions(step_number);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_section
ON assessment_questions(section);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_step
ON assessment_questions(assessment_id, step_number);

-- Add comments for documentation
COMMENT ON COLUMN assessment_questions.step_number IS 'Wizard step number (1-5)';
COMMENT ON COLUMN assessment_questions.section IS 'Section/category of the question';
COMMENT ON COLUMN assessment_questions.question_type IS 'Type of input field for this question';
COMMENT ON COLUMN assessment_questions.options IS 'JSON array of options for select/multiselect questions';
COMMENT ON COLUMN assessment_questions."order" IS 'Display order within the step/section';
COMMENT ON COLUMN assessment_questions.required IS 'Whether this question is mandatory';
COMMENT ON COLUMN assessment_questions.help_text IS 'Contextual help text shown to user';
COMMENT ON COLUMN assessment_questions.placeholder IS 'Placeholder text for input fields';
