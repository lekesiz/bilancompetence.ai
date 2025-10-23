/**
 * StatusBadge Component
 * Displays indicator status with appropriate color and icon
 */

interface StatusBadgeProps {
  status: 'COMPLIANT' | 'MISSING' | 'UNDER_REVIEW';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'pill' | 'solid';
}

const statusConfig = {
  COMPLIANT: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: '✅',
    label: 'Uyumlu',
    solidBg: 'bg-green-600',
    solidText: 'text-white',
  },
  UNDER_REVIEW: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: '🔄',
    label: 'İnceleme Altında',
    solidBg: 'bg-yellow-600',
    solidText: 'text-white',
  },
  MISSING: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: '❌',
    label: 'Eksik',
    solidBg: 'bg-red-600',
    solidText: 'text-white',
  },
};

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
};

export default function StatusBadge({
  status,
  size = 'md',
  variant = 'badge',
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  const isSolid = variant === 'solid';
  const isPill = variant === 'pill';

  const bgClass = isSolid ? config.solidBg : config.bg;
  const textClass = isSolid ? config.solidText : config.text;
  const roundedClass = isPill ? 'rounded-full' : 'rounded';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${sizeClass} ${bgClass} ${textClass} ${roundedClass}`}
      role="status"
      aria-label={config.label}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

