/**
 * LoadingSkeleton Component
 * Displays animated skeleton placeholders while loading data
 */

interface LoadingSkeletonProps {
  type?: 'card' | 'metric' | 'table' | 'chart' | 'list';
  count?: number;
  height?: string;
}

function SkeletonCard() {
  return (
    <div className="bg-gray-100 rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full w-full"></div>
    </div>
  );
}

function SkeletonMetric() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-10 bg-gray-200 rounded w-1/2 mt-2"></div>
      <div className="h-2 bg-gray-200 rounded-full mt-4 w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mt-3"></div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="bg-gray-100 p-4 grid grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="border-t border-gray-200 p-4 grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((col) => (
            <div key={col} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="flex items-end gap-2 h-48">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded"
            style={{ height: `${Math.random() * 100 + 20}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 items-center p-4 bg-gray-100 rounded-lg">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton({
  type = 'card',
  count = 1,
  height,
}: LoadingSkeletonProps) {
  const getSkeletonComponent = () => {
    switch (type) {
      case 'metric':
        return <SkeletonMetric />;
      case 'table':
        return <SkeletonTable />;
      case 'chart':
        return <SkeletonChart />;
      case 'list':
        return <SkeletonList />;
      case 'card':
      default:
        return <SkeletonCard />;
    }
  };

  const skeleton = getSkeletonComponent();

  if (type === 'table' || type === 'chart' || type === 'list') {
    return skeleton;
  }

  return (
    <div
      className={`space-y-6 ${height ? `h-${height}` : ''}`}
      role="status"
      aria-label="Loading content"
    >
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <div key={i}>{skeleton}</div>
        ))}
    </div>
  );
}

