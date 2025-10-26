-- Migration 025: Fix cv_analyses trigger (make idempotent)
-- Date: 2025-10-26
-- Purpose: Drop and recreate trigger to avoid "already exists" error
-- Dependencies: 020_create_ai_tables.sql

-- ============================================================================
-- DROP EXISTING TRIGGER (if exists)
-- ============================================================================

DROP TRIGGER IF EXISTS update_cv_analyses_updated_at ON cv_analyses;

-- ============================================================================
-- RECREATE TRIGGER
-- ============================================================================

CREATE TRIGGER update_cv_analyses_updated_at
BEFORE UPDATE ON cv_analyses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADD COMMENT
-- ============================================================================

COMMENT ON TRIGGER update_cv_analyses_updated_at ON cv_analyses IS 'Automatically update updated_at timestamp on row update';

