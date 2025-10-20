/**
 * Performance Optimization Utilities
 * - Image optimization
 * - API response caching
 * - Memory management
 * - Bundle optimization
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Clear specific cache
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Debounce utility for optimizing frequent calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle utility for rate limiting
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);

    // Clear cache if it gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

/**
 * Memory-efficient image optimization
 */
export const ImageOptimization = {
  /**
   * Generate thumbnail URL with optimization params
   */
  getThumbnailUrl(imageUrl: string, width: number = 200, height: number = 200): string {
    // In production, use image optimization service
    // For now, return URL with size params
    return `${imageUrl}?w=${width}&h=${height}&q=80`;
  },

  /**
   * Get optimized image based on screen size
   */
  getResponsiveImageUrl(
    imageUrl: string,
    screenWidth: number
  ): string {
    const optimalWidth = screenWidth > 1000 ? 1000 : screenWidth;
    return this.getThumbnailUrl(imageUrl, optimalWidth);
  },

  /**
   * Preload images
   */
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          })
      )
    );
  },
};

/**
 * API response caching
 */
export const apiCache = new CacheManager();

/**
 * Clear old cache periodically (background cleanup)
 */
export function startCacheCleanup(intervalMs: number = 60000): void {
  setInterval(() => {
    apiCache.cleanup();
  }, intervalMs);
}

/**
 * Memory leak prevention - cleanup on app background
 */
export function setupMemoryManagement(): void {
  // AppState listener would go here for React Native
  // On background, clear non-critical cache
}

/**
 * Bundle size optimization tips:
 * 1. Use dynamic imports for large features
 * 2. Remove unused dependencies
 * 3. Tree-shake unused code
 * 4. Minify and compress
 * 5. Use code splitting
 */

export default {
  CacheManager,
  apiCache,
  debounce,
  throttle,
  memoize,
  ImageOptimization,
  startCacheCleanup,
  setupMemoryManagement,
};
