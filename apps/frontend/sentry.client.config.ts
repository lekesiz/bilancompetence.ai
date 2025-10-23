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

    // Set replay sample rate for session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      // Performance Monitoring
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
      // Capture unhandled promise rejections
      new Sentry.Integrations.GlobalHandlers({
        onerror: true,
        onunhandledrejection: true,
      }),
      // Next.js integration
      Sentry.nextjsIntegration({
        serverComponentContextLineCount: 5,
      }),
    ],

    // Filter out errors from specific sources
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Third-party scripts
      /graph\.facebook\.com/i,
      /connect\.facebook\.net/i,
    ],

    // Ignore specific error types
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
    ],

    // Before sending event to Sentry
    beforeSend(event, hint) {
      // Filter out specific errors in development
      if (ENVIRONMENT === 'development') {
        // Log to console instead of sending to Sentry
        console.log('Sentry Event (Dev):', event);
      }

      // Don't send if this is a known external error
      if (hint.originalException instanceof Error) {
        const message = hint.originalException.message;
        if (
          message.includes('NetworkError') ||
          message.includes('cancelled') ||
          message.includes('timeout')
        ) {
          // Return null to filter out the event
          return null;
        }
      }

      return event;
    },

    // Attach user context if available
    initialScope: {
      user: {
        // User context will be set dynamically in middleware
      },
      tags: {
        module: 'qualiopi',
        component: 'admin',
      },
    },
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
