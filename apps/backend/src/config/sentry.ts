import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { httpIntegration, expressIntegration } from '@sentry/node';
import { logger } from '../utils/logger.js';

export const initSentry = () => {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    logger.warn('⚠️ SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Enable HTTP calls tracing
      httpIntegration(),
      // Enable Express.js middleware tracing
      expressIntegration(),
      // Enable profiling
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.npm_package_version,
    // Before send hook for filtering
    beforeSend(event, hint) {
      // Don't send errors in test environment
      if (process.env.NODE_ENV === 'test') {
        return null;
      }
      return event;
    },
  });

  logger.info('✅ Sentry initialized for error tracking');
};

export { Sentry };
