/**
 * Alert Component
 * Display alert messages with different severity levels
 */

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  icon?: string;
}

export default function Alert({
  type,
  title,
  message,
  onClose,
  dismissible = true,
  icon,
}: AlertProps) {
  const typeConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✅',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️',
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`border rounded-lg p-4 ${config.bg} ${config.border}`} role="alert">
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0">{icon || config.icon}</div>

        <div className="flex-1">
          {title && <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>}
          <p className={`text-sm ${config.text}`}>{message}</p>
        </div>

        {dismissible && onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${config.text} hover:opacity-75 transition`}
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
