-- Migration 013: Create Qualiopi Audit Log Table
-- Date: 2025-10-23
-- Purpose: Audit trail for all Qualiopi compliance changes
-- Status: NEW

-- ============================================================================
-- QUALIOPI_AUDIT_LOG TABLE
-- ============================================================================
-- Complete audit trail of all Qualiopi compliance changes
CREATE TABLE IF NOT EXISTS qualiopi_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  -- e.g., "Indicator Updated", "Evidence Added", "Survey Sent", "Document Archived"
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('INDICATOR_UPDATE', 'EVIDENCE_ADD', 'EVIDENCE_REMOVE', 'SURVEY_SEND', 'SURVEY_COMPLETE', 'DOCUMENT_ARCHIVE', 'DOCUMENT_ACCESS', 'STATUS_CHANGE', 'REPORT_GENERATE', 'ADMIN_ACTION')),
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  details JSONB,
  -- Store what changed: {"before": {...}, "after": {...}, "fields_changed": [...]}
  entity_type VARCHAR(50),
  -- e.g., "INDICATOR", "EVIDENCE", "SURVEY", "DOCUMENT", "STATUS"
  entity_id UUID,
  -- ID of the entity that changed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_org_id ON qualiopi_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON qualiopi_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_changed_by ON qualiopi_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON qualiopi_audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON qualiopi_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_composite ON qualiopi_audit_log(organization_id, changed_at);

-- Add comments
COMMENT ON TABLE qualiopi_audit_log IS 'Complete audit trail for all Qualiopi compliance module actions';
COMMENT ON COLUMN qualiopi_audit_log.action IS 'Human-readable description of the action';
COMMENT ON COLUMN qualiopi_audit_log.action_type IS 'Structured action type for filtering and analysis';
COMMENT ON COLUMN qualiopi_audit_log.details IS 'JSONB containing detailed change information';
COMMENT ON COLUMN qualiopi_audit_log.entity_type IS 'Type of entity affected (INDICATOR, EVIDENCE, SURVEY, etc.)';
COMMENT ON COLUMN qualiopi_audit_log.entity_id IS 'ID of the affected entity for linking to audit changes';

