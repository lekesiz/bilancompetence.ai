/**
 * Comprehensive Logging System
 * - Winston logger with multiple transports
 * - Environment-based configuration
 * - Request ID tracking for correlation
 * - Structured logging with context
 */

import winston from 'winston';
import path from 'path';

// Define log levels
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

// Create logs directory structure
const logsDir = path.join(process.cwd(), 'logs');

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'bilancompetence-api' },
  transports: [
    // Console transport (all environments)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const requestIdStr = requestId ? ` [${requestId}]` : '';
          const userIdStr = userId ? ` [user:${userId}]` : '';
          return `${timestamp} [${level}]${requestIdStr}${userIdStr} ${message} ${metaStr}`;
        })
      ),
    }),

    // Error file transport (errors only)
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.json(),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined file transport (all logs)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: winston.format.json(),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Debug file transport (debug and below)
    ...(process.env.NODE_ENV === 'development'
      ? [
          new winston.transports.File({
            filename: path.join(logsDir, 'debug.log'),
            level: 'debug',
            format: winston.format.json(),
            maxsize: 5242880,
            maxFiles: 3,
          }),
        ]
      : []),
  ],
});

/**
 * Request context logger
 * Add context to logs for better traceability
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

/**
 * Structured logging methods
 */
export const log = {
  /**
   * Log fatal error (application should terminate)
   */
  fatal: (message: string, error?: Error | object, context?: LogContext) => {
    logger.log('fatal', message, { error, ...context });
  },

  /**
   * Log error
   */
  error: (message: string, error?: Error | object, context?: LogContext) => {
    if (error instanceof Error) {
      logger.log('error', message, { error: error.message, stack: error.stack, ...context });
    } else {
      logger.log('error', message, { error, ...context });
    }
  },

  /**
   * Log warning
   */
  warn: (message: string, context?: LogContext) => {
    logger.log('warn', message, context);
  },

  /**
   * Log info
   */
  info: (message: string, context?: LogContext) => {
    logger.log('info', message, context);
  },

  /**
   * Log debug
   */
  debug: (message: string, context?: LogContext) => {
    logger.log('debug', message, context);
  },

  /**
   * Log trace (detailed debugging)
   */
  trace: (message: string, context?: LogContext) => {
    logger.log('trace', message, context);
  },

  /**
   * Log API request
   */
  request: (
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) => {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, `${method} ${endpoint}`, {
      method,
      endpoint,
      statusCode,
      duration: `${duration}ms`,
      ...context,
    });
  },

  /**
   * Log database operation
   */
  database: (operation: string, table: string, duration: number, context?: LogContext) => {
    logger.log('debug', `DB ${operation} ${table}`, {
      operation,
      table,
      duration: `${duration}ms`,
      ...context,
    });
  },

  /**
   * Log authentication event
   */
  auth: (event: string, userId?: string, context?: LogContext) => {
    logger.log('info', `AUTH ${event}`, {
      event,
      userId,
      ...context,
    });
  },

  /**
   * Log security event
   */
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext) => {
    const level = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
    logger.log(level, `SECURITY ${event}`, {
      event,
      severity,
      ...context,
    });
  },

  /**
   * Log rate limit event
   */
  rateLimit: (endpoint: string, ip: string, context?: LogContext) => {
    logger.log('warn', `RATE_LIMIT ${endpoint}`, {
      endpoint,
      ip,
      ...context,
    });
  },
};

/**
 * Logger middleware for Express
 * Adds request ID and logs all requests
 */
export function loggerMiddleware(req: any, res: any, next: any) {
  // Generate or get request ID
  const requestId = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;

  // Log request start
  const startTime = Date.now();

  // Capture response end
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = Date.now() - startTime;
    const userId = req.user?.id;

    log.request(req.method, req.path, res.statusCode, duration, {
      requestId,
      userId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    originalEnd.apply(res, args);
  };

  next();
}

/**
 * Error logger middleware for Express
 * Logs errors with full context
 */
export function errorLoggerMiddleware(err: any, req: any, res: any, next: any) {
  const requestId = req.requestId || 'unknown';
  const userId = req.user?.id;
  const endpoint = `${req.method} ${req.path}`;

  log.error(`Unhandled error on ${endpoint}`, err, {
    requestId,
    userId,
    endpoint,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  next();
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error: any) => {
      log.error('Async route error', error, {
        requestId: req.requestId,
        userId: req.user?.id,
        endpoint: `${req.method} ${req.path}`,
      });
      next(error);
    });
  };
}

export default logger;
