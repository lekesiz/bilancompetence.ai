/**
 * Unified Cache Manager supporting both Redis and In-Memory fallback
 * Automatically falls back to in-memory cache if Redis is unavailable
 */

import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import { cacheManager as inMemoryCache } from './cache.js';
import { logger } from './logger.js';

export class UnifiedCacheManager {
  /**
   * Get value from cache (Redis first, then in-memory)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        if (redis) {
          const value = await redis.get(key);
          if (value) {
            logger.debug(`[Redis Cache HIT] ${key}`);
            return JSON.parse(value) as T;
          }
        }
      }

      // Fallback to in-memory cache
      const inMemValue = inMemoryCache.get<T>(key);
      if (inMemValue) {
        logger.debug(`[Memory Cache HIT] ${key}`);
        return inMemValue;
      }

      logger.debug(`[Cache MISS] ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (Redis and in-memory)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      // Set in Redis if available
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        if (redis) {
          await redis.setEx(key, ttlSeconds, serializedValue);
          logger.debug(`[Redis Cache SET] ${key} (TTL: ${ttlSeconds}s)`);
        }
      }

      // Always set in memory as fallback
      inMemoryCache.set(key, value, ttlSeconds);
      logger.debug(`[Memory Cache SET] ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      let deleted = false;

      // Delete from Redis
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        if (redis) {
          const result = await redis.del(key);
          deleted = result > 0;
          logger.debug(`[Redis Cache DELETE] ${key}`);
        }
      }

      // Delete from in-memory cache
      const inMemDeleted = inMemoryCache.delete(key);
      logger.debug(`[Memory Cache DELETE] ${key}`);

      return deleted || inMemDeleted;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern (Redis SCAN, in-memory regex)
   */
  async deleteByPattern(pattern: string | RegExp): Promise<number> {
    try {
      let count = 0;

      // Delete from Redis using SCAN
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        if (redis) {
          const patternStr = typeof pattern === 'string' ? pattern : pattern.source;
          const keys = [];

          // Use SCAN to iterate through keys
          for await (const key of redis.scanIterator({ MATCH: patternStr })) {
            keys.push(key);
          }

          if (keys.length > 0) {
            count += await redis.del(keys);
            logger.debug(`[Redis Cache DELETE PATTERN] ${patternStr} (${keys.length} keys)`);
          }
        }
      }

      // Delete from in-memory cache
      const regex = typeof pattern === 'string' ? new RegExp(pattern.replace('*', '.*')) : pattern;
      for (const [key] of inMemoryCache['cache']) {
        if (regex.test(key)) {
          inMemoryCache.delete(key);
          count++;
        }
      }

      logger.debug(`[Cache DELETE PATTERN] Total deleted: ${count}`);
      return count;
    } catch (error) {
      logger.error('Cache delete by pattern error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      // Clear Redis
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        if (redis) {
          await redis.flushDb();
          logger.info('[Redis Cache CLEAR] All keys deleted');
        }
      }

      // Clear in-memory cache
      inMemoryCache.clear();
      logger.info('[Memory Cache CLEAR] All keys deleted');
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    const stats: any = {
      inMemory: inMemoryCache.getStats(),
      redis: null,
    };

    try {
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        if (redis) {
          const dbSize = await redis.dbSize();
          const info = await redis.info('stats');
          const memory = await redis.info('memory');

          stats.redis = {
            keysCount: dbSize,
            memoryUsed: memory.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'unknown',
            connected: true,
          };
        }
      }
    } catch (error) {
      logger.error('Failed to get Redis stats:', error);
    }

    return stats;
  }

  /**
   * Check if cache (Redis or in-memory) is available
   */
  isAvailable(): boolean {
    return isRedisAvailable() || inMemoryCache.size() >= 0;
  }
}

// Export singleton instance
export const cache = new UnifiedCacheManager();

/**
 * Helper function for cached operations
 * @example
 * const users = await withCache('users:all', () => fetchUsers(), 300);
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  await cache.set<T>(key, result, ttlSeconds);

  return result;
}

/**
 * Cache keys generator helper
 */
export const CacheKeys = {
  assessment: (id: string) => `assessment:${id}`,
  assessments: (userId: string) => `assessments:user:${userId}`,
  user: (id: string) => `user:${id}`,
  recommendations: (assessmentId: string) => `recommendations:${assessmentId}`,
  sessions: (userId: string) => `sessions:user:${userId}`,
  franceTravail: (query: string) => `france-travail:${query}`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
} as const;

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  EXTRA_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;
