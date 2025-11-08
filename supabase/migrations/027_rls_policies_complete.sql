-- ============================================================================
-- MIGRATION 027: COMPLETE RLS POLICIES - MINIMAL & SAFE APPROACH
-- Date: 2025-10-25
-- Description: Appliquer les politiques RLS uniquement pour les tables existantes
--              avec une approche sûre et minimale
-- ============================================================================

-- ===========================================
-- ÉTAPE 1: ACTIVER RLS SUR LES TABLES CRITIQUES
-- ===========================================

-- Users (déjà actif, juste s'assurer)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Bilans (déjà actif)
ALTER TABLE bilans ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- ÉTAPE 2: POLITIQUES POUR USERS
-- ===========================================

-- Nettoyer les anciennes politiques
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "users_view_self" ON users;
    DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- SELECT: Voir son propre profil + admins voient tout
CREATE POLICY "users_select_policy"
ON users
FOR SELECT
USING (
  id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ADMIN', 'ORG_ADMIN')
  )
);

-- UPDATE: Modifier son propre profil
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- UPDATE: Admins peuvent tout modifier
CREATE POLICY "users_update_admin"
ON users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- ===========================================
-- ÉTAPE 3: POLITIQUES POUR ORGANIZATIONS
-- ===========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Org members and admins can view organizations" ON organizations;
    DROP POLICY IF EXISTS "Org admins can update their organization" ON organizations;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- SELECT: Membres de l'org + admins
CREATE POLICY "orgs_select_policy"
ON organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- UPDATE: Org admins et admins
CREATE POLICY "orgs_update_policy"
ON organizations
FOR UPDATE
USING (
  (id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role = 'ORG_ADMIN'
  ))
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- ===========================================
-- ÉTAPE 4: POLITIQUES POUR ASSESSMENTS
-- ===========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
    DROP POLICY IF EXISTS "Users can create their own assessments" ON assessments;
    DROP POLICY IF EXISTS "Users and consultants can update assessments" ON assessments;
    DROP POLICY IF EXISTS "Users and admins can delete assessments" ON assessments;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- SELECT: Propriétaire + consultant + admins
CREATE POLICY "assessments_select_policy"
ON assessments
FOR SELECT
USING (
  beneficiary_id = auth.uid()
  OR
  consultant_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ADMIN', 'ORG_ADMIN')
  )
);

-- INSERT: Utilisateurs peuvent créer leurs assessments
CREATE POLICY "assessments_insert_policy"
ON assessments
FOR INSERT
WITH CHECK (beneficiary_id = auth.uid());

-- UPDATE: Propriétaire + consultant + admins
CREATE POLICY "assessments_update_policy"
ON assessments
FOR UPDATE
USING (
  beneficiary_id = auth.uid()
  OR consultant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ADMIN', 'ORG_ADMIN')
  )
);

