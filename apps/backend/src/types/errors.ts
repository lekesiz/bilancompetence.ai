/**
 * Custom Error Types for BilanCompetence.AI
 *
 * Purpose: Replace (error: any) with properly typed error handlers
 * Security: Prevents unintended error information leakage
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Non authentifié') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Accès refusé') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string>;

  constructor(message: string = 'Données invalides', errors: Record<string, string> = {}) {
    super(message, 400);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Ressource') {
    super(`${resource} non trouvé(e)`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Database errors (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Erreur de base de données', originalError?: Error) {
    super(message, 500);
    this.name = 'DatabaseError';

    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * External service errors (502)
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message: string = 'Service externe indisponible') {
    super(message, 502);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

/**
 * Rate limit errors (429)
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Trop de requêtes', retryAfter?: number) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is a standard Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safe error message extractor
 * Prevents leaking sensitive information from unknown error types
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (isError(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Une erreur inconnue s\'est produite';
}

/**
 * Safe error status code extractor
 */
export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }

  return 500; // Internal Server Error for unknown errors
}

/**
 * Error response formatter for API responses
 */
export interface ErrorResponse {
  error: string;
  statusCode: number;
  details?: Record<string, any>;
}

export function formatErrorResponse(error: unknown): ErrorResponse {
  if (isAppError(error)) {
    const response: ErrorResponse = {
      error: error.message,
      statusCode: error.statusCode,
    };

    // Add validation details if available
    if (error instanceof ValidationError && Object.keys(error.errors).length > 0) {
      response.details = { errors: error.errors };
    }

    // Add retry-after for rate limits
    if (error instanceof RateLimitError && error.retryAfter) {
      response.details = { retryAfter: error.retryAfter };
    }

    return response;
  }

  // For unknown errors, return generic message (security best practice)
  return {
    error: process.env.NODE_ENV === 'production'
      ? 'Une erreur interne s\'est produite'
      : getErrorMessage(error),
    statusCode: 500,
  };
}
