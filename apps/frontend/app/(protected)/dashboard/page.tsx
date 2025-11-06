'use client';

import { useAuth } from '@/hooks/useAuth';
import { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { DashboardErrorBoundary } from './components/DashboardErrorBoundary';
import { DashboardSkeleton } from './components/DashboardSkeleton';

// ✅ PHASE 4: Performance - Dynamic imports for heavy dashboard components
const BeneficiaryDashboard = nextDynamic(() => import('./components/BeneficiaryDashboard').then(mod => ({ default: mod.BeneficiaryDashboard })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const ConsultantDashboard = nextDynamic(() => import('./components/ConsultantDashboard').then(mod => ({ default: mod.ConsultantDashboard })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const AdminDashboard = nextDynamic(() => import('./components/AdminDashboard').then(mod => ({ default: mod.AdminDashboard })), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

export const dynamic = 'force-dynamic';

// Error boundary fallback
function DashboardError() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
      <p className="text-red-600">Failed to load your dashboard. Please try refreshing the page.</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-yellow-800 font-semibold mb-2">Authentication Required</h2>
        <p className="text-yellow-600">Please log in to view your dashboard.</p>
      </div>
    );
  }

  // Render role-specific dashboard with error boundary
  return (
    <DashboardErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        {user.role === 'BENEFICIARY' && <BeneficiaryDashboard />}
        {user.role === 'CONSULTANT' && <ConsultantDashboard />}
        {user.role === 'ORG_ADMIN' && <AdminDashboard />}
        {!['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'].includes(user.role) && <DashboardError />}
      </Suspense>
    </DashboardErrorBoundary>
  );
}
