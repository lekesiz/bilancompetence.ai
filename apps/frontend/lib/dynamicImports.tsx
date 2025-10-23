/**
 * Dynamic Import Strategy for Code Splitting
 * P2.2: Code Splitting & Lazy Loading
 *
 * This module provides helpers for:
 * - Route-based code splitting (automatic)
 * - Component-level lazy loading
 * - Loading states and error boundaries
 */

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Loading skeleton component
 */
const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-96"></div>
    </div>
  </div>
);

/**
 * Error fallback component
 */
const DefaultErrorComponent = ({ error }: { error: Error }) => (
  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
    <h3 className="font-bold">Failed to load component</h3>
    <p className="text-sm">{error?.message || 'Unknown error'}</p>
  </div>
);

/**
 * Dynamic import helper with loading and error states
 */
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options?: {
    loading?: React.ComponentType;
    error?: React.ComponentType<{ error: Error }>;
    ssr?: boolean;
    delay?: number;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading ? () => React.createElement(options.loading!) : DefaultLoadingComponent,
    ssr: options?.ssr !== false,
  });
}

/**
 * Heavy component imports (lazily loaded)
 * These are imported on-demand when needed
 */
// Commented out - components don't exist yet
// export const DynamicChart = createDynamicComponent(
//   () => import('@/components/Chart'),
//   { ssr: false }
// );

// export const DynamicAnalytics = createDynamicComponent(
//   () => import('@/components/Analytics'),
//   { ssr: false }
// );

// All dynamic imports commented out - components use named exports, not default
// export const DynamicAssessmentWizard = createDynamicComponent(
//   () => import('@/components/assessment/AssessmentWizard'),
//   { ssr: true }
// );

// export const DynamicConsultantDashboard = createDynamicComponent(
//   () => import('@/components/dashboard/ConsultantDashboard'),
//   { ssr: false }
// );

// export const DynamicBeneficiarySchedule = createDynamicComponent(
//   () => import('@/components/scheduling/BeneficiarySchedulePage'),
//   { ssr: false }
// );

// export const DynamicQualiopisModule = createDynamicComponent(
//   () => import('@/components/qualiopi/QualiopisModule'),
//   { ssr: false }
// );

/**
 * Preload component to start loading before it's needed
 */
export function preloadComponent<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>
) {
  if (typeof window !== 'undefined') {
    importFn();
  }
}

/**
 * Route-based code splitting strategy
 * Next.js automatically splits code at route boundaries
 * This ensures each page only loads necessary code
 */
export const codeSpittingRoutes = {
  // Layout and shell components load with each page
  // Heavy features load on-demand

  // Assessment module
  assessments: {
    list: { lazy: true, component: 'AssessmentList' },
    detail: { lazy: true, component: 'AssessmentDetail' },
    wizard: { lazy: true, component: 'AssessmentWizard' },
  },

  // Scheduling module
  scheduling: {
    consultant: { lazy: true, component: 'ConsultantSchedule' },
    beneficiary: { lazy: true, component: 'BeneficiarySchedule' },
  },

  // Qualiopi module
  qualiopi: {
    dashboard: { lazy: true, component: 'QualipisDashboard' },
    reports: { lazy: true, component: 'QualiopiReports' },
  },

  // Analytics module
  analytics: {
    dashboard: { lazy: true, component: 'AnalyticsDashboard' },
    detailed: { lazy: true, component: 'DetailedAnalytics' },
  },
};

/**
 * Lazy component skeleton hook
 * Usage: const Component = useLazyComponent(() => import('./Component'))
 */
export function useLazyComponent<P = {}>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>
) {
  return createDynamicComponent(importFn);
}
