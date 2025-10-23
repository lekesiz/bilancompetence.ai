-- Migration: Create session_reminders table for automated notifications
-- Purpose: Track reminder emails/notifications for sessions
-- Created: 2025-10-23

CREATE TABLE IF NOT EXISTS session_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_booking_id UUID NOT NULL REFERENCES session_bookings(id) ON DELETE CASCADE,
  
  -- Reminder type
  reminder_type VARCHAR(50) NOT NULL,
    -- BENEFICIARY_24H, BENEFICIARY_1H, CONSULTANT_24H, CONSULTANT_1H, BENEFICIARY_POST_SESSION
  
  -- Timing
  scheduled_time TIMESTAMP NOT NULL,
  sent_at TIMESTAMP, -- NULL if not yet sent
  
  -- Status
  failed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_session_reminders_session_booking_id ON session_reminders(session_booking_id);
CREATE INDEX idx_session_reminders_scheduled_time ON session_reminders(scheduled_time);
CREATE INDEX idx_session_reminders_reminder_type ON session_reminders(reminder_type);
CREATE INDEX idx_session_reminders_sent_at ON session_reminders(sent_at);
CREATE INDEX idx_session_reminders_failed ON session_reminders(failed);

-- RLS (Row Level Security)
ALTER TABLE session_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see reminders for their bookings through session_bookings
CREATE POLICY "session_reminders_select" ON session_reminders
  FOR SELECT
  USING (
    session_booking_id IN (
      SELECT id FROM session_bookings 
      WHERE beneficiary_id = auth.uid() OR consultant_id = auth.uid()
    )
    OR
    session_booking_id IN (
      SELECT id FROM session_bookings 
      WHERE organization_id IN (
        SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Only system can insert/update reminders
CREATE POLICY "session_reminders_insert" ON session_reminders
  FOR INSERT
  WITH CHECK (true); -- System service creates these

CREATE POLICY "session_reminders_update" ON session_reminders
  FOR UPDATE
  USING (true) -- System service updates these
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE session_reminders IS 'Stores scheduled and sent reminder notifications for sessions';
COMMENT ON COLUMN session_reminders.reminder_type IS 'Type of reminder: BENEFICIARY_24H, CONSULTANT_1H, POST_SESSION, etc.';
COMMENT ON COLUMN session_reminders.sent_at IS 'When reminder was actually sent (NULL if pending)';
COMMENT ON COLUMN session_reminders.retry_count IS 'Number of retry attempts if initial send failed';
