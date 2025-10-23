/**
 * Sentry Configuration - Backend/Server Side
 * Captures backend errors, API request issues, and database errors
 *
 * NOTE: This file is currently disabled because @sentry/node is not installed.
 * The safe Sentry implementation is in utils/errors.ts using require() instead.
 * To enable Sentry, install @sentry/node and @sentry/profiling-node packages.
 */

// import * as Sentry from '@sentry/node';
// import { nodeProfilingIntegration } from '@sentry/profiling-node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

/**
 * Initialize Sentry for the backend
 * DISABLED: Use initSentry() from utils/errors.ts instead
 */
export function initSentry() {
  console.log('Sentry config disabled - use initSentry() from utils/errors.ts instead');
  return;

  /* COMMENTED OUT - Install @sentry/node to re-enable
  if (!SENTRY_DSN) {
    console.log('Sentry DSN not provided, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({
        request: true,
        serverName: true,
        transaction: true,
      }),
      nodeProfilingIntegration(),
    ],
    // Set trace sample rate for performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Profile every transaction in development, 10% in production
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Don't send 4xx errors for expected client errors in production
      if (ENVIRONMENT === 'production' && event.tags?.status_code) {
        const statusCode = parseInt(event.tags.status_code as string);
        if (statusCode >= 400 && statusCode < 500 && statusCode !== 401 && statusCode !== 403) {
          return null;
        }
      }

      return event;
    },
  });
  */
}

/**
 * Express middleware for Sentry
 * DISABLED: Sentry not installed
 */
export function getSentryRequestHandler() {
  return (req: any, res: any, next: any) => next();
  // return Sentry.Handlers.requestHandler();
}

/**
 * Express error handler for Sentry
 * DISABLED: Sentry not installed
 */
export function getSentryErrorHandler() {
  return (err: any, req: any, res: any, next: any) => next(err);
  // return Sentry.Handlers.errorHandler();
}

/**
 * Capture API error with context
 * DISABLED: Sentry not installed
 */
export function captureApiError(
  error: Error | unknown,
  context: {
    method: string;
    path: string;
    statusCode?: number;
    userId?: string;
    organizationId?: string;
    requestData?: Record<string, any>;
  }
) {
  // Log to console instead of Sentry
  console.error('API Error:', error, context);
  return;

  /* COMMENTED OUT - Install @sentry/node to re-enable
  if (!SENTRY_DSN) return;

  const sentryError = error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(sentryError, {
    contexts: {
      api: {
        method: context.method,
        path: context.path,
        statusCode: context.statusCode,
      },
      user_context: {
        userId: context.userId,
        organizationId: context.organizationId,
      },
    },
    tags: {
      type: 'api_error',
      method: context.method,
      statusCode: String(context.statusCode || 'unknown'),
    },
    level: context.statusCode === 401 || context.statusCode === 403 ? 'warning' : 'error',
  });
  */
}

/**
 * Capture database error
 * DISABLED: Sentry not installed
 */
export function captureDatabaseError(
  error: Error | unknown,
  context: {
    operation: string;
    table?: string;
    organizationId?: string;
  }
) {
  // Log to console instead of Sentry
  console.error('Database Error:', error, context);
  return;

  /* COMMENTED OUT - Install @sentry/node to re-enable
  if (!SENTRY_DSN) return;

  const sentryError = error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(sentryError, {
    contexts: {
      database: {
        operation: context.operation,
        table: context.table,
      },
    },
    tags: {
      type: 'database_error',
      operation: context.operation,
      table: context.table || 'unknown',
      organizationId: context.organizationId || 'unknown',
    },
    level: 'error',
  });
  */
}

/**
 * Capture service error
 * DISABLED: Sentry not installed
 */
export function captureServiceError(
  error: Error | unknown,
  context: {
    service: string;
    method: string;
    organizationId?: string;
  }
) {
  // Log to console instead of Sentry
  console.error('Service Error:', error, context);
  return;

  /* COMMENTED OUT - Install @sentry/node to re-enable
  if (!SENTRY_DSN) return;

  const sentryError = error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(sentryError, {
    contexts: {
      service: {
        name: context.service,
        method: context.method,
      },
    },
    tags: {
      type: 'service_error',
      service: context.service,
      method: context.method,
      organizationId: context.organizationId || 'unknown',
    },
    level: 'error',
  });
  */
}

/**
 * Add transaction for monitoring
 * DISABLED: Sentry not installed
 */
export function startTransaction(name: string, op: string = 'http.server') {
  return null;

  /* COMMENTED OUT - Install @sentry/node to re-enable
  if (!SENTRY_DSN) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
  */
}

/**
 * Set user context for error tracking
 * DISABLED: Sentry not installed
 */
export function setSentryUserContext(userId: string, context?: { organizationId?: string; role?: string }) {
  return;

  /* COMMENTED OUT - Install @sentry/node to re-enable
  if (!SENTRY_DSN) return;

  Sentry.setUser({
    id: userId,
  });

  if (context?.organizationId) {
    Sentry.setTag('organizationId', context.organizationId);
  }

  if (context?.role) {
    Sentry.setTag('userRole', context.role);
  }
  */
}

/**
 * Clear user context
 * DISABLED: Sentry not installed
 */
export function clearSentryUserContext() {
  return;

  /* COMMENTED OUT - Install @sentry/node to re-enable
  if (!SENTRY_DSN) return;

  Sentry.setUser(null);
  */
}

// export default Sentry; // Disabled - Sentry not installed
