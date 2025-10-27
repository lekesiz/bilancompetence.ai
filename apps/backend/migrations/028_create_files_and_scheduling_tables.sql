-- Migration 028: Create files and scheduling tables
-- Created: 2025-10-27

-- ============================================================================
-- FILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  storage_path TEXT NOT NULL,
  bucket VARCHAR(100) NOT NULL DEFAULT 'files',
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_bucket ON files(bucket);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

COMMENT ON TABLE files IS 'File uploads and storage metadata';
COMMENT ON COLUMN files.user_id IS 'User who uploaded the file';
COMMENT ON COLUMN files.storage_path IS 'Path in storage system (S3, local, etc)';
COMMENT ON COLUMN files.bucket IS 'Storage bucket name';
COMMENT ON COLUMN files.url IS 'Public URL or signed URL for file access';

-- ============================================================================
-- ASSESSMENT DOCUMENTS (Link table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_documents (
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (assessment_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_documents_assessment_id ON assessment_documents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_documents_file_id ON assessment_documents(file_id);

COMMENT ON TABLE assessment_documents IS 'Links files to assessments';

-- ============================================================================
-- AVAILABILITY SLOTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  date_specific DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  max_concurrent_bookings INTEGER NOT NULL DEFAULT 1,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_until DATE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT valid_recurring CHECK (
    (is_recurring = false) OR 
    (is_recurring = true AND recurring_until IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_availability_slots_consultant_id ON availability_slots(consultant_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_organization_id ON availability_slots(organization_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON availability_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date_specific ON availability_slots(date_specific);

COMMENT ON TABLE availability_slots IS 'Consultant availability for session booking';
COMMENT ON COLUMN availability_slots.day_of_week IS '0=Monday, 6=Sunday (for recurring slots)';
COMMENT ON COLUMN availability_slots.date_specific IS 'Specific date for one-time availability';
COMMENT ON COLUMN availability_slots.is_recurring IS 'Whether this slot repeats weekly';

-- ============================================================================
-- SESSION BOOKINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (
    status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')
  ),
  session_type VARCHAR(50) NOT NULL DEFAULT 'FOLLOW_UP' CHECK (
    session_type IN ('INITIAL_MEETING', 'FOLLOW_UP', 'REVIEW', 'FINAL')
  ),
  meeting_format VARCHAR(50) NOT NULL DEFAULT 'VIDEO' CHECK (
    meeting_format IN ('IN_PERSON', 'VIDEO', 'PHONE')
  ),
  meeting_location TEXT,
  meeting_link TEXT,
  beneficiary_notes TEXT,
  consultant_notes TEXT,
  preparation_materials TEXT,
  availability_slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  attended BOOLEAN,
  beneficiary_rating INTEGER CHECK (beneficiary_rating >= 1 AND beneficiary_rating <= 5),
  beneficiary_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_time_range CHECK (scheduled_start_time < scheduled_end_time)
);

CREATE INDEX IF NOT EXISTS idx_session_bookings_bilan_id ON session_bookings(bilan_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_beneficiary_id ON session_bookings(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_consultant_id ON session_bookings(consultant_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_organization_id ON session_bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_scheduled_date ON session_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_session_bookings_status ON session_bookings(status);

COMMENT ON TABLE session_bookings IS 'Scheduled sessions between consultants and beneficiaries';
COMMENT ON COLUMN session_bookings.status IS 'SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW';
COMMENT ON COLUMN session_bookings.attended IS 'Whether beneficiary attended the session';

-- ============================================================================
-- CONSULTANT ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultant_analytics (
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  completed_sessions INTEGER NOT NULL DEFAULT 0,
  cancelled_sessions INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (consultant_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_consultant_analytics_consultant_id ON consultant_analytics(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultant_analytics_organization_id ON consultant_analytics(organization_id);

COMMENT ON TABLE consultant_analytics IS 'Aggregated analytics for consultant performance';
COMMENT ON COLUMN consultant_analytics.average_rating IS 'Average beneficiary rating (1-5)';
COMMENT ON COLUMN consultant_analytics.total_hours IS 'Total hours of completed sessions';

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on files
CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_files_updated_at();

-- Update updated_at timestamp on availability_slots
CREATE OR REPLACE FUNCTION update_availability_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_slots_updated_at();

-- Update updated_at timestamp on session_bookings
CREATE OR REPLACE FUNCTION update_session_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_bookings_updated_at
  BEFORE UPDATE ON session_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_bookings_updated_at();

