-- Migration: Add cv_url column to users table
-- Created: October 26, 2025
-- Purpose: Fix registration error - column "cv_url" does not exist

-- Add cv_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.cv_url IS 'URL to user CV stored in Supabase Storage';

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_cv_url ON users(cv_url) WHERE cv_url IS NOT NULL;

