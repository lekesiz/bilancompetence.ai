'use client';

interface FormErrorProps {
  message?: string | null;
  errors?: string[];
  onDismiss?: () => void;
}

export function FormError({ message, errors, onDismiss }: FormErrorProps) {
  if (!message && (!errors || errors.length === 0)) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            ❌ Validation Error
          </h3>
          {message && <p className="text-sm text-red-700 mb-2">{message}</p>}
          {errors && errors.length > 0 && (
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-800 font-bold ml-4 flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
