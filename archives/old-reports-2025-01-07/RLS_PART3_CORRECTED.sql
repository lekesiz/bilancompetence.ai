-- ============================================================================
-- MIGRATION RLS - PARTIE 3/4: ASSESSMENTS, BILANS, CV_ANALYSES, PERSONALITY_ANALYSES
-- VERSION CORRIGÉE basée sur la structure réelle de Supabase
-- ============================================================================
-- Structure réelle identifiée :
-- assessments: id, bilan_id (FK), type, title, description, status, progress_percentage, started_at, completed_at, created_at
-- bilans: beneficiary_id, consultant_id, organization_id
-- cv_analyses: assessment_id (FK to assessments)
-- personality_analyses: assessment_id (FK to assessments)
-- ============================================================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view assessments for their bilans" ON assessments;
DROP POLICY IF EXISTS "Consultants can view assessments for their bilans" ON assessments;
DROP POLICY IF EXISTS "ADMIN can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can create assessments for their bilans" ON assessments;
DROP POLICY IF EXISTS "Users can update assessments for their bilans" ON assessments;
DROP POLICY IF EXISTS "Consultants can update assessments for their bilans" ON assessments;

DROP POLICY IF EXISTS "Beneficiaries can view their own bilans" ON bilans;
DROP POLICY IF EXISTS "Consultants can view bilans they manage" ON bilans;
DROP POLICY IF EXISTS "ADMIN can view all bilans" ON bilans;
DROP POLICY IF EXISTS "Beneficiaries can create bilans" ON bilans;
DROP POLICY IF EXISTS "Beneficiaries can update their own bilans" ON bilans;
DROP POLICY IF EXISTS "Consultants can update bilans they manage" ON bilans;

DROP POLICY IF EXISTS "Users can view CV analyses for their assessments" ON cv_analyses;
DROP POLICY IF EXISTS "Consultants can view CV analyses for their assessments" ON cv_analyses;
DROP POLICY IF EXISTS "ADMIN can view all CV analyses" ON cv_analyses;
DROP POLICY IF EXISTS "Users can create CV analyses for their assessments" ON cv_analyses;
DROP POLICY IF EXISTS "Users can update their own CV analyses" ON cv_analyses;

DROP POLICY IF EXISTS "Users can view personality analyses for their assessments" ON personality_analyses;
DROP POLICY IF EXISTS "Consultants can view personality analyses for their assessments" ON personality_analyses;
DROP POLICY IF EXISTS "ADMIN can view all personality analyses" ON personality_analyses;
DROP POLICY IF EXISTS "Users can create personality analyses for their assessments" ON personality_analyses;
DROP POLICY IF EXISTS "Users can update their own personality analyses" ON personality_analyses;

-- ============================================================================
-- 1. BILANS TABLE (Base de la hiérarchie)
-- ============================================================================
ALTER TABLE bilans ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "Beneficiaries can view their own bilans"
  ON bilans FOR SELECT
  USING (
    auth.uid() = beneficiary_id
  );

CREATE POLICY "Consultants can view bilans they manage"
  ON bilans FOR SELECT
  USING (
    auth.uid() = consultant_id
  );

CREATE POLICY "ADMIN can view all bilans"
  ON bilans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- INSERT policies
CREATE POLICY "Beneficiaries can create bilans"
  ON bilans FOR INSERT
  WITH CHECK (
    auth.uid() = beneficiary_id
  );

-- UPDATE policies
CREATE POLICY "Beneficiaries can update their own bilans"
  ON bilans FOR UPDATE
  USING (auth.uid() = beneficiary_id);

CREATE POLICY "Consultants can update bilans they manage"
  ON bilans FOR UPDATE
  USING (auth.uid() = consultant_id);

-- ============================================================================
-- 2. ASSESSMENTS TABLE (Lié via bilan_id)
-- ============================================================================
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "Users can view assessments for their bilans"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bilans
      WHERE bilans.id = assessments.bilan_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can view assessments for their bilans"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bilans
      WHERE bilans.id = assessments.bilan_id
      AND bilans.consultant_id = auth.uid()
    )
  );

CREATE POLICY "ADMIN can view all assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- INSERT policies
CREATE POLICY "Users can create assessments for their bilans"
  ON assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bilans
      WHERE bilans.id = bilan_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

-- UPDATE policies
CREATE POLICY "Users can update assessments for their bilans"
  ON assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bilans
      WHERE bilans.id = assessments.bilan_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can update assessments for their bilans"
  ON assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bilans
      WHERE bilans.id = assessments.bilan_id
      AND bilans.consultant_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. CV_ANALYSES TABLE (Lié via assessment_id -> bilan_id)
-- ============================================================================
ALTER TABLE cv_analyses ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "Users can view CV analyses for their assessments"
  ON cv_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = cv_analyses.assessment_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can view CV analyses for their assessments"
  ON cv_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = cv_analyses.assessment_id
      AND bilans.consultant_id = auth.uid()
    )
  );

CREATE POLICY "ADMIN can view all CV analyses"
  ON cv_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- INSERT policies
CREATE POLICY "Users can create CV analyses for their assessments"
  ON cv_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = assessment_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

-- UPDATE policies
CREATE POLICY "Users can update their own CV analyses"
  ON cv_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = cv_analyses.assessment_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. PERSONALITY_ANALYSES TABLE (Lié via assessment_id -> bilan_id)
-- ============================================================================
ALTER TABLE personality_analyses ENABLE ROW LEVEL SECURITY;

-- SELECT policies
CREATE POLICY "Users can view personality analyses for their assessments"
  ON personality_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = personality_analyses.assessment_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

CREATE POLICY "Consultants can view personality analyses for their assessments"
  ON personality_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = personality_analyses.assessment_id
      AND bilans.consultant_id = auth.uid()
    )
  );

CREATE POLICY "ADMIN can view all personality analyses"
  ON personality_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- INSERT policies
CREATE POLICY "Users can create personality analyses for their assessments"
  ON personality_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = assessment_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

-- UPDATE policies
CREATE POLICY "Users can update their own personality analyses"
  ON personality_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      JOIN bilans ON bilans.id = assessments.bilan_id
      WHERE assessments.id = personality_analyses.assessment_id
      AND bilans.beneficiary_id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('assessments', 'bilans', 'cv_analyses', 'personality_analyses');

-- Count policies created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('assessments', 'bilans', 'cv_analyses', 'personality_analyses')
ORDER BY tablename, policyname;

