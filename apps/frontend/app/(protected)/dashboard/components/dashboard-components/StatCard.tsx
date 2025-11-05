import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Users, FileText, CheckCircle, Clock } from 'lucide-react';

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
  variant?: 'default' | 'success' | 'warning' | 'info';
  description?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200',
    icon: 'text-blue-600',
    value: 'text-gray-800 dark:text-gray-100',
    title: 'text-gray-600 dark:text-gray-300', // ✅ PHASE 4: Better contrast (was text-gray-500)
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-success-600',
    value: 'text-green-800',
    title: 'text-success-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    value: 'text-yellow-800',
    title: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    value: 'text-blue-800',
    title: 'text-blue-600',
  },
};

const getDefaultIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('user') || lowerTitle.includes('client')) return <Users className="w-5 h-5" />;
  if (lowerTitle.includes('assessment') || lowerTitle.includes('bilan')) return <FileText className="w-5 h-5" />;
  if (lowerTitle.includes('completed') || lowerTitle.includes('finished')) return <CheckCircle className="w-5 h-5" />;
  if (lowerTitle.includes('pending') || lowerTitle.includes('progress')) return <Clock className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  onClick,
  loading = false,
  className = '',
  variant = 'default',
  description,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || getDefaultIcon(title);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-xl p-6 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'hover:shadow-md'
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      aria-label={onClick ? `${title}: ${value}${description ? `, ${description}` : ''}` : undefined}
      aria-busy={loading}
    >
      {loading ? (
        <div className="space-y-4" aria-label="Chargement des statistiques">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          {description && <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`${styles.title} text-sm font-medium`}>{title}</h3>
            <div className={`${styles.icon} p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`} aria-hidden="true">
              {displayIcon}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <p className={`${styles.value} text-3xl font-bold`}>{value}</p>
              {trend && (
                <div
                  className={`flex items-center text-sm font-semibold ${
                    trend.isPositive ? 'text-success-600' : 'text-red-600'
                  }`}
                  aria-label={`Tendance: ${trend.isPositive ? 'hausse' : 'baisse'} de ${Math.abs(trend.value)} pourcent`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" aria-hidden="true" />
                  )}
                  <span aria-hidden="true">{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>

            {description && (
              <p className="text-gray-600 dark:text-gray-300 text-xs">{description}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
