/**
 * Database Query Monitoring & Performance Tracking
 * P3.2: Monitor slow queries and database performance
 *
 * Features:
 * - Slow query detection
 * - Query performance metrics
 * - Query count tracking
 * - Performance alerts
 */

import { logger } from './logger.js';

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  isSlow: boolean;
  params?: any[];
}

interface PerformanceStats {
  totalQueries: number;
  slowQueries: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  lastQueries: QueryMetrics[];
}

class QueryMonitor {
  private metrics: QueryMetrics[] = [];
  private slowQueryThreshold = 500; // ms
  private maxMetricsToStore = 1000;

  /**
   * Record query execution
   */
  recordQuery(query: string, duration: number, params?: any[]): void {
    const isSlow = duration > this.slowQueryThreshold;

    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: new Date(),
      isSlow,
      params: this.sanitizeParams(params),
    };

    this.metrics.push(metric);

    // Keep metrics size manageable
    if (this.metrics.length > this.maxMetricsToStore) {
      this.metrics = this.metrics.slice(-this.maxMetricsToStore);
    }

    // Log slow queries
    if (isSlow) {
      logger.warn(`[SLOW QUERY] ${duration}ms - ${query.substring(0, 100)}...`);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        averageDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        lastQueries: [],
      };
    }

    const durations = this.metrics.map((m) => m.duration);
    const slowQueries = this.metrics.filter((m) => m.isSlow).length;

    return {
      totalQueries: this.metrics.length,
      slowQueries,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      lastQueries: this.metrics.slice(-20),
    };
  }

  /**
   * Get slowest queries
   */
  getSlowestQueries(limit: number = 10): QueryMetrics[] {
    return this.metrics
      .filter((m) => m.isSlow)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get most frequent queries
   */
  getMostFrequentQueries(limit: number = 10): { query: string; count: number }[] {
    const counts: Map<string, number> = new Map();

    for (const metric of this.metrics) {
      const count = counts.get(metric.query) || 0;
      counts.set(metric.query, count + 1);
    }

    return Array.from(counts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = [];
  }

  /**
   * Set slow query threshold (in ms)
   */
  setSlowQueryThreshold(thresholdMs: number): void {
    this.slowQueryThreshold = thresholdMs;
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, '?') // Replace parameter placeholders
      .replace(/password/gi, '[REDACTED]')
      .replace(/token/gi, '[REDACTED]')
      .replace(/secret/gi, '[REDACTED]');
  }

  /**
   * Sanitize parameters for logging
   */
  private sanitizeParams(params?: any[]): any[] {
    if (!params) return [];

    return params.map((param) => {
      if (typeof param === 'string' && param.length > 50) {
        return param.substring(0, 50) + '...';
      }
      if (typeof param === 'object') {
        return '[object]';
      }
      return param;
    });
  }
}

/**
 * Global query monitor instance
 */
export const queryMonitor = new QueryMonitor();

/**
 * Supabase query wrapper with monitoring
 * Usage: monitoredQuery(() => supabase.from(...))
 */
export async function monitoredQuery<T>(
  queryFn: () => Promise<T>,
  queryLabel: string = 'Unknown Query'
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;

    queryMonitor.recordQuery(queryLabel, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    queryMonitor.recordQuery(`[ERROR] ${queryLabel}`, duration);
    throw error;
  }
}

/**
 * Express middleware for request/response timing
 */
export function queryMonitoringMiddleware(req: any, res: any, next: any) {
  const startTime = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - startTime;

    // Log slow requests
    if (duration > 1000) {
      logger.warn(`[SLOW REQUEST] ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    }

    // Record in monitoring
    queryMonitor.recordQuery(`HTTP ${req.method} ${req.path}`, duration);
  });

  next();
}

/**
 * Expose stats endpoint for monitoring
 */
export function createMonitoringEndpoint() {
  return {
    stats: () => queryMonitor.getStats(),
    slowQueries: (limit?: number) => queryMonitor.getSlowestQueries(limit),
    frequentQueries: (limit?: number) => queryMonitor.getMostFrequentQueries(limit),
    reset: () => queryMonitor.reset(),
  };
}
