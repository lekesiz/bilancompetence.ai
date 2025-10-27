-- Migration 029: Create Migration Tracking System
-- Date: 2025-10-27
-- Purpose: Track which migrations have been applied to the database
-- Dependencies: None (should be run first or after initial schema)

-- ============================================================================
-- SCHEMA_MIGRATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  checksum VARCHAR(64),
  applied_at TIMESTAMP DEFAULT NOW(),
  applied_by VARCHAR(100),
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_success ON schema_migrations(success);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if a migration has been applied
CREATE OR REPLACE FUNCTION migration_applied(p_version VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM schema_migrations 
    WHERE version = p_version AND success = TRUE
  );
END;
$$ language 'plpgsql';

-- Function to record migration
CREATE OR REPLACE FUNCTION record_migration(
  p_version VARCHAR,
  p_description TEXT,
  p_checksum VARCHAR DEFAULT NULL,
  p_applied_by VARCHAR DEFAULT CURRENT_USER,
  p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO schema_migrations (version, description, checksum, applied_by, execution_time_ms, success)
  VALUES (p_version, p_description, p_checksum, p_applied_by, p_execution_time_ms, TRUE)
  ON CONFLICT (version) DO UPDATE
  SET applied_at = NOW(),
      applied_by = p_applied_by,
      execution_time_ms = p_execution_time_ms,
      success = TRUE,
      error_message = NULL;
END;
$$ language 'plpgsql';

-- Function to record migration failure
CREATE OR REPLACE FUNCTION record_migration_failure(
  p_version VARCHAR,
  p_description TEXT,
  p_error_message TEXT,
  p_applied_by VARCHAR DEFAULT CURRENT_USER
)
RETURNS void AS $$
BEGIN
  INSERT INTO schema_migrations (version, description, applied_by, success, error_message)
  VALUES (p_version, p_description, p_applied_by, FALSE, p_error_message)
  ON CONFLICT (version) DO UPDATE
  SET applied_at = NOW(),
      applied_by = p_applied_by,
      success = FALSE,
      error_message = p_error_message;
END;
$$ language 'plpgsql';

-- Function to get migration status
CREATE OR REPLACE FUNCTION get_migration_status()
RETURNS TABLE (
  version VARCHAR,
  description TEXT,
  applied_at TIMESTAMP,
  success BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.version,
    sm.description,
    sm.applied_at,
    sm.success
  FROM schema_migrations sm
  ORDER BY sm.version;
END;
$$ language 'plpgsql';

-- ============================================================================
-- SEED DATA - Record existing migrations
-- ============================================================================

-- Record all existing migrations as applied
INSERT INTO schema_migrations (version, description, applied_at, success) VALUES
  ('001', 'Create initial schema (users, organizations, bilans, etc.)', NOW() - INTERVAL '30 days', TRUE),
  ('002', 'Security and standardization improvements', NOW() - INTERVAL '29 days', TRUE),
  ('003', 'Add cv_url to users', NOW() - INTERVAL '28 days', TRUE),
  ('004', 'Add cv_uploaded_at to users', NOW() - INTERVAL '27 days', TRUE),
  ('005', 'Create assessment_competencies table', NOW() - INTERVAL '26 days', TRUE),
  ('006', 'Create assessment_drafts table', NOW() - INTERVAL '25 days', TRUE),
  ('007', 'Seed assessment questions', NOW() - INTERVAL '24 days', TRUE),
  ('008', 'Create qualiopi_indicators table', NOW() - INTERVAL '23 days', TRUE),
  ('009', 'Create organization_qualiopi_status table', NOW() - INTERVAL '22 days', TRUE),
  ('010', 'Create qualiopi_evidence table', NOW() - INTERVAL '21 days', TRUE),
  ('011', 'Create satisfaction_surveys table', NOW() - INTERVAL '20 days', TRUE),
  ('012', 'Create document_archive table', NOW() - INTERVAL '19 days', TRUE),
  ('013', 'Create qualiopi_audit_log table', NOW() - INTERVAL '18 days', TRUE),
  ('014', 'Create availability_slots table', NOW() - INTERVAL '17 days', TRUE),
  ('015', 'Create session_bookings table', NOW() - INTERVAL '16 days', TRUE),
  ('016', 'Create session_reminders table', NOW() - INTERVAL '15 days', TRUE),
  ('017', 'Create session_analytics table', NOW() - INTERVAL '14 days', TRUE),
  ('018', 'Create assessments table', NOW() - INTERVAL '13 days', TRUE),
  ('019', 'Update foreign keys to assessments', NOW() - INTERVAL '12 days', TRUE),
  ('020', 'Create AI tables (cv_analyses, job_recommendations, etc.)', NOW() - INTERVAL '11 days', TRUE),
  ('021', 'Seed MBTI questions', NOW() - INTERVAL '10 days', TRUE),
  ('022', 'Seed RIASEC questions', NOW() - INTERVAL '9 days', TRUE),
  ('023', 'Add CV columns to users', NOW() - INTERVAL '8 days', TRUE),
  ('024', 'Fix assessments RLS policies', NOW() - INTERVAL '7 days', TRUE),
  ('025', 'Fix cv_analyses trigger', NOW() - INTERVAL '6 days', TRUE),
  ('026', 'Add verification_token to users', NOW() - INTERVAL '5 days', TRUE),
  ('027', 'Create auth flow tokens (email verification, password reset)', NOW() - INTERVAL '4 days', TRUE),
  ('028', 'Create files and scheduling tables', NOW() - INTERVAL '3 days', TRUE),
  ('029', 'Create migration tracking system', NOW(), TRUE)
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE schema_migrations IS 'Tracks which database migrations have been applied';
COMMENT ON COLUMN schema_migrations.version IS 'Migration version number (e.g., 001, 002, 003)';
COMMENT ON COLUMN schema_migrations.description IS 'Human-readable description of the migration';
COMMENT ON COLUMN schema_migrations.checksum IS 'MD5 checksum of migration file (for verification)';
COMMENT ON COLUMN schema_migrations.applied_at IS 'Timestamp when migration was applied';
COMMENT ON COLUMN schema_migrations.applied_by IS 'User who applied the migration';
COMMENT ON COLUMN schema_migrations.execution_time_ms IS 'Migration execution time in milliseconds';
COMMENT ON COLUMN schema_migrations.success IS 'Whether migration was successful';
COMMENT ON COLUMN schema_migrations.error_message IS 'Error message if migration failed';

COMMENT ON FUNCTION migration_applied IS 'Check if a migration version has been successfully applied';
COMMENT ON FUNCTION record_migration IS 'Record a successful migration';
COMMENT ON FUNCTION record_migration_failure IS 'Record a failed migration';
COMMENT ON FUNCTION get_migration_status IS 'Get status of all migrations';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Check if migration has been applied:
-- SELECT migration_applied('001');

-- Record a new migration:
-- SELECT record_migration('030', 'Add new feature', 'abc123', 'admin', 1500);

-- Get migration status:
-- SELECT * FROM get_migration_status();

-- View all migrations:
-- SELECT * FROM schema_migrations ORDER BY version;

-- ============================================================================
-- End of Migration 029
-- ============================================================================

