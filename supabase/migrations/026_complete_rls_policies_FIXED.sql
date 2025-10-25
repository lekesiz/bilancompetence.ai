-- ============================================================================
-- MIGRATION 026: COMPLETE RLS POLICIES FOR ALL TABLES (FIXED)
-- Date: 2025-10-25
-- Description: Compléter les politiques RLS manquantes pour toutes les tables
--              critiques et haute priorité - FIXED schema compatibility
-- Priority: CRITICAL SECURITY FIX
-- ============================================================================

-- ===========================================
-- PHASE 1: TABLES CRITIQUES
-- ===========================================

-- ============================================================================
-- 1. USERS - Compléter les politiques manquantes
-- ============================================================================

-- Supprimer l'ancienne politique partielle si elle existe
DROP POLICY IF EXISTS "users_view_self" ON users;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON users;
DROP POLICY IF EXISTS "Only admins can create users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- Politique SELECT: Les utilisateurs peuvent voir leur propre profil + admins/org_admins
CREATE POLICY "Users can view own profile and admins can view all"
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

-- Politique UPDATE: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Politique UPDATE: Les admins peuvent modifier tous les profils
CREATE POLICY "Admins can update all profiles"
ON users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- ============================================================================
-- 2. ORGANIZATIONS - Activer RLS et créer politiques
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members and admins can view organizations" ON organizations;
DROP POLICY IF EXISTS "Only admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "Org admins can update their organization" ON organizations;
DROP POLICY IF EXISTS "Only admins can delete organizations" ON organizations;

-- Politique SELECT: Membres de l'org + admins
CREATE POLICY "Org members and admins can view organizations"
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

-- Politique UPDATE: Org admins et admins peuvent modifier
CREATE POLICY "Org admins can update their organization"
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

-- ============================================================================
-- 3. ASSESSMENTS - Activer RLS et créer politiques
-- ============================================================================

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users and consultants can update assessments" ON assessments;
DROP POLICY IF EXISTS "Users and admins can delete assessments" ON assessments;

-- Politique SELECT: L'utilisateur propriétaire + consultants assignés + admins
CREATE POLICY "Users can view their own assessments"
ON assessments
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  consultant_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ADMIN', 'ORG_ADMIN')
  )
);

-- Politique INSERT: Les utilisateurs peuvent créer leurs propres assessments
CREATE POLICY "Users can create their own assessments"
ON assessments
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Politique UPDATE: Le propriétaire et le consultant assigné peuvent modifier
CREATE POLICY "Users and consultants can update assessments"
ON assessments
FOR UPDATE
USING (
  user_id = auth.uid()
  OR consultant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ADMIN', 'ORG_ADMIN')
  )
);

-- Politique DELETE: Seuls le propriétaire et les admins peuvent supprimer
CREATE POLICY "Users and admins can delete assessments"
ON assessments
FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

-- ===========================================
-- PHASE 2: TABLES HAUTE PRIORITÉ
-- ===========================================

-- ============================================================================
-- 4. RECOMMENDATIONS - Activer RLS
-- ============================================================================

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access recommendations for their bilans" ON recommendations;

CREATE POLICY "Users can access recommendations for their bilans"
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

-- ============================================================================
-- 5. SESSIONS - Activer RLS
-- ============================================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access sessions they're involved in" ON sessions;
DROP POLICY IF EXISTS "Consultants can create sessions" ON sessions;
DROP POLICY IF EXISTS "Consultants can update their sessions" ON sessions;

CREATE POLICY "Users can access sessions they're involved in"
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

CREATE POLICY "Consultants can create sessions"
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

CREATE POLICY "Consultants can update their sessions"
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

-- ============================================================================
-- 6. ASSESSMENT_COMPETENCIES - Activer RLS
-- ============================================================================

ALTER TABLE assessment_competencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access competencies for their assessments" ON assessment_competencies;

CREATE POLICY "Users can access competencies for their assessments"
ON assessment_competencies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = assessment_competencies.assessment_id
    AND (
      assessments.user_id = auth.uid()
      OR assessments.consultant_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'ORG_ADMIN')
      )
    )
  )
);

-- ============================================================================
-- 7. ASSESSMENT_DRAFTS - Activer RLS
-- ============================================================================

ALTER TABLE assessment_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own assessment drafts" ON assessment_drafts;

CREATE POLICY "Users can access their own assessment drafts"
ON assessment_drafts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = assessment_drafts.assessment_id
    AND (
      assessments.user_id = auth.uid()
      OR assessments.consultant_id = auth.uid()
    )
  )
);

-- ============================================================================
-- 8. SESSION_BOOKINGS - Activer RLS
-- ============================================================================

ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view bookings for their sessions" ON session_bookings;
DROP POLICY IF EXISTS "Consultants and beneficiaries can create bookings" ON session_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON session_bookings;

