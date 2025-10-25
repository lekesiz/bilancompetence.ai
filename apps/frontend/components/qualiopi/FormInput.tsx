/**
 * FormInput Component
 * Text input field with label, validation, and error states
 */

import { InputHTMLAttributes } from 'react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
}

export default function FormInput({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  required = false,
  className,
  disabled,
  ...props
}: FormInputProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const baseClasses = `w-full rounded-lg transition border focus:outline-none focus:ring-2`;

  const variantClasses = {
    default: `border-gray-300 bg-white dark:bg-gray-800 focus:border-primary-500 focus:ring-primary-500 ${
      error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
    }`,
    filled: `border-0 bg-gray-100 focus:bg-white dark:bg-gray-800 focus:border-primary-500 focus:ring-primary-500 ${
      error ? 'bg-red-50 focus:ring-red-500' : ''
    }`,
  };

  const disabledClasses = disabled ? 'bg-gray-100 text-gray-500 dark:text-gray-400 dark:text-gray-500 cursor-not-allowed' : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      />

      {error && (
        <p id={`${props.id}-error`} className="text-red-500 text-sm mt-1 flex items-center gap-1">
          ✕ {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${props.id}-helper`} className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
