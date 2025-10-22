/**
 * Dashboard Types
 * Comprehensive type definitions for all dashboard-related data structures
 */

// Assessment types
export interface Assessment {
  id: string;
  title: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}

// Recommendation types
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'JOB_MATCH' | 'TRAINING' | 'SKILL_IMPROVEMENT';
  romeCode?: string; // For job matches
  source: string; // AI or manual
  createdAt: string;
}

// Client types
export interface Client {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  lastAssessmentDate?: string;
  contact: string;
}

// User types
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

// Stats types
export interface BeneficiaryStats {
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  averageSatisfaction?: number;
}

export interface ConsultantStats {
  activeClients: number;
  inProgressAssessments: number;
  completedAssessments: number;
  averageSatisfaction?: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  averageSatisfaction?: number;
  activeSessionsCount?: number;
}

// Analytics types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface AnalyticsData {
  completionTrend: ChartDataPoint[];
  statusDistribution: ChartDataPoint[];
  roleDistribution: ChartDataPoint[];
}

// Dashboard response types
export interface BeneficiaryDashboardData {
  bilans: Assessment[];
  recommendations: Recommendation[];
  stats: BeneficiaryStats;
  recentActivity: ActivityLog[];
}

export interface ConsultantDashboardData {
  clients: Client[];
  assessments: Assessment[];
  recommendations: Recommendation[];
  stats: ConsultantStats;
}

export interface AdminDashboardData {
  organization: {
    name: string;
    plan: string;
    usageStats?: Record<string, any>;
  };
  users: DashboardUser[];
  bilans: Assessment[];
  stats: AdminStats;
  analytics: {
    chartData: AnalyticsData;
  };
}

// Activity log type
export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  relatedId?: string;
}

// Hook return types
export interface UseDashboardDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export type BeneficiaryDashboardReturn = UseDashboardDataReturn<BeneficiaryDashboardData>;
export type ConsultantDashboardReturn = UseDashboardDataReturn<ConsultantDashboardData>;
export type AdminDashboardReturn = UseDashboardDataReturn<AdminDashboardData>;
