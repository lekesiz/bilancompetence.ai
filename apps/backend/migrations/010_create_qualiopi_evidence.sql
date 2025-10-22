-- Migration 010: Create Qualiopi Evidence Table
-- Date: 2025-10-23
-- Purpose: Store evidence files for Qualiopi indicator compliance
-- Status: NEW

-- ============================================================================
-- QUALIOPI_EVIDENCE TABLE
-- ============================================================================
-- Stores evidence files uploaded to support Qualiopi indicator compliance
CREATE TABLE IF NOT EXISTS qualiopi_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id INT NOT NULL REFERENCES qualiopi_indicators(id) ON DELETE RESTRICT,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_size INT,
  file_type VARCHAR(50),
  -- e.g., "application/pdf", "image/png", "text/plain"
  description TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qualiopi_evidence_indicator ON qualiopi_evidence(indicator_id);
CREATE INDEX IF NOT EXISTS idx_qualiopi_evidence_org ON qualiopi_evidence(organization_id);
CREATE INDEX IF NOT EXISTS idx_qualiopi_evidence_uploaded_by ON qualiopi_evidence(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_qualiopi_evidence_created ON qualiopi_evidence(created_at);
CREATE INDEX IF NOT EXISTS idx_qualiopi_evidence_composite ON qualiopi_evidence(organization_id, indicator_id);

-- Add comments
COMMENT ON TABLE qualiopi_evidence IS 'Evidence files supporting Qualiopi indicator compliance';
COMMENT ON COLUMN qualiopi_evidence.file_url IS 'URL or path to the stored file (e.g., S3, local storage)';
COMMENT ON COLUMN qualiopi_evidence.file_type IS 'MIME type of the file';
COMMENT ON COLUMN qualiopi_evidence.description IS 'Description of what this evidence demonstrates';

