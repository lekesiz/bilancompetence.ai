-- Migration 009: Create Organization Qualiopi Status Table
-- Date: 2025-10-23
-- Purpose: Track each organization's compliance status for each Qualiopi indicator
-- Status: NEW

-- ============================================================================
-- ORGANIZATION_QUALIOPI_STATUS TABLE
-- ============================================================================
-- Tracks the compliance status of each indicator per organization
CREATE TABLE IF NOT EXISTS organization_qualiopi_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  indicator_id INT NOT NULL REFERENCES qualiopi_indicators(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'MISSING' CHECK (status IN ('COMPLIANT', 'MISSING', 'UNDER_REVIEW')),
  notes TEXT,
  last_reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(organization_id, indicator_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_qualiopi_org_id ON organization_qualiopi_status(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_qualiopi_indicator_id ON organization_qualiopi_status(indicator_id);
CREATE INDEX IF NOT EXISTS idx_org_qualiopi_status ON organization_qualiopi_status(status);
CREATE INDEX IF NOT EXISTS idx_org_qualiopi_reviewed_at ON organization_qualiopi_status(last_reviewed_at);

-- Add comments
COMMENT ON TABLE organization_qualiopi_status IS 'Tracks compliance status of Qualiopi indicators per organization';
COMMENT ON COLUMN organization_qualiopi_status.status IS 'COMPLIANT: Fully meets requirement, MISSING: No evidence, UNDER_REVIEW: Being reviewed';
COMMENT ON COLUMN organization_qualiopi_status.notes IS 'Additional notes or action items';

-- Update organizations table if not already done
ALTER TABLE IF EXISTS organizations
ADD COLUMN IF NOT EXISTS qualiopi_last_audit_date DATE,
ADD COLUMN IF NOT EXISTS qualiopi_compliance_percentage INT DEFAULT 0 CHECK (qualiopi_compliance_percentage >= 0 AND qualiopi_compliance_percentage <= 100);

-- Create index on organizations for compliance tracking
CREATE INDEX IF NOT EXISTS idx_organizations_qualiopi_certified ON organizations(qualiopi_certified);
CREATE INDEX IF NOT EXISTS idx_organizations_qualiopi_expiry ON organizations(qualiopi_expiry);

-- Add comments to organizations table columns
COMMENT ON COLUMN organizations.qualiopi_certified IS 'Whether organization has Qualiopi certification';
COMMENT ON COLUMN organizations.qualiopi_expiry IS 'Date when Qualiopi certification expires';
COMMENT ON COLUMN organizations.qualiopi_last_audit_date IS 'Date of last Qualiopi audit';
COMMENT ON COLUMN organizations.qualiopi_compliance_percentage IS 'Overall compliance percentage (0-100)';

