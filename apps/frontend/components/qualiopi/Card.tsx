/**
 * Card Component
 * Reusable card container for content
 */

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Card({
  title,
  subtitle,
  children,
  footer,
  icon,
  variant = 'default',
  hoverable = false,
  onClick,
  className = '',
}: CardProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-300',
  };

  const hoverClasses = hoverable ? 'hover:shadow-lg hover:border-gray-300 transition cursor-pointer' : '';

  return (
    <div
      className={`rounded-lg ${variantClasses[variant]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      {(title || icon) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-start gap-3">
          {icon && <div className="flex-shrink-0 text-2xl">{icon}</div>}
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}
