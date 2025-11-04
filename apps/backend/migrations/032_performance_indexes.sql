-- ============================================================================
-- Performance Optimization Indexes
-- Created: 2025-11-04
-- Purpose: Add indexes to improve query performance for frequently accessed data
-- ============================================================================

-- Drop existing indexes if they exist (idempotent migration)
DROP INDEX IF EXISTS idx_assessments_user_status;
DROP INDEX IF EXISTS idx_assessments_org_created;
DROP INDEX IF EXISTS idx_competencies_assessment;
DROP INDEX IF EXISTS idx_recommendations_assessment_priority;
DROP INDEX IF EXISTS idx_sessions_consultant_date;
DROP INDEX IF EXISTS idx_sessions_beneficiary_status;
DROP INDEX IF EXISTS idx_notifications_user_read;
DROP INDEX IF EXISTS idx_cv_analyses_assessment;
DROP INDEX IF EXISTS idx_job_recommendations_assessment;
DROP INDEX IF EXISTS idx_audit_logs_user_timestamp;
DROP INDEX IF EXISTS idx_audit_logs_action_timestamp;
DROP INDEX IF EXISTS idx_users_email_lower;
DROP INDEX IF EXISTS idx_users_org_role;

-- ============================================================================
-- Assessments Table Indexes
-- ============================================================================

