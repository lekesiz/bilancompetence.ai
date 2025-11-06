import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from './logger.js';

/**
 * CSRF Token Configuration
 * Uses double-submit cookie pattern for CSRF protection
 */

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set CSRF token as a cookie
 * Note: This cookie is NOT HttpOnly because the frontend needs to read it
 */
export function setCsrfToken(res: Response, token: string): void {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Frontend needs to read this for the double-submit pattern
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 * 1000, // 15 minutes (matches access token)
  });
}

/**
 * Clear CSRF token cookie
 */
export function clearCsrfToken(res: Response): void {
  res.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
}

/**
 * Middleware to generate and set CSRF token
 * Use this on login/register endpoints
 */
export function generateCsrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = generateCsrfToken();
  setCsrfToken(res, token);

  // Store token in response locals so it can be included in response body
  res.locals.csrfToken = token;

  next();
}

/**
 * Middleware to validate CSRF token
 * Use this on all state-changing endpoints (POST, PUT, DELETE, PATCH)
 */
export function validateCsrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF validation for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Get CSRF token from cookie
  const tokenFromCookie = req.cookies?.[CSRF_COOKIE_NAME];

  // Get CSRF token from header
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;

  // Both must be present
  if (!tokenFromCookie || !tokenFromHeader) {
    logger.warn('CSRF validation failed: Missing token', {
      method: req.method,
      path: req.path,
      hasCookie: !!tokenFromCookie,
      hasHeader: !!tokenFromHeader,
    });

    return res.status(403).json({
      status: 'error',
      message: 'CSRF token missing',
    });
  }

  // Tokens must match (constant-time comparison to prevent timing attacks)
  if (!crypto.timingSafeEqual(Buffer.from(tokenFromCookie), Buffer.from(tokenFromHeader))) {
    logger.warn('CSRF validation failed: Token mismatch', {
      method: req.method,
      path: req.path,
    });

    return res.status(403).json({
      status: 'error',
      message: 'CSRF token invalid',
    });
  }

  // Valid CSRF token
  next();
}

/**
 * Optional: Middleware to refresh CSRF token on each request
 * Can be used to rotate tokens frequently
 */
export function refreshCsrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!existingToken) {
    // Generate new token if none exists
    const token = generateCsrfToken();
    setCsrfToken(res, token);
    res.locals.csrfToken = token;
  }

  next();
}