-- DELETE: Propriétaire + admins
CREATE POLICY "assessments_delete_policy"
ON assessments
FOR DELETE
USING (
  beneficiary_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- ===========================================
-- ÉTAPE 5: POLITIQUES POUR BILANS
-- ===========================================

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "bilans_view_own" ON bilans;
    DROP POLICY IF EXISTS "Users can view bilans they're involved with" ON bilans;
    DROP POLICY IF EXISTS "Org admins can create bilans" ON bilans;
    DROP POLICY IF EXISTS "Involved users can update bilans" ON bilans;
    DROP POLICY IF EXISTS "Only org admins can delete bilans" ON bilans;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- SELECT: Bénéficiaire + consultant + org members + admins
CREATE POLICY "bilans_select_policy"
ON bilans
FOR SELECT
USING (
  beneficiary_id = auth.uid()
  OR consultant_id = auth.uid()
  OR organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- INSERT: Org admins et admins
CREATE POLICY "bilans_insert_policy"
ON bilans
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('ORG_ADMIN', 'ADMIN')
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- UPDATE: Bénéficiaire + consultant + org admins
CREATE POLICY "bilans_update_policy"
ON bilans
FOR UPDATE
USING (
  beneficiary_id = auth.uid()
  OR consultant_id = auth.uid()
  OR organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('ORG_ADMIN', 'ADMIN')
  )
);

-- DELETE: Org admins et admins seulement
CREATE POLICY "bilans_delete_policy"
ON bilans
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('ORG_ADMIN', 'ADMIN')
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- ===========================================
-- ÉTAPE 6: TABLES SUPPLÉMENTAIRES (SAFE)
-- ===========================================

-- RECOMMENDATIONS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can access recommendations for their bilans" ON recommendations;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "recommendations_policy"
ON recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM bilans
    WHERE bilans.id = recommendations.bilan_id
    AND (
      bilans.beneficiary_id = auth.uid()
      OR bilans.consultant_id = auth.uid()
      OR bilans.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
);

-- SESSIONS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can access sessions they're involved in" ON sessions;
    DROP POLICY IF EXISTS "Consultants can create sessions" ON sessions;
    DROP POLICY IF EXISTS "Consultants can update their sessions" ON sessions;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "sessions_select_policy"
ON sessions
FOR SELECT
USING (
  beneficiary_id = auth.uid()
  OR consultant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM bilans
    WHERE bilans.id = sessions.bilan_id
    AND bilans.organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "sessions_insert_policy"
ON sessions
FOR INSERT
WITH CHECK (
  consultant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('CONSULTANT', 'ORG_ADMIN', 'ADMIN')
  )
);

CREATE POLICY "sessions_update_policy"
ON sessions
FOR UPDATE
USING (
  consultant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ORG_ADMIN', 'ADMIN')
  )
);

-- DOCUMENTS (bilan_id, pas user_id!)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can only access their own documents" ON documents;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "documents_policy"
ON documents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM bilans
    WHERE bilans.id = documents.bilan_id
    AND (
      bilans.beneficiary_id = auth.uid()
      OR bilans.consultant_id = auth.uid()
      OR bilans.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
);

-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "messages_view_own" ON messages;
    DROP POLICY IF EXISTS "Users can read messages in their conversations" ON messages;
    DROP POLICY IF EXISTS "Users can send messages" ON messages;
    DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "messages_select_policy"
ON messages
FOR SELECT
USING (
  sender_id = auth.uid()
  OR receiver_id = auth.uid()
);

CREATE POLICY "messages_insert_policy"
ON messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_policy"
ON messages
FOR UPDATE
USING (sender_id = auth.uid());

-- SATISFACTION_SURVEYS
ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view surveys for their bilans" ON satisfaction_surveys;
    DROP POLICY IF EXISTS "Consultants and org admins can create surveys" ON satisfaction_surveys;
    DROP POLICY IF EXISTS "Consultants can update their surveys" ON satisfaction_surveys;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "surveys_select_policy"
ON satisfaction_surveys
FOR SELECT
USING (
  bilan_id IN (
    SELECT id FROM bilans
    WHERE beneficiary_id = auth.uid()
    OR consultant_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "surveys_insert_policy"
ON satisfaction_surveys
FOR INSERT
WITH CHECK (
  bilan_id IN (
    SELECT id FROM bilans
    WHERE consultant_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('ORG_ADMIN', 'ADMIN')
    )
  )
);

CREATE POLICY "surveys_update_policy"
ON satisfaction_surveys
FOR UPDATE
USING (
  bilan_id IN (
    SELECT id FROM bilans
    WHERE consultant_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('ORG_ADMIN', 'ADMIN')
    )
  )
);

-- SURVEY_RESPONSES
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can access their own survey responses" ON survey_responses;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "survey_responses_policy"
ON survey_responses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM satisfaction_surveys
    WHERE satisfaction_surveys.id = survey_responses.survey_id
    AND satisfaction_surveys.bilan_id IN (
      SELECT id FROM bilans WHERE beneficiary_id = auth.uid()
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ADMIN', 'ORG_ADMIN')
  )
);

-- ============================================================================
-- FIN DE LA MIGRATION 027
-- ============================================================================

