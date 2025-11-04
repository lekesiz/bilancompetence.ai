/**
 * Sentry Configuration - Client Side
 * Captures frontend errors, performance metrics, and user sessions
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Only initialize Sentry if DSN is provided
if (SENTRY_DSN && typeof window !== 'undefined') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    // Set trace sample rate for performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
  });
}

/**
 * Capture API errors
 */
export function captureApiError(
  error: Error,
  context: {
    endpoint: string;
    method: string;
    statusCode?: number;
    organizationId?: string;
  }
) {
  if (!SENTRY_DSN) return;

  Sentry.captureException(error, {
    contexts: {
      api: {
        endpoint: context.endpoint,
        method: context.method,
        statusCode: context.statusCode,
      },
    },
    tags: {
      type: 'api_error',
      organizationId: context.organizationId || 'unknown',
    },
    level: context.statusCode === 401 || context.statusCode === 403 ? 'warning' : 'error',
  });
}

/**
 * Capture component errors
 */
export function captureComponentError(
  error: Error,
  context: {
    componentName: string;
    props?: Record<string, any>;
  }
) {
  if (!SENTRY_DSN) return;

  Sentry.captureException(error, {
    contexts: {
      react: {
        componentName: context.componentName,
        props: context.props,
      },
    },
    tags: {
      type: 'component_error',
      component: context.componentName,
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, userEmail?: string, organizationId?: string) {
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
    email: userEmail,
    username: userEmail?.split('@')[0],
  });

  Sentry.setTag('organizationId', organizationId || 'unknown');
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  if (!SENTRY_DSN) return;

  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addSentryBreadcrumb(
  message: string,
  data?: Record<string, any>,
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal'
) {
  if (!SENTRY_DSN) return;

  Sentry.captureMessage(message, {
    level: level || 'info',
    contexts: {
      action: data,
    },
  });
}

export default Sentry;
