import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'table';
  count?: number;
}

/**
 * Skeleton Loader Component
 * Provides loading states for different UI elements
 */
export function SkeletonLoader({
  className,
  variant = 'text',
  count = 1,
}: SkeletonLoaderProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-lg',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
    table: 'h-12 w-full rounded',
  };

  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(baseClasses, variants[variant], className)}
          aria-label="Loading..."
          role="status"
        />
      ))}
    </>
  );
}

/**
 * Dashboard Card Skeleton
 */
export function DashboardCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" className="h-4 w-24" />
        <SkeletonLoader variant="avatar" className="h-8 w-8" />
      </div>
      <div className="mt-4">
        <SkeletonLoader variant="text" className="h-8 w-32" />
      </div>
      <div className="mt-2">
        <SkeletonLoader variant="text" className="h-3 w-48" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        <SkeletonLoader variant="table" className="h-10 flex-1" />
        <SkeletonLoader variant="table" className="h-10 flex-1" />
        <SkeletonLoader variant="table" className="h-10 flex-1" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <SkeletonLoader variant="table" className="h-16 flex-1" />
          <SkeletonLoader variant="table" className="h-16 flex-1" />
          <SkeletonLoader variant="table" className="h-16 flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <SkeletonLoader variant="text" className="mb-2 h-4 w-24" />
        <SkeletonLoader variant="text" className="h-10 w-full" />
      </div>
      <div>
        <SkeletonLoader variant="text" className="mb-2 h-4 w-32" />
        <SkeletonLoader variant="text" className="h-10 w-full" />
      </div>
      <div>
        <SkeletonLoader variant="text" className="mb-2 h-4 w-28" />
        <SkeletonLoader variant="text" className="h-24 w-full" />
      </div>
      <div className="flex justify-end gap-2">
        <SkeletonLoader variant="button" />
        <SkeletonLoader variant="button" />
      </div>
    </div>
  );
}

/**
 * Page Skeleton
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <SkeletonLoader variant="text" className="mb-2 h-8 w-64" />
        <SkeletonLoader variant="text" className="h-4 w-96" />
      </div>
      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>
      <div>
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
