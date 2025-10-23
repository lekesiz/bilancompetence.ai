/**
 * Cache-Control Headers Middleware
 * Sets appropriate HTTP cache headers based on endpoint characteristics
 * Helps with browser caching and CDN optimization
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function cacheHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Static reference data (definitions, indicators, configurations)
  // These rarely change, cache for 24 hours
  if (
    req.path.includes('/definitions') ||
    req.path.includes('/indicators') ||
    req.path.includes('/qualiopi') ||
    req.path.includes('/configurations')
  ) {
    res.set('Cache-Control', 'public, max-age=86400, immutable'); // 24 hours
    res.set('ETag', 'W/"ref-data"');
  }
  // User profile and personal data
  // Changes frequently, cache for 10 minutes
  else if (
    req.path.includes('/profile') ||
    req.path.includes('/users/') ||
    req.path.includes('/auth/')
  ) {
    res.set('Cache-Control', 'private, max-age=600'); // 10 minutes
    res.set('Vary', 'Authorization');
  }
  // Assessment and analytics data
  // Changes occasionally, cache for 5 minutes
  else if (
    req.path.includes('/assessments') ||
    req.path.includes('/analytics') ||
    req.path.includes('/recommendations')
  ) {
    res.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    res.set('Vary', 'Authorization');
  }
  // Dynamic session and booking data
  // Changes frequently, cache for 1 minute
  else if (
    req.path.includes('/bookings') ||
    req.path.includes('/sessions') ||
    req.path.includes('/scheduling')
  ) {
    res.set('Cache-Control', 'private, max-age=60'); // 1 minute
    res.set('Vary', 'Authorization');
  }
  // Default: no cache for unknown endpoints
  else {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  // Always set Pragma for HTTP/1.0 compatibility
  res.set('Pragma', 'no-cache');

  // Add X-Cache-Control header for debugging
  const cacheControl = res.getHeader('Cache-Control');
  if (cacheControl) {
    res.set('X-Cache-Control', String(cacheControl));
  }

  next();
}

/**
 * ETag-based caching for specific endpoints
 * Helps reduce bandwidth when data hasn't changed
 */
export function etagMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    // Generate ETag for response body
    const etag = `W/"${crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16)}"`;

    res.set('ETag', etag);

    // Check if client has cached version
    const clientETag = req.headers['if-none-match'];
    if (clientETag === etag) {
      return res.status(304).end(); // Not Modified
    }

    return originalJson(data);
  };

  next();
}
