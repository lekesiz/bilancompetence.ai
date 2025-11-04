/**
 * Sentry Configuration - Server Side
 * Captures server-side errors, API route errors, and performance metrics
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
    // Lower in production to reduce costs
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session replay sample rate
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Replay on error sample rate
    replaysOnErrorSampleRate: 1.0,

    // Enable debug mode in development
    debug: ENVIRONMENT === 'development',

    // Integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send errors in test environment
      if (process.env.NODE_ENV === 'test') {
        return null;
      }

      // Filter out authentication tokens from error data
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      return event;
    },
  });

  console.log('✅ Sentry Server initialized for error tracking');
}

export default Sentry;
