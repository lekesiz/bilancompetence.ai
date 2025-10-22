import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';

/**
 * Extend Express Request type to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        full_name: string;
        role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
      };
    }
  }
}

/**
 * Authentication middleware - verify JWT token
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

    req.user = decoded as any;
    next();
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
        req.user = decoded as any;
      }
    }

    next();
  } catch (error) {
    // Just continue without authentication
    next();
  }
}

export default authMiddleware;
