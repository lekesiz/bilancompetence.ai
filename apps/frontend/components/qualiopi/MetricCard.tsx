/**
 * MetricCard Component
 * Displays key metrics with title, value, and optional progress bar
 */

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: string;
  subtitle?: string;
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'orange' | 'cyan';
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantConfig = {
  green: 'from-green-50 to-green-100 border-green-200 text-green-900 text-green-700',
  blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900 text-primary-700',
  yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900 text-yellow-700',
  red: 'from-red-50 to-red-100 border-red-200 text-red-900 text-red-700',
  purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900 text-purple-700',
  orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900 text-orange-700',
  cyan: 'from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-900 text-cyan-700',
};

const progressColorConfig = {
  green: 'bg-green-600',
  blue: 'bg-primary-600',
  yellow: 'bg-yellow-600',
  red: 'bg-red-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
  cyan: 'bg-cyan-600',
};

const bgColorConfig = {
  green: 'bg-green-200',
  blue: 'bg-blue-200',
  yellow: 'bg-yellow-200',
  red: 'bg-red-200',
  purple: 'bg-purple-200',
  orange: 'bg-orange-200',
  cyan: 'bg-cyan-200',
};

export default function MetricCard({
  title,
  value,
  icon,
  subtitle,
  variant = 'blue',
  showProgress = false,
  progressValue = 0,
  progressMax = 100,
  action,
}: MetricCardProps) {
  const [bg, titleColor, subtitleColor] = variantConfig[variant].split(' ');
  const progressColor = progressColorConfig[variant];
  const progressBg = bgColorConfig[variant];

  const progressPercentage = Math.min((progressValue / progressMax) * 100, 100);

  return (
    <div
      className={`bg-gradient-to-br ${bg} border-2 rounded-lg p-6 transition hover:shadow-lg`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className={`text-sm font-medium ${subtitleColor}`}>{title}</div>
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      {/* Value */}
      <div className={`text-4xl font-bold ${titleColor} mt-2`}>{value}</div>

      {/* Progress Bar */}
      {showProgress && (
        <div className={`h-2 ${progressBg} rounded-full mt-4 overflow-hidden`}>
          <div
            className={`h-full ${progressColor} transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progressPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <div className={`text-xs ${subtitleColor} mt-3`}>{subtitle}</div>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-4 w-full px-3 py-2 bg-opacity-20 bg-white dark:bg-gray-800 text-inherit rounded font-medium hover:bg-opacity-40 transition`}
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

