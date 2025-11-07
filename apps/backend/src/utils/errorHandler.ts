/**
 * Error Handling Utilities
 * Standardized error handling across the application
 */

import { logger } from './logger.js';

/**
 * Custom Application Error
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Service Error (500)
 */
export class ServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} error: ${message}`, 500, details);
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

/**
 * Wrap async function with error handling
 */
export function asyncHandler(fn: Function) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Async operation failed', { error: err.message, stack: err.stack });
      throw error;
    }
  };
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: unknown, operation: string): never {
  logger.error(`Database error during ${operation}`, error);

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage?.includes('unique violation')) {
    throw new ValidationError('Duplicate entry found', { operation });
  }

  if (errorMessage?.includes('foreign key')) {
    throw new ValidationError('Invalid reference', { operation });
  }

  if (errorMessage?.includes('timeout')) {
    throw new ServiceError('Database', 'Request timeout');
  }

  throw new DatabaseError(`Failed to ${operation}`, { originalError: errorMessage });
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown, endpoint: string): never {
  logger.error(`API error at ${endpoint}`, error);

  const statusCode = (error as any)?.statusCode || 500;
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (statusCode === 401) {
    throw new AuthenticationError('Invalid credentials');
  }

  if (statusCode === 403) {
    throw new AuthorizationError('Insufficient permissions');
  }

  if (statusCode === 404) {
    throw new NotFoundError('Resource');
  }

  if (statusCode >= 500) {
    throw new ServiceError('External API', 'Service unavailable');
  }

  throw new AppError(errorMessage || 'API request failed', statusCode);
}

/**
 * Validate required fields
 */
export function validateRequired(data: Record<string, any>, fields: string[]): void {
  const missing = fields.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', { missing });
  }
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(json: string, defaultValue: any = null): any {
  try {
    return JSON.parse(json);
  } catch (error) {
    logger.warn('JSON parse failed', { error: String(error) });
    return defaultValue;
  }
}

/**
 * Log and throw error
 */
export function logAndThrow(message: string, error: unknown, statusCode: number = 500): never {
  logger.error(message, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  throw new AppError(message, statusCode, error);
}

/**
 * Express error handling middleware
 */
export function errorMiddleware(err: any, req: any, res: any, next: any) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      statusCode: err.statusCode,
      ...(process.env.NODE_ENV === 'development' && { details: err.details }),
    });
  }

  // Unknown error
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    statusCode: 500,
  });
}
