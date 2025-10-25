/**
 * Card Component - Design System v3 (Haguenau.pro style)
 * Reusable card container for content
 * Features: Rounded corners, soft shadows, gradient variants
 */

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'blue-light' | 'purple-light' | 'gradient';
  hoverable?: boolean;
  interactive?: boolean;
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
  interactive = false,
  onClick,
  className = '',
}: CardProps) {
  // Design System v3 - Haguenau.pro style variants
  const variantClasses = {
    // Default (blanc avec bordure subtile)
    default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-card',
    
    // Elevated (blanc avec ombre prononcée)
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
    
    // Outlined (transparent avec bordure)
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    
    // Blue light (fond bleu très clair - Haguenau.pro style)
    'blue-light': 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800',
    
    // Purple light (fond violet très clair - Haguenau.pro style)
    'purple-light': 'bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800',
    
    // Gradient (dégradé bleu-violet - Haguenau.pro style)
    gradient: 'bg-gradient-to-br from-primary-600 to-secondary-600 text-white border-0 shadow-xl',
  };

  // Hover effects - Design System v3
  const hoverClasses = hoverable 
    ? 'hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300' 
    : '';

  // Interactive effects (hover + transform)
  const interactiveClasses = interactive
    ? 'hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer'
    : '';

  const isGradient = variant === 'gradient';

  return (
    <div
      className={`rounded-2xl ${variantClasses[variant]} ${hoverClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      {(title || icon) && (
        <div className={`px-6 py-4 ${!isGradient ? 'border-b border-gray-200 dark:border-gray-700' : 'border-b border-white/20'} flex items-start gap-3`}>
          {icon && <div className="flex-shrink-0 text-2xl">{icon}</div>}
          <div className="flex-1">
            {title && (
              <h3 className={`text-lg font-semibold ${isGradient ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm mt-1 ${isGradient ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className={`px-6 py-4 ${!isGradient ? 'border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900' : 'border-t border-white/20'} rounded-b-2xl`}>
          {footer}
        </div>
      )}
    </div>
  );
}

