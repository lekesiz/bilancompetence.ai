import { Response } from 'express';

/**
 * Cookie configuration for secure token storage
 */
export const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes (matches access token expiration)
};

export const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches refresh token expiration)
};

/**
 * Set authentication cookies
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie('accessToken', accessToken, COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', { path: COOKIE_OPTIONS.path });
  res.clearCookie('refreshToken', { path: COOKIE_OPTIONS.path });
}

/**
 * Extract token from request (cookie or Authorization header)
 */
export function extractToken(req: any): string | null {
  // Priority 1: Check cookies (more secure)
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  // Priority 2: Check Authorization header (fallback for API clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
