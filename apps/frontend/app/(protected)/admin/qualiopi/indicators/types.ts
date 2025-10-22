export interface Indicator {
  indicator_id: number;
  name: string;
  status: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW';
  evidence_count: number;
  last_reviewed_at: string | null;
  reviewed_by_name: string | null;
}

