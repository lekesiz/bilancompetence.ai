-- ============================================================================
-- MIGRATION 024: ENABLE RLS ON CRITICAL TABLES
-- Date: 2025-10-25
-- Description: Activer Row Level Security sur les tables critiques
--              et définir les politiques "users can only access their own data"
-- Priority: CRITICAL SECURITY FIX
-- ============================================================================

-- ===========================================
-- PHASE 1: TABLES CRITIQUES (AUTH & SESSIONS)
-- ===========================================

-- 1. auth_sessions
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own auth sessions"
ON auth_sessions
FOR ALL
USING (user_id = auth.uid());

-- 2. user_sessions  
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own user sessions"
ON user_sessions
FOR ALL
USING (user_id = auth.uid());

-- 3. user_two_factor
ALTER TABLE user_two_factor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own 2FA settings"
ON user_two_factor
FOR ALL
USING (user_id = auth.uid());

-- 4. conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access conversations they participate in"
ON conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.conversation_id = conversations.id
    AND messages.sender_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = conversations.assessment_id
    AND assessments.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations for their assessments"
ON conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = conversations.assessment_id
    AND assessments.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own conversations"
ON conversations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = conversations.assessment_id
    AND assessments.user_id = auth.uid()
  )
);

-- 5. messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read messages in their conversations"
ON messages
FOR SELECT
USING (
  sender_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM conversations
    JOIN assessments ON assessments.id = conversations.assessment_id
    WHERE conversations.id = messages.conversation_id
    AND assessments.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages"
ON messages
FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON messages
FOR UPDATE
USING (sender_id = auth.uid());

-- 6. cv_analyses
ALTER TABLE cv_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own CV analyses"
ON cv_analyses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = cv_analyses.assessment_id
    AND assessments.user_id = auth.uid()
  )
);

-- ===========================================
-- PHASE 2: TABLES MÉTIER (DONNÉES PERSONNELLES)
-- ===========================================

-- 7. action_plans
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own action plans"
ON action_plans
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = action_plans.assessment_id
    AND assessments.user_id = auth.uid()
  )
);

-- 8. job_recommendations
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own job recommendations"
ON job_recommendations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = job_recommendations.assessment_id
    AND assessments.user_id = auth.uid()
  )
);

-- 9. personality_analyses
ALTER TABLE personality_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own personality analyses"
ON personality_analyses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = personality_analyses.assessment_id
    AND assessments.user_id = auth.uid()
  )
);

-- 10. documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own documents"
ON documents
FOR ALL
USING (user_id = auth.uid());

-- 11. document_archive
ALTER TABLE document_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own archived documents"
ON document_archive
FOR ALL
USING (user_id = auth.uid());

-- ===========================================
-- PHASE 3: AUDIT & LOGS (TRAÇABILITÉ)
-- ===========================================

-- 12. audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read their own audit logs"
ON audit_logs
FOR SELECT
USING (user_id = auth.uid());

-- Admins peuvent tout voir
CREATE POLICY "Admins can read all audit logs"
ON audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

-- 13. document_access_log
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own document access logs"
ON document_access_log
FOR SELECT
USING (user_id = auth.uid());

-- 14. qualiopi_audit_log
ALTER TABLE qualiopi_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access Qualiopi audit logs"
ON qualiopi_audit_log
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

-- 15. session_analytics
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read analytics for their sessions"
ON session_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = session_analytics.session_id
    AND sessions.user_id = auth.uid()
  )
);

-- ===========================================
-- PHASE 4: DONNÉES PUBLIQUES (READ-ONLY)
-- ===========================================

-- 16. mbti_questions (Public read-only)
ALTER TABLE mbti_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read MBTI questions"
ON mbti_questions
FOR SELECT
TO authenticated
USING (true);

-- 17. riasec_questions (Public read-only)
ALTER TABLE riasec_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read RIASEC questions"
ON riasec_questions
FOR SELECT
TO authenticated
USING (true);

-- 18. qualiopi_evidence
ALTER TABLE qualiopi_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage Qualiopi evidence"
ON qualiopi_evidence
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

-- 19. qualiopi_indicators
ALTER TABLE qualiopi_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage Qualiopi indicators"
ON qualiopi_indicators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);

-- ===========================================
-- VÉRIFICATION FINALE
-- ===========================================

-- Afficher toutes les tables et leur statut RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Compter les tables sans RLS
SELECT 
    COUNT(*) as tables_without_rls
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- ============================================================================
-- FIN DE LA MIGRATION 024
-- ============================================================================

