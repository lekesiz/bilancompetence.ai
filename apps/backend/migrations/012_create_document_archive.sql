-- Migration 012: Create Document Archive Tables
-- Date: 2025-10-23
-- Purpose: Archive bilan documents with audit trail and retention policies
-- Status: NEW

-- ============================================================================
-- DOCUMENT_ARCHIVE TABLE
-- ============================================================================
-- Stores archived bilan-related documents for Qualiopi compliance
CREATE TABLE IF NOT EXISTS document_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('PRELIMINARY', 'INVESTIGATION', 'CONCLUSION', 'REPORT', 'EVIDENCE', 'OTHER')),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_size INT,
  -- Size in bytes
  file_hash VARCHAR(64),
  -- SHA256 hash for integrity verification
  mime_type VARCHAR(100),
  -- e.g., "application/pdf"
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  -- Soft delete
  retention_until TIMESTAMP
  -- Auto-delete after this date (e.g., 5 years)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_archive_bilan ON document_archive(bilan_id);
CREATE INDEX IF NOT EXISTS idx_document_archive_org ON document_archive(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_archive_type ON document_archive(document_type);
CREATE INDEX IF NOT EXISTS idx_document_archive_created_by ON document_archive(created_by);
CREATE INDEX IF NOT EXISTS idx_document_archive_created_at ON document_archive(created_at);
CREATE INDEX IF NOT EXISTS idx_document_archive_retention ON document_archive(retention_until);
CREATE INDEX IF NOT EXISTS idx_document_archive_hash ON document_archive(file_hash);
CREATE INDEX IF NOT EXISTS idx_document_archive_composite ON document_archive(organization_id, created_at);

-- Add comments
COMMENT ON TABLE document_archive IS 'Archived bilan documents for Qualiopi compliance and audit trail';
COMMENT ON COLUMN document_archive.document_type IS 'Type of document: PRELIMINARY, INVESTIGATION, CONCLUSION, REPORT, EVIDENCE, OTHER';
COMMENT ON COLUMN document_archive.file_hash IS 'SHA256 hash for verifying document integrity and detecting duplicates';
COMMENT ON COLUMN document_archive.retention_until IS 'Automatic deletion date based on compliance retention policy (typically 5 years)';

-- ============================================================================
-- DOCUMENT_ACCESS_LOG TABLE
-- ============================================================================
-- Audit trail for document access (who, what, when)
CREATE TABLE IF NOT EXISTS document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES document_archive(id) ON DELETE CASCADE,
  accessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('VIEW', 'DOWNLOAD', 'SHARE', 'DELETE_REQUEST')),
  accessed_at TIMESTAMP DEFAULT NOW(),
  user_ip VARCHAR(45),
  user_agent TEXT,
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_access_log_document ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_access_log_user ON document_access_log(accessed_by);
CREATE INDEX IF NOT EXISTS idx_access_log_action ON document_access_log(action);
CREATE INDEX IF NOT EXISTS idx_access_log_accessed_at ON document_access_log(accessed_at);
CREATE INDEX IF NOT EXISTS idx_access_log_composite ON document_access_log(document_id, accessed_at);

-- Add comments
COMMENT ON TABLE document_access_log IS 'Audit trail of all document access for compliance verification';
COMMENT ON COLUMN document_access_log.action IS 'Type of access: VIEW (preview), DOWNLOAD (full download), SHARE (shared with), DELETE_REQUEST (deletion requested)';
COMMENT ON COLUMN document_access_log.user_ip IS 'IP address of accessing user for security auditing';
COMMENT ON COLUMN document_access_log.user_agent IS 'Browser/client user agent string';

