-- Migration: Add cv_uploaded_at column to users table
-- Created: October 26, 2025
-- Description: Add timestamp for CV upload tracking

-- Add cv_uploaded_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'cv_uploaded_at'
    ) THEN
        ALTER TABLE users ADD COLUMN cv_uploaded_at TIMESTAMP;
        COMMENT ON COLUMN users.cv_uploaded_at IS 'Timestamp when CV was uploaded';
    END IF;
END $$;

