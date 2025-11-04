'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to Sentry error tracking service
    // Import Sentry dynamically to avoid issues with SSR
    if (typeof window !== 'undefined') {
      import('../sentry.client.config')
        .then((module) => {
          if (module.default && module.captureComponentError) {
            module.captureComponentError(error, {
              componentName: 'ErrorBoundary',
              props: {
                errorInfo: errorInfo.componentStack,
              },
            });
          }
        })
        .catch((err) => {
          console.warn('Failed to send error to Sentry:', err);
        });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
          <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Oops! Quelque chose s'est mal passé
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="space-y-2 rounded-md bg-red-50 p-4 dark:bg-red-950">
                <p className="font-mono text-xs font-semibold text-red-800 dark:text-red-200">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="cursor-pointer">
                    <summary className="text-xs text-red-700 dark:text-red-300">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 max-h-48 overflow-auto text-xs text-red-600 dark:text-red-400">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Link>
            </div>

            {/* Support Link */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Besoin d'aide ?{' '}
              <a
                href="mailto:support@bilancompetence.ai"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Contactez le support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for Suspense fallbacks
 */
export function AsyncErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Erreur de chargement
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Impossible de charger ce contenu
              </p>
            </div>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}
