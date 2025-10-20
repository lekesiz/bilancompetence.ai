-- BilanCompetence.AI Database Schema
-- Created: October 24, 2025
-- Version: 1.0

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  age INT,
  role VARCHAR(50) NOT NULL DEFAULT 'BENEFICIARY',
  organization_id UUID,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  siret VARCHAR(14),
  subscription_plan VARCHAR(50) DEFAULT 'STARTER',
  address TEXT,
  phone VARCHAR(20),
  website VARCHAR(255),
  qualiopi_certified BOOLEAN DEFAULT FALSE,
  qualiopi_expiry DATE,
  stripe_customer_id VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- ============================================================================
-- BILANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS bilans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'PRELIMINARY',
  start_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  duration_hours INT DEFAULT 24,
  contract_signed BOOLEAN DEFAULT FALSE,
  signed_contract_url TEXT,
  satisfaction_score INT,
  completion_percentage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- ============================================================================
-- COMPETENCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  rome_code VARCHAR(10),
  self_assessment_level VARCHAR(50),
  consultant_assessment_level VARCHAR(50),
  frequency_of_use VARCHAR(50),
  interest_level INT,
  ai_transferability_score FLOAT,
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  rome_code VARCHAR(10),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  match_score FLOAT,
  required_skills JSONB,
  training_path JSONB,
  priority INT,
  ai_generated BOOLEAN DEFAULT TRUE,
  consultant_validated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  file_format VARCHAR(10),
  version INT DEFAULT 1,
  ai_generated BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'TEXT',
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50),
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INT,
  notes TEXT,
  attendance VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AUDIT_LOGS TABLE (GDPR Compliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  action VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_bilans_beneficiary ON bilans(beneficiary_id);
CREATE INDEX idx_bilans_consultant ON bilans(consultant_id);
CREATE INDEX idx_bilans_status ON bilans(status);
CREATE INDEX idx_bilans_organization ON bilans(organization_id);
CREATE INDEX idx_competencies_bilan ON competencies(bilan_id);
CREATE INDEX idx_recommendations_bilan ON recommendations(bilan_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_read ON messages(read_at);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY users_view_self ON users FOR SELECT
  USING (auth.uid()::text = id::text OR role = 'ORG_ADMIN');

-- Users can view bilans they're involved with
CREATE POLICY bilans_view_own ON bilans FOR SELECT
  USING (
    beneficiary_id = auth.uid()::uuid OR
    consultant_id = auth.uid()::uuid OR
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()::uuid
    )
  );

-- Users can view messages they're part of
CREATE POLICY messages_view_own ON messages FOR SELECT
  USING (
    sender_id = auth.uid()::uuid OR
    recipient_id = auth.uid()::uuid
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
  ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE
  ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bilans_updated_at BEFORE UPDATE
  ON bilans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE
  ON competencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE
  ON recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE
  ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE
  ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional for development)
-- ============================================================================

-- Insert test organization
INSERT INTO organizations (name, siret, subscription_plan, address, phone, website, qualiopi_certified)
VALUES (
  'Test Organization',
  '12345678901234',
  'PROFESSIONAL',
  '123 Test Street, Paris, France',
  '+33123456789',
  'https://example.com',
  TRUE
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- End of Schema
-- ============================================================================
