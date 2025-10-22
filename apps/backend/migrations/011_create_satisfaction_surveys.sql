-- Migration 011: Create Satisfaction Surveys Tables
-- Date: 2025-10-23
-- Purpose: Store satisfaction survey instances and responses for Qualiopi compliance
-- Status: NEW

-- ============================================================================
-- SATISFACTION_SURVEYS TABLE
-- ============================================================================
-- Tracks satisfaction surveys sent to beneficiaries after bilan completion
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'COMPLETED', 'EXPIRED')),
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  survey_token VARCHAR(255) UNIQUE,
  -- Token for anonymous survey link
  expires_at TIMESTAMP,
  -- Survey expiry (usually 30 days after sent)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_surveys_bilan_id ON satisfaction_surveys(bilan_id);
CREATE INDEX IF NOT EXISTS idx_surveys_beneficiary_id ON satisfaction_surveys(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_surveys_organization_id ON satisfaction_surveys(organization_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON satisfaction_surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_token ON satisfaction_surveys(survey_token);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON satisfaction_surveys(created_at);
CREATE INDEX IF NOT EXISTS idx_surveys_completed_at ON satisfaction_surveys(completed_at);

-- Add comments
COMMENT ON TABLE satisfaction_surveys IS 'Satisfaction surveys sent to beneficiaries after bilan completion';
COMMENT ON COLUMN satisfaction_surveys.status IS 'PENDING: not sent, SENT: awaiting response, COMPLETED: response received, EXPIRED: no response after deadline';
COMMENT ON COLUMN satisfaction_surveys.survey_token IS 'Anonymous token for direct survey link access';
COMMENT ON COLUMN satisfaction_surveys.expires_at IS 'Survey response deadline';

-- ============================================================================
-- SURVEY_RESPONSES TABLE
-- ============================================================================
-- Stores individual survey question responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES satisfaction_surveys(id) ON DELETE CASCADE,
  question_number INT NOT NULL CHECK (question_number >= 1 AND question_number <= 15),
  answer_type VARCHAR(50) NOT NULL CHECK (answer_type IN ('SCORE', 'TEXT', 'BOOLEAN')),
  score_value INT CHECK (score_value >= 1 AND score_value <= 10),
  -- For numeric scale questions (1-10)
  text_value TEXT,
  -- For open-ended questions
  boolean_value BOOLEAN,
  -- For yes/no questions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question ON survey_responses(question_number);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_composite ON survey_responses(survey_id, question_number);

-- Add comments
COMMENT ON TABLE survey_responses IS 'Individual responses to satisfaction survey questions';
COMMENT ON COLUMN survey_responses.question_number IS 'Question sequence number (1-15)';
COMMENT ON COLUMN survey_responses.answer_type IS 'Type of answer: SCORE (1-10), TEXT (open-ended), BOOLEAN (yes/no)';
COMMENT ON COLUMN survey_responses.score_value IS 'Numeric score for Likert-scale questions';
COMMENT ON COLUMN survey_responses.text_value IS 'Text response for open-ended questions';
COMMENT ON COLUMN survey_responses.boolean_value IS 'Boolean response for yes/no questions';

