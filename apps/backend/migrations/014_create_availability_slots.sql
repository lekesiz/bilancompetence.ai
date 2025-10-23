-- Migration: Create availability_slots table for consultant scheduling
-- Purpose: Store consultant availability time blocks for session bookings
-- Created: 2025-10-23

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Recurring schedule
  day_of_week INTEGER, -- 0=Monday, 1=Tuesday, ... 6=Sunday (NULL for custom dates)
  date_specific DATE, -- For one-time slots (overrides recurring)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  max_concurrent_bookings INTEGER DEFAULT 1,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Recurrence settings
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_until DATE, -- NULL = indefinite
  
  -- Availability status
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP -- Soft delete
);

-- Indexes for performance
CREATE INDEX idx_availability_slots_consultant_id ON availability_slots(consultant_id);
CREATE INDEX idx_availability_slots_organization_id ON availability_slots(organization_id);
CREATE INDEX idx_availability_slots_day_of_week ON availability_slots(day_of_week);
CREATE INDEX idx_availability_slots_date_specific ON availability_slots(date_specific);
CREATE INDEX idx_availability_slots_is_available ON availability_slots(is_available);

-- RLS (Row Level Security) for multi-tenancy
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see availability for their own organization or bookings
CREATE POLICY "availability_slots_select" ON availability_slots
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
    OR
    consultant_id = auth.uid()
  );

-- Policy: Only consultant or org admin can update/insert
CREATE POLICY "availability_slots_insert_update" ON availability_slots
  FOR INSERT
  WITH CHECK (
    consultant_id = auth.uid() -- Only consultant can create their own
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "availability_slots_update" ON availability_slots
  FOR UPDATE
  USING (
    consultant_id = auth.uid()
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    consultant_id = auth.uid()
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- Policy: Only consultant or org admin can delete
CREATE POLICY "availability_slots_delete" ON availability_slots
  FOR DELETE
  USING (
    consultant_id = auth.uid()
    AND
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE availability_slots IS 'Stores consultant availability time slots for session booking system';
COMMENT ON COLUMN availability_slots.day_of_week IS '0=Monday, 6=Sunday, NULL for custom dates';
COMMENT ON COLUMN availability_slots.date_specific IS 'For one-time slots, overrides recurring schedule';
COMMENT ON COLUMN availability_slots.is_recurring IS 'TRUE for repeating slots, FALSE for one-time';
COMMENT ON COLUMN availability_slots.recurring_until IS 'End date for recurring slots, NULL = indefinite';
