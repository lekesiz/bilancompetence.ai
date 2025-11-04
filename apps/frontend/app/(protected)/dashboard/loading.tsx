import { DashboardCardSkeleton, TableSkeleton } from '@/components/ui/SkeletonLoader';

/**
 * Dashboard Loading State
 */
export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Table */}
      <div>
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}
