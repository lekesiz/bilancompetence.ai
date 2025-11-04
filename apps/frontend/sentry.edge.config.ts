/**
 * Sentry Configuration - Edge Runtime
 * For middleware and edge functions
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Only initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Set trace sample rate for performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Enable debug mode in development
    debug: ENVIRONMENT === 'development',

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send errors in test environment
      if (process.env.NODE_ENV === 'test') {
        return null;
      }

      // Filter out authentication tokens
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      return event;
    },
  });

  console.log('✅ Sentry Edge initialized for error tracking');
}

export default Sentry;
