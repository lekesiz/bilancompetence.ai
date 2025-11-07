-- Migration 020: Create AI-related tables
-- Date: 2025-10-25
-- Purpose: Create tables for AI features (CV analysis, job recommendations, personality analysis, action plans)
-- Dependencies: 001_create_schema.sql (assessments table must exist)

-- ============================================================================
-- CV ANALYSES TABLE
-- ============================================================================
-- Stores AI-powered CV analysis results
CREATE TABLE IF NOT EXISTS cv_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  cv_text TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups by assessment
CREATE INDEX IF NOT EXISTS idx_cv_analyses_assessment ON cv_analyses(assessment_id);

-- Index for searching within analysis results
CREATE INDEX IF NOT EXISTS idx_cv_analyses_result ON cv_analyses USING GIN (analysis_result);

-- ============================================================================
-- JOB RECOMMENDATIONS TABLE
-- ============================================================================
-- Stores AI-generated job recommendations based on user profile
CREATE TABLE IF NOT EXISTS job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  recommendations_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups by assessment
CREATE INDEX IF NOT EXISTS idx_job_recommendations_assessment ON job_recommendations(assessment_id);

-- Index for searching within recommendations
CREATE INDEX IF NOT EXISTS idx_job_recommendations_data ON job_recommendations USING GIN (recommendations_data);

-- ============================================================================
-- PERSONALITY ANALYSES TABLE
-- ============================================================================
-- Stores AI-powered personality analysis based on MBTI and RIASEC results
CREATE TABLE IF NOT EXISTS personality_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  mbti_type VARCHAR(4),
  riasec_scores JSONB,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_mbti_type CHECK (
    mbti_type IS NULL OR 
    mbti_type ~ '^[EI][NS][TF][JP]$'
  )
);

-- Index for faster lookups by assessment
CREATE INDEX IF NOT EXISTS idx_personality_analyses_assessment ON personality_analyses(assessment_id);

-- Index for filtering by MBTI type
CREATE INDEX IF NOT EXISTS idx_personality_analyses_mbti ON personality_analyses(mbti_type);

-- Index for searching within RIASEC scores
CREATE INDEX IF NOT EXISTS idx_personality_analyses_riasec ON personality_analyses USING GIN (riasec_scores);

-- ============================================================================
-- ACTION PLANS TABLE
-- ============================================================================
-- Stores AI-generated personalized action plans
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  target_job VARCHAR(255) NOT NULL,
  plan_data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action_plan_status CHECK (
    status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')
  )
);

-- Index for faster lookups by assessment
CREATE INDEX IF NOT EXISTS idx_action_plans_assessment ON action_plans(assessment_id);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);

-- Index for searching within plan data
CREATE INDEX IF NOT EXISTS idx_action_plans_data ON action_plans USING GIN (plan_data);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE cv_analyses IS 'Stores AI-powered CV analysis results using Gemini API';
COMMENT ON COLUMN cv_analyses.cv_text IS 'Raw text extracted from uploaded CV (PDF/DOC)';
COMMENT ON COLUMN cv_analyses.analysis_result IS 'JSON object containing competences, experiences, formations, langues, soft_skills';

COMMENT ON TABLE job_recommendations IS 'Stores AI-generated job recommendations based on user competences and interests';
COMMENT ON COLUMN job_recommendations.recommendations_data IS 'JSON array of recommended jobs with match scores and requirements';

COMMENT ON TABLE personality_analyses IS 'Stores AI-powered personality analysis based on MBTI and RIASEC test results';
COMMENT ON COLUMN personality_analyses.mbti_type IS 'MBTI personality type (e.g., INTJ, ESFP) - 4 letters';
COMMENT ON COLUMN personality_analyses.riasec_scores IS 'JSON object with scores for 6 RIASEC dimensions (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)';
COMMENT ON COLUMN personality_analyses.analysis_result IS 'JSON object containing traits, forces, axes_developpement, environnement_ideal, style_travail, recommandations';

COMMENT ON TABLE action_plans IS 'Stores AI-generated personalized action plans for career transition';
COMMENT ON COLUMN action_plans.target_job IS 'Target job title for the action plan';
COMMENT ON COLUMN action_plans.plan_data IS 'JSON object containing objectif_principal, duree_estimee, etapes, formations_recommandees, jalons';
COMMENT ON COLUMN action_plans.status IS 'Current status of the action plan (DRAFT, ACTIVE, COMPLETED, ARCHIVED)';

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
CREATE TRIGGER update_cv_analyses_updated_at
  BEFORE UPDATE ON cv_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_recommendations_updated_at
  BEFORE UPDATE ON job_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personality_analyses_updated_at
  BEFORE UPDATE ON personality_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON cv_analyses TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON job_recommendations TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON personality_analyses TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON action_plans TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