-- Index for querying user assessments with status filter
-- Covers: GET /api/assessments?status=IN_PROGRESS
CREATE INDEX IF NOT EXISTS idx_assessments_user_status
  ON assessments(beneficiary_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- Index for organization-wide assessment queries
-- Covers: Admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_assessments_org_created
  ON assessments(organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Index for consultant assignment queries
-- Covers: Consultant dashboard
CREATE INDEX IF NOT EXISTS idx_assessments_consultant
  ON assessments(consultant_id, status, updated_at DESC)
  WHERE consultant_id IS NOT NULL AND deleted_at IS NULL;

-- ============================================================================
-- Competencies Table Indexes
-- ============================================================================

-- Index for assessment competencies
-- Covers: GET /api/assessments/:id/competencies
CREATE INDEX IF NOT EXISTS idx_competencies_assessment
  ON competencies(assessment_id, created_at DESC);

-- ============================================================================
-- Recommendations Table Indexes
-- ============================================================================

-- Index for fetching recommendations with priority and score
-- Covers: GET /api/assessments/:id/recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_assessment_priority
  ON recommendations(assessment_id, priority, match_score DESC);

-- ============================================================================
-- Sessions Table Indexes (Scheduling)
-- ============================================================================

-- Index for consultant availability and upcoming sessions
-- Covers: Consultant calendar view
CREATE INDEX IF NOT EXISTS idx_sessions_consultant_date
  ON sessions(consultant_id, scheduled_at DESC)
  WHERE completed_at IS NULL AND deleted_at IS NULL;

-- Index for beneficiary session history and upcoming
-- Covers: Beneficiary sessions list
CREATE INDEX IF NOT EXISTS idx_sessions_beneficiary_status
  ON sessions(beneficiary_id, status, scheduled_at DESC)
  WHERE deleted_at IS NULL;

-- Index for session conflicts detection
-- Covers: Double-booking prevention
CREATE INDEX IF NOT EXISTS idx_sessions_availability_check
  ON sessions(consultant_id, scheduled_at, duration)
  WHERE status NOT IN ('CANCELLED', 'NO_SHOW') AND deleted_at IS NULL;

-- ============================================================================
-- Notifications Table Indexes
-- ============================================================================

-- Index for unread notifications query
-- Covers: GET /api/notifications?read=false
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

-- Index for recent notifications
-- Covers: Notification bell dropdown
CREATE INDEX IF NOT EXISTS idx_notifications_user_recent
  ON notifications(user_id, created_at DESC)
  WHERE created_at > NOW() - INTERVAL '7 days';

-- ============================================================================
-- AI Analysis Tables Indexes
-- ============================================================================

-- Index for CV analysis retrieval
-- Covers: GET /api/ai/cv-analysis/:assessmentId
CREATE INDEX IF NOT EXISTS idx_cv_analyses_assessment
  ON cv_analyses(assessment_id, created_at DESC);

-- Index for job recommendations retrieval
-- Covers: GET /api/ai/recommendations/:assessmentId
CREATE INDEX IF NOT EXISTS idx_job_recommendations_assessment
  ON job_recommendations(assessment_id, created_at DESC);

-- Index for personality analysis retrieval
CREATE INDEX IF NOT EXISTS idx_personality_analyses_assessment
  ON personality_analyses(assessment_id, created_at DESC);

-- Index for action plans retrieval
CREATE INDEX IF NOT EXISTS idx_action_plans_assessment
  ON action_plans(assessment_id, created_at DESC);

-- ============================================================================
-- Audit Logs Indexes
-- ============================================================================

-- Index for user activity history
-- Covers: User audit trail queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp
  ON audit_logs(user_id, timestamp DESC);

-- Index for action-based audit queries
-- Covers: Security monitoring
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp
  ON audit_logs(action, timestamp DESC)
  WHERE action IN ('LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGE');

-- ============================================================================
-- Users Table Indexes
-- ============================================================================

-- Case-insensitive email index for login
-- Covers: POST /api/auth/login
CREATE INDEX IF NOT EXISTS idx_users_email_lower
  ON users(LOWER(email))
  WHERE deleted_at IS NULL;

-- Index for organization user queries
-- Covers: GET /api/organizations/:id/users
CREATE INDEX IF NOT EXISTS idx_users_org_role
  ON users(organization_id, role, created_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- Qualiopi Tables Indexes (Compliance)
-- ============================================================================

-- Index for active surveys
CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_org_status
  ON satisfaction_surveys(organization_id, status, created_at DESC);

-- Index for survey responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey
  ON survey_responses(survey_id, submitted_at DESC);

-- Index for compliance reports
CREATE INDEX IF NOT EXISTS idx_compliance_reports_org_year
  ON compliance_reports(organization_id, report_year DESC, report_quarter DESC);

-- ============================================================================
-- Performance Monitoring Views
-- ============================================================================

-- Create a view for index usage statistics (PostgreSQL specific)
CREATE OR REPLACE VIEW v_index_usage_stats AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Create a view for table bloat monitoring
CREATE OR REPLACE VIEW v_table_bloat AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size,
  n_live_tup AS live_rows,
  n_dead_tup AS dead_rows,
  ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_ratio
FROM pg_stat_user_tables
WHERE n_live_tup > 0
ORDER BY n_dead_tup DESC;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON INDEX idx_assessments_user_status IS 'Optimizes user assessment queries filtered by status';
COMMENT ON INDEX idx_sessions_consultant_date IS 'Optimizes consultant calendar and availability queries';
COMMENT ON INDEX idx_notifications_user_read IS 'Optimizes unread notification count queries';
COMMENT ON INDEX idx_audit_logs_action_timestamp IS 'Optimizes security audit and monitoring queries';

-- ============================================================================
-- Performance Tips
-- ============================================================================

-- Run ANALYZE after creating indexes to update statistics
ANALYZE assessments;
ANALYZE sessions;
ANALYZE notifications;
ANALYZE recommendations;
ANALYZE competencies;
ANALYZE users;
ANALYZE audit_logs;
ANALYZE cv_analyses;
ANALYZE job_recommendations;

-- ============================================================================
-- Maintenance Recommendations
-- ============================================================================

/*
1. Monitor index usage with:
   SELECT * FROM v_index_usage_stats WHERE index_scans = 0;

2. Check for table bloat:
   SELECT * FROM v_table_bloat WHERE dead_ratio > 20;

3. Run VACUUM ANALYZE periodically:
   VACUUM ANALYZE;

4. Reindex if needed:
   REINDEX TABLE assessments;

5. Monitor query performance:
   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
*/
