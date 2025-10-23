import { Skeleton } from '@/components/ui/skeleton';

interface DashboardSkeletonProps {
  variant?: 'beneficiary' | 'consultant' | 'admin';
}

export function DashboardSkeleton({ variant = 'beneficiary' }: DashboardSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section Skeleton */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-8 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-5 bg-gray-300 rounded w-1/2"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Content Section Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
