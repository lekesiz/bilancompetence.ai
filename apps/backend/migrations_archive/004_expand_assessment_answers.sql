-- Migration 004: Expand Assessment Answers Table
-- Date: 2025-10-22
-- Purpose: Add wizard-specific columns to assessment_answers
-- Status: PENDING

-- Add columns to assessment_answers table
ALTER TABLE IF EXISTS assessment_answers
ADD COLUMN IF NOT EXISTS step_number INTEGER CHECK (step_number BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS section TEXT CHECK (section IN ('work_history', 'education', 'skills', 'motivations', 'constraints')),
ADD COLUMN IF NOT EXISTS answer_type TEXT DEFAULT 'text' CHECK (answer_type IN ('text', 'textarea', 'select', 'multiselect', 'rating', 'checkbox_array', 'date', 'email', 'json'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_answers_step
ON assessment_answers(step_number);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_section
ON assessment_answers(section);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_section
ON assessment_answers(assessment_id, section);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_question
ON assessment_answers(question_id);

-- Add comments for documentation
COMMENT ON COLUMN assessment_answers.step_number IS 'Wizard step number where this answer was submitted (1-5)';
COMMENT ON COLUMN assessment_answers.section IS 'Section/category of the question being answered';
COMMENT ON COLUMN assessment_answers.answer_type IS 'Type of the answer value';
