import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';
import { validateJWTPayload, JWTPayload } from './jwtValidation.js';

/**
 * Extend Express Request type to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verify JWT token with Zod validation
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Validate JWT payload with Zod schema
    try {
      const validatedPayload = validateJWTPayload(decoded);
      req.user = validatedPayload;
      next();
    } catch (error: any) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token payload',
        details: error.errors || error.message,
      });
    }
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);

      if (decoded) {
        try {
          const validatedPayload = validateJWTPayload(decoded);
          req.user = validatedPayload;
        } catch (error) {
          // Invalid payload, continue without authentication
        }
      }
    }

    next();
  } catch (error) {
    // Just continue without authentication
    next();
  }
}

// Backward compatibility alias
export const authenticateToken = authMiddleware;

export default authMiddleware;

