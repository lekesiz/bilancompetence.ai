import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  onClick,
  loading = false,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg' : ''
      } ${className}`}
      onClick={onClick}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-semibold">{title}</h3>
            {icon && <div className="text-blue-600 text-xl">{icon}</div>}
          </div>

          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {trend && (
              <div
                className={`text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span className="ml-1">{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
