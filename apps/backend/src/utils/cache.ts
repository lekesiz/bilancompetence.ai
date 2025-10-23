/**
 * In-Memory Caching Utility (Production: use Redis)
 * This is a temporary implementation until Redis is configured
 * For production, migrate to Redis using redis package
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 60000) {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`Cache cleanup: removed ${removedCount} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000)),
        ageSeconds: Math.ceil((Date.now() - entry.createdAt) / 1000),
      })),
    };
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Cache decorator for async functions
 * Usage: @Cacheable('assessments', 300)
 */
export function Cacheable(prefix: string, ttlSeconds: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${prefix}:${JSON.stringify(args)}`;
      const cached = cacheManager.get(cacheKey);

      if (cached) {
        console.log(`[Cache HIT] ${cacheKey}`);
        return cached;
      }

      console.log(`[Cache MISS] ${cacheKey}`);
      const result = await originalMethod.apply(this, args);
      cacheManager.set(cacheKey, result, ttlSeconds);

      return result;
    };

    return descriptor;
  };
}

/**
 * Helper function for cached queries
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = cacheManager.get<T>(key);
  if (cached) {
    console.log(`[Cache HIT] ${key}`);
    return cached;
  }

  // Execute function and cache result
  console.log(`[Cache MISS] ${key}`);
  const result = await fn();
  cacheManager.set<T>(key, result, ttlSeconds);

  return result;
}

/**
 * Invalidate cache by pattern (regex)
 */
export function invalidateCacheByPattern(pattern: RegExp): number {
  let count = 0;

  for (const key of Array.from(cacheManager['cache'].keys())) {
    if (pattern.test(key)) {
      cacheManager.delete(key);
      count++;
    }
  }

  return count;
}
