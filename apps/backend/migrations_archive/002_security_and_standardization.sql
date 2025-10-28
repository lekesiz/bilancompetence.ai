-- ============================================================================
-- Migration 002: Security & Standardization
-- Date: 2025-10-24
-- Description: Add missing RLS policies, standardize table names, improve security
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING RLS POLICIES
-- ============================================================================

-- Users table: INSERT policy (only org admins can create users)
CREATE POLICY users_insert_admin ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'ORG_ADMIN'
    )
  );

-- Users table: UPDATE policy (users can update their own profile, admins can update any)
CREATE POLICY users_update_self ON users FOR UPDATE
  USING (
    auth.uid()::text = id::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'ORG_ADMIN'
    )
  );

-- Users table: DELETE policy (only org admins can delete users)
CREATE POLICY users_delete_admin ON users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'ORG_ADMIN'
    )
  );

-- Bilans table: INSERT policy (beneficiaries create their own, consultants/admins can create for others)
CREATE POLICY bilans_insert_own ON bilans FOR INSERT
  WITH CHECK (
    beneficiary_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role IN ('CONSULTANT', 'ORG_ADMIN')
    )
  );

-- Bilans table: UPDATE policy (involved users can update)
CREATE POLICY bilans_update_involved ON bilans FOR UPDATE
  USING (
    beneficiary_id = auth.uid()::uuid OR
    consultant_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'ORG_ADMIN'
      AND organization_id = bilans.organization_id
    )
  );

-- Bilans table: DELETE policy (only org admins can delete)
CREATE POLICY bilans_delete_admin ON bilans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'ORG_ADMIN'
      AND organization_id = bilans.organization_id
    )
  );

-- Messages table: INSERT policy (sender must be authenticated user)
CREATE POLICY messages_insert_own ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid()::uuid);

-- Messages table: UPDATE policy (only sender can update their messages)
CREATE POLICY messages_update_sender ON messages FOR UPDATE
  USING (sender_id = auth.uid()::uuid);

-- Messages table: DELETE policy (sender or admin can delete)
CREATE POLICY messages_delete_own ON messages FOR DELETE
  USING (
    sender_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'ORG_ADMIN'
    )
  );

-- Competencies table: INSERT policy (only involved users can add competencies)
CREATE POLICY competencies_insert_involved ON competencies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bilans 
      WHERE id = competencies.bilan_id 
      AND (
        beneficiary_id = auth.uid()::uuid OR
        consultant_id = auth.uid()::uuid
      )
    )
  );

-- Competencies table: UPDATE policy (only involved users can update)
CREATE POLICY competencies_update_involved ON competencies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM bilans 
      WHERE id = competencies.bilan_id 
      AND (
        beneficiary_id = auth.uid()::uuid OR
        consultant_id = auth.uid()::uuid
      )
    )
  );

-- Competencies table: DELETE policy (only involved users can delete)
CREATE POLICY competencies_delete_involved ON competencies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM bilans 
      WHERE id = competencies.bilan_id 
      AND (
        beneficiary_id = auth.uid()::uuid OR
        consultant_id = auth.uid()::uuid
      )
    )
  );

-- ============================================================================
-- PART 2: AUDIT LOG IMPROVEMENTS
-- ============================================================================

-- Add endpoint column to audit_logs for better tracking
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS endpoint VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_method VARCHAR(10);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_endpoint ON audit_logs(endpoint);

-- ============================================================================
-- PART 3: PERFORMANCE INDEXES
-- ============================================================================

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_bilans_beneficiary_id ON bilans(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_bilans_consultant_id ON bilans(consultant_id);
CREATE INDEX IF NOT EXISTS idx_bilans_organization_id ON bilans(organization_id);
CREATE INDEX IF NOT EXISTS idx_bilans_status ON bilans(status);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_competencies_bilan_id ON competencies(bilan_id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- PART 4: DATA VALIDATION CONSTRAINTS
-- ============================================================================

-- Add check constraints for data validation
ALTER TABLE users ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE bilans ADD CONSTRAINT check_status_valid 
  CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

ALTER TABLE messages ADD CONSTRAINT check_message_type_valid 
  CHECK (message_type IN ('TEXT', 'FILE', 'SYSTEM'));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

