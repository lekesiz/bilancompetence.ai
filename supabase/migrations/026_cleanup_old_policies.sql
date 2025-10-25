-- ============================================================================
-- CLEANUP: Remove all existing RLS policies that may have errors
-- Date: 2025-10-25
-- Description: Nettoyer toutes les politiques RLS existantes avant d'appliquer
--              les nouvelles politiques corrigées
-- ============================================================================

-- Documents (from migration 024 - has wrong user_id reference)
DROP POLICY IF EXISTS "Users can only access their own documents" ON documents;

-- Document Archive (from migration 024 - has wrong user_id reference)
DROP POLICY IF EXISTS "Users can only access their own archived documents" ON document_archive;

-- Document Access Log (from migration 024)
DROP POLICY IF EXISTS "Users can read their own document access logs" ON document_access_log;

-- Users
DROP POLICY IF EXISTS "users_view_self" ON users;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON users;
DROP POLICY IF EXISTS "Only admins can create users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- Organizations
DROP POLICY IF EXISTS "Org members and admins can view organizations" ON organizations;
DROP POLICY IF EXISTS "Only admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "Org admins can update their organization" ON organizations;
DROP POLICY IF EXISTS "Only admins can delete organizations" ON organizations;

-- Assessments
DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users and consultants can update assessments" ON assessments;
DROP POLICY IF EXISTS "Users and admins can delete assessments" ON assessments;

-- Recommendations
DROP POLICY IF EXISTS "Users can access recommendations for their bilans" ON recommendations;

-- Sessions
DROP POLICY IF EXISTS "Users can access sessions they're involved in" ON sessions;
DROP POLICY IF EXISTS "Consultants can create sessions" ON sessions;
DROP POLICY IF EXISTS "Consultants can update their sessions" ON sessions;

-- Assessment Competencies
DROP POLICY IF EXISTS "Users can access competencies for their assessments" ON assessment_competencies;

-- Assessment Drafts
DROP POLICY IF EXISTS "Users can access their own assessment drafts" ON assessment_drafts;

-- Session Bookings
DROP POLICY IF EXISTS "Users can view bookings for their sessions" ON session_bookings;
DROP POLICY IF EXISTS "Consultants and beneficiaries can create bookings" ON session_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON session_bookings;

-- Survey Responses
DROP POLICY IF EXISTS "Users can access their own survey responses" ON survey_responses;

-- Bilans
DROP POLICY IF EXISTS "bilans_view_own" ON bilans;
DROP POLICY IF EXISTS "Users can view bilans they're involved with" ON bilans;
DROP POLICY IF EXISTS "Org admins can create bilans" ON bilans;
DROP POLICY IF EXISTS "Involved users can update bilans" ON bilans;
DROP POLICY IF EXISTS "Only org admins can delete bilans" ON bilans;

-- Organization Qualiopi Status
DROP POLICY IF EXISTS "Org members can view qualiopi status" ON organization_qualiopi_status;
DROP POLICY IF EXISTS "Only org admins can manage qualiopi status" ON organization_qualiopi_status;

-- Satisfaction Surveys
DROP POLICY IF EXISTS "Users can view surveys for their bilans" ON satisfaction_surveys;
DROP POLICY IF EXISTS "Consultants and org admins can create surveys" ON satisfaction_surveys;
DROP POLICY IF EXISTS "Consultants can update their surveys" ON satisfaction_surveys;

-- Competencies
DROP POLICY IF EXISTS "Users can access competencies for their bilans" ON competencies;

-- Availability Slots
DROP POLICY IF EXISTS "Anyone can view availability slots" ON availability_slots;
DROP POLICY IF EXISTS "Consultants can manage their own slots" ON availability_slots;

-- Session Reminders
DROP POLICY IF EXISTS "Users can view reminders for their sessions" ON session_reminders;
DROP POLICY IF EXISTS "System can create reminders" ON session_reminders;

-- Messages (from migration 001 and 024)
DROP POLICY IF EXISTS "messages_view_own" ON messages;
DROP POLICY IF EXISTS "Users can read messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Action Plans (from migration 024)
DROP POLICY IF EXISTS "Users can only access their own action plans" ON action_plans;

-- Job Recommendations (from migration 024)
DROP POLICY IF EXISTS "Users can only access their own job recommendations" ON job_recommendations;

-- Personality Analyses (from migration 024)
DROP POLICY IF EXISTS "Users can only access their own personality analyses" ON personality_analyses;

-- CV Analyses (from migration 024)
DROP POLICY IF EXISTS "Users can only access their own CV analyses" ON cv_analyses;

-- Conversations (from migration 024)
DROP POLICY IF EXISTS "Users can access conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations for their assessments" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;

-- Auth Sessions (from migration 024)
DROP POLICY IF EXISTS "Users can only access their own auth sessions" ON auth_sessions;

-- User Sessions (from migration 024)
DROP POLICY IF EXISTS "Users can only access their own user sessions" ON user_sessions;

-- User Two Factor (from migration 024)
DROP POLICY IF EXISTS "Users can only access their own 2FA settings" ON user_two_factor;

-- Audit Logs (from migration 024)
DROP POLICY IF EXISTS "Users can only read their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can read all audit logs" ON audit_logs;

-- Qualiopi Audit Log (from migration 024)
DROP POLICY IF EXISTS "Only admins can access Qualiopi audit logs" ON qualiopi_audit_log;

-- Qualiopi Evidence (from migration 024)
DROP POLICY IF EXISTS "Only admins can manage Qualiopi evidence" ON qualiopi_evidence;

-- Qualiopi Indicators (from migration 024)
DROP POLICY IF EXISTS "Only admins can manage Qualiopi indicators" ON qualiopi_indicators;

-- Session Analytics (from migration 024)
DROP POLICY IF EXISTS "Users can read analytics for their sessions" ON session_analytics;

-- MBTI Questions (from migration 024)
DROP POLICY IF EXISTS "Anyone can read MBTI questions" ON mbti_questions;

-- RIASEC Questions (from migration 024)
DROP POLICY IF EXISTS "Anyone can read RIASEC questions" ON riasec_questions;

-- ============================================================================
-- FIN DU NETTOYAGE
-- ============================================================================

