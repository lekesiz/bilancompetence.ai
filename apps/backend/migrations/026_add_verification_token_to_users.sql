-- Migration 026: Add verification and reset tokens to users table
-- Date: 2025-10-26
-- Purpose: Support email verification and password reset functionality
-- Dependencies: 001_create_schema.sql (users table must exist)

-- ============================================================================
-- ADD VERIFICATION AND RESET TOKEN COLUMNS
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- ============================================================================
-- CREATE INDEXES FOR TOKEN LOOKUPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_verification_token 
ON users(verification_token) 
WHERE verification_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_reset_password_token 
ON users(reset_password_token) 
WHERE reset_password_token IS NOT NULL;

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN users.verification_token IS 'Token for email verification (expires in 24 hours)';
COMMENT ON COLUMN users.verification_token_expires IS 'Expiration timestamp for verification token';
COMMENT ON COLUMN users.reset_password_token IS 'Token for password reset (expires in 1 hour)';
COMMENT ON COLUMN users.reset_password_expires IS 'Expiration timestamp for reset password token';

