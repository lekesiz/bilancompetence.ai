/**
 * Badge Component
 * Reusable badge/tag component with multiple variants
 */

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  dismissible = false,
  onDismiss,
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800 border border-blue-300',
    success: 'bg-green-100 text-green-800 border border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    danger: 'bg-red-100 text-red-800 border border-red-300',
    info: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
    gray: 'bg-gray-100 text-gray-800 dark:text-gray-100 border border-gray-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
      role="status"
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-1 hover:opacity-75 transition"
          aria-label="Remove badge"
        >
          ✕
        </button>
      )}
    </div>
  );
}
