-- Migration: Add CV columns to users table
-- Description: Add cv_url and cv_uploaded_at columns to store user CV information
-- Date: 2025-10-25

-- Add cv_url column to store the URL of the uploaded CV
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Add cv_uploaded_at column to store the timestamp when CV was uploaded
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cv_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add index on cv_uploaded_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_cv_uploaded_at ON users(cv_uploaded_at);

-- Add comment to cv_url column
COMMENT ON COLUMN users.cv_url IS 'URL of the user CV file stored in Supabase Storage';

-- Add comment to cv_uploaded_at column
COMMENT ON COLUMN users.cv_uploaded_at IS 'Timestamp when the CV was last uploaded';

-- Create storage bucket for CVs (this will be done via Supabase Dashboard or API)
-- Bucket name: 'cvs'
-- Public: false (only authenticated users can access their own CVs)
-- File size limit: 5MB
-- Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

