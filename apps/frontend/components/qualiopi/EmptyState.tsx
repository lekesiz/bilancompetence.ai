/**
 * EmptyState Component
 * Display for empty content with optional action button
 */

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'minimal' | 'highlighted';
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200',
    minimal: 'bg-gray-50',
    highlighted: 'bg-blue-50 border border-blue-200',
  };

  return (
    <div className={`rounded-lg p-12 text-center ${variantClasses[variant]}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
