/**
 * Custom Error Classes and Error Handling
 * - Structured error responses
 * - Error tracking and reporting
 * - User-friendly error messages
 */

import { log } from './logger';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Array<{ field: string; message: string }>,
    public requestId?: string,
    public userId?: string
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }

  toJSON() {
    return {
      status: 'error',
      message: this.message,
      errors: this.errors || [],
      requestId: this.requestId,
    };
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends APIError {
  constructor(
    message: string,
    errors: Array<{ field: string; message: string }> = [],
    requestId?: string
  ) {
    super(400, message, errors, requestId);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends APIError {
  constructor(message: string = 'Unauthorized', requestId?: string, userId?: string) {
    super(401, message, [], requestId, userId);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends APIError {
  constructor(message: string = 'Forbidden', requestId?: string, userId?: string) {
    super(403, message, [], requestId, userId);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);

    log.security(`Unauthorized access attempt`, 'medium', { userId, message });
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends APIError {
  constructor(resource: string, requestId?: string) {
    super(404, `${resource} not found`, [], requestId);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends APIError {
  constructor(message: string, requestId?: string) {
    super(409, message, [], requestId);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends APIError {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number,
    requestId?: string
  ) {
    super(429, message, [], requestId);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends APIError {
  constructor(
    public originalError: Error,
    message: string = 'Database operation failed',
    requestId?: string,
    userId?: string
  ) {
    super(500, message, [], requestId, userId);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);

    log.error('Database error', originalError, { requestId, userId });
  }
}

/**
 * External Service Error (502/503)
 */
export class ExternalServiceError extends APIError {
  constructor(
    service: string,
    message: string = `${service} service unavailable`,
    requestId?: string
  ) {
    super(503, message, [], requestId);
    this.name = 'ExternalServiceError';
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);

    log.error(`External service error: ${service}`, new Error(message), { requestId });
  }

  service: string;
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends APIError {
  constructor(
    public originalError: Error,
    message: string = 'Internal server error',
    requestId?: string,
    userId?: string
  ) {
    super(500, message, [], requestId, userId);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);

    log.error('Internal server error', originalError, { requestId, userId });
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(err: any, req: any, res: any, next: any) {
  const requestId = req.requestId || 'unknown';
  const userId = req.user?.id;

  // Handle known API errors
  if (err instanceof APIError) {
    log.warn(`API Error: ${err.message}`, {
      requestId,
      userId,
      statusCode: err.statusCode,
      errorType: err.name,
    });

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors || [],
      requestId,
    });
  }

  // Handle validation errors (Zod, etc.)
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    log.warn('Validation error', { requestId, userId, errors });

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
      requestId,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    log.security('Invalid JWT token', 'medium', { requestId, userId });

    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      requestId,
    });
  }

  if (err.name === 'TokenExpiredError') {
    log.security('Expired JWT token', 'low', { requestId, userId });

    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
      requestId,
    });
  }

  // Handle database errors
  if (err.code === 'PGERROR' || err.message?.includes('database')) {
    log.error('Database error', err, { requestId, userId });

    return res.status(500).json({
      status: 'error',
      message: 'Database operation failed',
      requestId,
    });
  }

  // Handle unknown errors
  log.fatal(`Unhandled error: ${err.message}`, err, {
    requestId,
    userId,
    stack: err.stack,
  });

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    requestId,
  });
}

/**
 * Sentry error tracking integration (optional)
 */
export function initSentry(app: any) {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  try {
    const Sentry = require('@sentry/node');

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ request: true, serverName: false }),
      ],
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    log.info('Sentry error tracking initialized');
  } catch (error) {
    log.warn('Sentry not available, continuing without error tracking');
  }
}

export default {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  InternalServerError,
  errorHandler,
  initSentry,
};
