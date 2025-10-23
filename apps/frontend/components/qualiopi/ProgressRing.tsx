/**
 * ProgressRing Component
 * Circular progress indicator with label and percentage
 */

interface ProgressRingProps {
  percentage: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
  animated?: boolean;
}

export default function ProgressRing({
  percentage,
  label,
  size = 'md',
  color = 'blue',
  animated = true,
}: ProgressRingProps) {
  const sizeConfig = {
    sm: { radius: 45, width: 120, height: 120, fontSize: 24 },
    md: { radius: 60, width: 160, height: 160, fontSize: 32 },
    lg: { radius: 80, width: 200, height: 200, fontSize: 40 },
  };

  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
  };

  const colorStroke = {
    green: '#16a34a',
    blue: '#2563eb',
    red: '#dc2626',
    yellow: '#eab308',
    purple: '#a855f7',
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (percentage / 100) * circumference;

  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="flex flex-col items-center">
      <svg width={config.width} height={config.height} className="relative">
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={config.radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />

        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={config.radius}
          fill="none"
          stroke={colorStroke[color]}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${config.width / 2} ${config.height / 2})`}
          className={animated ? 'transition-all duration-500 ease-out' : ''}
        />

        {/* Percentage text */}
        <text
          x={config.width / 2}
          y={config.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`font-bold ${colorClasses[color]}`}
          fontSize={config.fontSize}
        >
          {clampedPercentage}%
        </text>
      </svg>

      {label && <p className="text-sm font-medium text-gray-700 mt-3">{label}</p>}
    </div>
  );
}
