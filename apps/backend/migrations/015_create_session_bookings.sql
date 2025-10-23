-- Migration: Create session_bookings table for appointment reservations
-- Purpose: Store booked sessions between beneficiaries and consultants
-- Created: 2025-10-23

CREATE TABLE IF NOT EXISTS session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  availability_slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL,
  
  -- Scheduling details
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Session details
  session_type VARCHAR(50) NOT NULL DEFAULT 'FOLLOW_UP', 
    -- INITIAL_MEETING, FOLLOW_UP, REVIEW, FINAL
  meeting_format VARCHAR(50) NOT NULL DEFAULT 'VIDEO', 
    -- IN_PERSON, VIDEO, PHONE
  meeting_location VARCHAR(255), -- Address or room number
  meeting_link VARCHAR(500), -- Zoom/Google Meet link
  
  -- Notes
  beneficiary_notes TEXT,
  consultant_notes TEXT,
  preparation_materials TEXT,
  
  -- Status & tracking
  status VARCHAR(50) DEFAULT 'SCHEDULED',
    -- SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  attended BOOLEAN, -- NULL = not yet marked, true/false after session
  cancellation_reason TEXT,
  
  -- Feedback & rating
  beneficiary_rating INTEGER, -- 1-5 stars
  beneficiary_feedback TEXT,
  
  -- Audit fields
  bilan_phase_at_booking VARCHAR(50), -- PRELIMINARY, INVESTIGATION, CONCLUSION
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete
);

-- Indexes
CREATE INDEX idx_session_bookings_bilan_id ON session_bookings(bilan_id);
CREATE INDEX idx_session_bookings_consultant_id ON session_bookings(consultant_id);
CREATE INDEX idx_session_bookings_beneficiary_id ON session_bookings(beneficiary_id);
CREATE INDEX idx_session_bookings_organization_id ON session_bookings(organization_id);
CREATE INDEX idx_session_bookings_scheduled_date ON session_bookings(scheduled_date);
CREATE INDEX idx_session_bookings_status ON session_bookings(status);
CREATE INDEX idx_session_bookings_availability_slot_id ON session_bookings(availability_slot_id);

-- RLS (Row Level Security)
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own bookings or org members' bookings
CREATE POLICY "session_bookings_select" ON session_bookings
  FOR SELECT
  USING (
    (beneficiary_id = auth.uid() OR consultant_id = auth.uid())
    OR
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- Policy: Beneficiary or consultant can create bookings
CREATE POLICY "session_bookings_insert" ON session_bookings
  FOR INSERT
  WITH CHECK (
    (beneficiary_id = auth.uid() OR consultant_id = auth.uid())
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- Policy: Beneficiary or consultant can update their bookings
CREATE POLICY "session_bookings_update" ON session_bookings
  FOR UPDATE
  USING (
    (beneficiary_id = auth.uid() OR consultant_id = auth.uid())
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    (beneficiary_id = auth.uid() OR consultant_id = auth.uid())
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- Policy: Only consultant or org admin can delete
CREATE POLICY "session_bookings_delete" ON session_bookings
  FOR DELETE
  USING (
    (consultant_id = auth.uid() OR beneficiary_id = auth.uid())
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE session_bookings IS 'Stores booked sessions between beneficiaries and consultants';
COMMENT ON COLUMN session_bookings.session_type IS 'Type of session: INITIAL_MEETING, FOLLOW_UP, REVIEW, FINAL';
COMMENT ON COLUMN session_bookings.meeting_format IS 'Format: IN_PERSON, VIDEO, PHONE';
COMMENT ON COLUMN session_bookings.attended IS 'NULL=unresolved, true=attended, false=no-show';
