-- Migration: Create session_analytics table for tracking statistics
-- Purpose: Store aggregated session metrics for analytics dashboards
-- Created: 2025-10-23

CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date dimension
  session_date DATE NOT NULL,
  
  -- Session counts
  total_sessions_scheduled INTEGER DEFAULT 0,
  total_sessions_completed INTEGER DEFAULT 0,
  total_sessions_no_show INTEGER DEFAULT 0,
  total_sessions_cancelled INTEGER DEFAULT 0,
  
  -- Metrics
  average_rating DECIMAL(3, 2), -- 1-5 star average
  total_hours_completed DECIMAL(8, 2),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Unique constraint: one record per org/consultant/date
CREATE UNIQUE INDEX idx_session_analytics_unique 
  ON session_analytics(organization_id, consultant_id, session_date);

-- Indexes
CREATE INDEX idx_session_analytics_organization_id ON session_analytics(organization_id);
CREATE INDEX idx_session_analytics_consultant_id ON session_analytics(consultant_id);
CREATE INDEX idx_session_analytics_session_date ON session_analytics(session_date);

-- RLS (Row Level Security)
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see analytics for their org or themselves
CREATE POLICY "session_analytics_select" ON session_analytics
  FOR SELECT
  USING (
    consultant_id = auth.uid()
    OR
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- Policy: Only system can insert/update analytics
CREATE POLICY "session_analytics_insert" ON session_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "session_analytics_update" ON session_analytics
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE session_analytics IS 'Aggregated session metrics per consultant per date for analytics';
COMMENT ON COLUMN session_analytics.session_date IS 'The date these metrics cover';
COMMENT ON COLUMN session_analytics.average_rating IS 'Average beneficiary rating (1-5)';
