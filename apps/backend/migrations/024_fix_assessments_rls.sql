-- Migration 024: Fix Assessments RLS for Neon PostgreSQL
-- Date: 2025-10-26
-- Purpose: Remove Supabase-specific auth.uid() and use application-level security
-- Dependencies: 018_create_assessments_table.sql

-- ============================================================================
-- DROP EXISTING RLS POLICIES (if they exist)
-- ============================================================================

DROP POLICY IF EXISTS assessments_beneficiary_read ON assessments;
DROP POLICY IF EXISTS assessments_consultant_read ON assessments;
DROP POLICY IF EXISTS assessments_beneficiary_create ON assessments;
DROP POLICY IF EXISTS assessments_beneficiary_update ON assessments;
DROP POLICY IF EXISTS assessments_beneficiary_delete ON assessments;

-- ============================================================================
-- DISABLE RLS (use application-level security instead)
-- ============================================================================

ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADD COMMENT
-- ============================================================================

COMMENT ON TABLE assessments IS 'Assessment Wizard responses - Security handled at application level via JWT authentication';