CREATE POLICY "Users can view bookings for their sessions"
ON session_bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_bookings.session_id
    AND (
      sessions.beneficiary_id = auth.uid()
      OR sessions.consultant_id = auth.uid()
    )
  )
);

CREATE POLICY "Consultants and beneficiaries can create bookings"
ON session_bookings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_bookings.session_id
    AND (
      sessions.beneficiary_id = auth.uid()
      OR sessions.consultant_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own bookings"
ON session_bookings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_bookings.session_id
    AND (
      sessions.beneficiary_id = auth.uid()
      OR sessions.consultant_id = auth.uid()
    )
  )
);

-- ============================================================================
-- 9. SURVEY_RESPONSES - Activer RLS
-- ============================================================================

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own survey responses" ON survey_responses;

CREATE POLICY "Users can access their own survey responses"
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
-- 10. BILANS - Compléter les politiques manquantes
-- ============================================================================

-- Supprimer l'ancienne politique partielle
DROP POLICY IF EXISTS "bilans_view_own" ON bilans;
DROP POLICY IF EXISTS "Users can view bilans they're involved with" ON bilans;
DROP POLICY IF EXISTS "Org admins can create bilans" ON bilans;
DROP POLICY IF EXISTS "Involved users can update bilans" ON bilans;
DROP POLICY IF EXISTS "Only org admins can delete bilans" ON bilans;

-- Politique SELECT complète
CREATE POLICY "Users can view bilans they're involved with"
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

-- Politique INSERT: Org admins et admins peuvent créer des bilans
CREATE POLICY "Org admins can create bilans"
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

-- Politique UPDATE: Bénéficiaire, consultant, org admin peuvent modifier
CREATE POLICY "Involved users can update bilans"
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

-- Politique DELETE: Seuls org admins et admins peuvent supprimer
CREATE POLICY "Only org admins can delete bilans"
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
-- PHASE 3: TABLES MOYENNE PRIORITÉ
-- ===========================================

-- ============================================================================
-- 11. ORGANIZATION_QUALIOPI_STATUS - Activer RLS
-- ============================================================================

ALTER TABLE organization_qualiopi_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view qualiopi status" ON organization_qualiopi_status;
DROP POLICY IF EXISTS "Only org admins can manage qualiopi status" ON organization_qualiopi_status;

CREATE POLICY "Org members can view qualiopi status"
ON organization_qualiopi_status
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'ADMIN'
  )
);

CREATE POLICY "Only org admins can manage qualiopi status"
ON organization_qualiopi_status
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM users
    WHERE id = auth.uid() AND role IN ('ORG_ADMIN', 'ADMIN')
  )
);

-- ============================================================================
-- 12. SATISFACTION_SURVEYS - Activer RLS
-- ============================================================================

ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view surveys for their bilans" ON satisfaction_surveys;
DROP POLICY IF EXISTS "Consultants and org admins can create surveys" ON satisfaction_surveys;
DROP POLICY IF EXISTS "Consultants can update their surveys" ON satisfaction_surveys;

CREATE POLICY "Users can view surveys for their bilans"
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

CREATE POLICY "Consultants and org admins can create surveys"
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

CREATE POLICY "Consultants can update their surveys"
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

-- ============================================================================
-- 13. COMPETENCIES - Compléter les politiques (si manquantes)
-- ============================================================================

DROP POLICY IF EXISTS "Users can access competencies for their bilans" ON competencies;

CREATE POLICY "Users can access competencies for their bilans"
ON competencies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM bilans
    WHERE bilans.id = competencies.bilan_id
    AND (
      bilans.beneficiary_id = auth.uid()
      OR bilans.consultant_id = auth.uid()
      OR bilans.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
);

-- ===========================================
-- PHASE 4: TABLES OPTIONNELLES (À ÉVALUER)
-- ===========================================

-- ============================================================================
-- 14. AVAILABILITY_SLOTS - Public avec gestion consultant
-- ============================================================================

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view availability slots" ON availability_slots;
DROP POLICY IF EXISTS "Consultants can manage their own slots" ON availability_slots;

CREATE POLICY "Anyone can view availability slots"
ON availability_slots
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Consultants can manage their own slots"
ON availability_slots
FOR ALL
USING (
  consultant_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('ORG_ADMIN', 'ADMIN')
  )
);

-- ============================================================================
-- 15. SESSION_REMINDERS - Notifications système
-- ============================================================================

ALTER TABLE session_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reminders for their sessions" ON session_reminders;
DROP POLICY IF EXISTS "System can create reminders" ON session_reminders;

CREATE POLICY "Users can view reminders for their sessions"
ON session_reminders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_reminders.session_id
    AND (
      sessions.beneficiary_id = auth.uid()
      OR sessions.consultant_id = auth.uid()
    )
  )
);

-- ============================================================================
-- FIN DE LA MIGRATION 026 FIXED
-- ============================================================================

