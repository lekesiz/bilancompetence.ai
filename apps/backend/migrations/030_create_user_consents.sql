-- Migration 030: Create User Consents Tables (RGPD Compliance)
-- Date: 2025-10-30
-- Purpose: Implement consent management system for RGPD compliance
-- Dependencies: 001_create_schema.sql (users table must exist)

-- ============================================================================
-- USER_CONSENTS TABLE
-- ============================================================================
-- Tracks user consent for different processing purposes
-- RGPD Art. 7: Conditions for consent

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT FALSE,
  granted_at TIMESTAMP,
  withdrawn_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  consent_version VARCHAR(20) DEFAULT '1.0',
  purpose TEXT,
  legal_basis VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one consent record per user per consent type
  UNIQUE(user_id, consent_type)
);

-- ============================================================================
-- CONSENT_LOG TABLE
-- ============================================================================
-- Audit trail of all consent changes
-- RGPD Art. 30: Records of processing activities

CREATE TABLE IF NOT EXISTS consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_id UUID REFERENCES user_consents(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL, -- 'granted', 'withdrawn', 'updated'
  previous_value BOOLEAN,
  new_value BOOLEAN,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User consents indexes
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_granted ON user_consents(granted);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_type ON user_consents(user_id, consent_type);

-- Consent log indexes
CREATE INDEX IF NOT EXISTS idx_consent_log_user_id ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_consent_id ON consent_log(consent_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_type ON consent_log(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_log_created_at ON consent_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_log_user_type ON consent_log(user_id, consent_type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to log consent changes
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change
  INSERT INTO consent_log (
    user_id,
    consent_id,
    consent_type,
    action,
    previous_value,
    new_value,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    NEW.user_id,
    NEW.id,
    NEW.consent_type,
    CASE
      WHEN OLD.granted IS NULL AND NEW.granted = TRUE THEN 'granted'
      WHEN OLD.granted = TRUE AND NEW.granted = FALSE THEN 'withdrawn'
      WHEN OLD.granted = FALSE AND NEW.granted = TRUE THEN 'granted'
      ELSE 'updated'
    END,
    OLD.granted,
    NEW.granted,
    NEW.ip_address,
    NEW.user_agent,
    jsonb_build_object(
      'consent_version', NEW.consent_version,
      'purpose', NEW.purpose,
      'legal_basis', NEW.legal_basis
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on user_consents changes
CREATE TRIGGER trigger_log_consent_change
  AFTER INSERT OR UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION log_consent_change();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER trigger_update_consent_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_updated_at();

-- ============================================================================
-- CONSENT TYPES (Reference)
-- ============================================================================
-- These are the standard consent types we'll support:

-- 1. 'essential' - Essential cookies (session, security) - No consent needed
-- 2. 'analytics' - Analytics cookies (Google Analytics, etc.) - Requires consent
-- 3. 'marketing' - Marketing cookies and emails - Requires consent
-- 4. 'preferences' - User preference cookies - Requires consent
-- 5. 'third_party' - Third-party services cookies - Requires consent
-- 6. 'data_processing' - General data processing consent - Required for service
-- 7. 'profiling' - Automated decision-making/profiling - Requires explicit consent

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_consents IS 'User consent records for RGPD compliance (Art. 7)';
COMMENT ON COLUMN user_consents.user_id IS 'User who gave/withdrew consent';
COMMENT ON COLUMN user_consents.consent_type IS 'Type of consent (analytics, marketing, etc.)';
COMMENT ON COLUMN user_consents.granted IS 'Whether consent was granted';
COMMENT ON COLUMN user_consents.granted_at IS 'Timestamp when consent was granted';
COMMENT ON COLUMN user_consents.withdrawn_at IS 'Timestamp when consent was withdrawn';
COMMENT ON COLUMN user_consents.consent_version IS 'Version of consent policy user agreed to';
COMMENT ON COLUMN user_consents.purpose IS 'Purpose of data processing';
COMMENT ON COLUMN user_consents.legal_basis IS 'Legal basis for processing (Art. 6 RGPD)';

COMMENT ON TABLE consent_log IS 'Audit log of consent changes for RGPD Art. 30 compliance';
COMMENT ON COLUMN consent_log.action IS 'Action taken: granted, withdrawn, or updated';
COMMENT ON COLUMN consent_log.previous_value IS 'Previous consent status';
COMMENT ON COLUMN consent_log.new_value IS 'New consent status';
COMMENT ON COLUMN consent_log.metadata IS 'Additional metadata about the consent';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has granted a specific consent
CREATE OR REPLACE FUNCTION has_consent(p_user_id UUID, p_consent_type VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_granted BOOLEAN;
BEGIN
  SELECT granted INTO v_granted
  FROM user_consents
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND (withdrawn_at IS NULL OR withdrawn_at < granted_at);
    
  RETURN COALESCE(v_granted, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to get all user consents
CREATE OR REPLACE FUNCTION get_user_consents(p_user_id UUID)
RETURNS TABLE (
  consent_type VARCHAR,
  granted BOOLEAN,
  granted_at TIMESTAMP,
  withdrawn_at TIMESTAMP,
  consent_version VARCHAR,
  purpose TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.consent_type,
    uc.granted,
    uc.granted_at,
    uc.withdrawn_at,
    uc.consent_version,
    uc.purpose
  FROM user_consents uc
  WHERE uc.user_id = p_user_id
  ORDER BY uc.consent_type;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF MIGRATION 030
-- ============================================================================

