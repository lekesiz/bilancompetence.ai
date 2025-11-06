/**
 * Button Component - Design System v3 (Haguenau.pro style)
 * Reusable button with multiple variants and sizes
 * Features: Gradients, shadows, rounded corners
 */

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-gradient' | 'success-gradient' | 'secondary' | 'outline' | 'outline-secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  // Design System v3 - Haguenau.pro style variants
  const variantClasses = {
    // Primary avec dégradé bleu
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    
    // Primary avec dégradé bleu-violet (Haguenau.pro style)
    'primary-gradient': 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    
    // Success avec dégradé bleu-vert (Haguenau.pro style)
    'success-gradient': 'bg-gradient-to-r from-primary-600 to-green-500 hover:from-primary-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    
    // Secondary (blanc avec bordure)
    secondary: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    
    // Outline primary (transparent avec bordure bleue)
    outline: 'bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    
    // Outline secondary (transparent avec bordure violette)
    'outline-secondary': 'bg-transparent hover:bg-secondary-50 dark:hover:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 border-2 border-secondary-600 dark:border-secondary-400 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2',
    
    // Ghost (transparent)
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2',
    
    // Danger (rouge)
    danger: 'bg-error-600 text-white hover:bg-error-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-2 focus:ring-error-500 focus:ring-offset-2 disabled:bg-gray-400',
    
    // Success (vert)
    success: 'bg-success-600 text-white hover:bg-success-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-2 focus:ring-success-500 focus:ring-offset-2 disabled:bg-gray-400',
  };

  // Design System v3 - Sizes avec coins plus arrondis
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  const baseClasses = `inline-flex items-center gap-2 transition-all duration-200 font-semibold disabled:cursor-not-allowed disabled:opacity-50`;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? 'w-full justify-center' : ''
      } ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </button>
  );
}

