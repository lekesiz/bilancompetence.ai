import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

// Redis client type
export type RedisClientType = ReturnType<typeof createClient>;

// Redis configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisEnabled = process.env.REDIS_ENABLED !== 'false'; // Enabled by default if REDIS_URL is set

// Create Redis client
let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis connection
 */
export async function initializeRedis(): Promise<RedisClientType | null> {
  if (!redisEnabled) {
    logger.info('Redis is disabled, using in-memory cache');
    return null;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Too many retry attempts');
          }
          // Exponential backoff: 100ms, 200ms, 400ms, etc.
          return Math.min(retries * 100, 3000);
        },
      },
    });

    // Error handling
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis client ready');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('⚠️  Redis client reconnecting...');
    });

    redisClient.on('end', () => {
      logger.info('❌ Redis client connection closed');
    });

    // Connect to Redis
    await redisClient.connect();

    logger.info(`Redis initialized successfully at ${redisUrl}`);
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    logger.warn('Falling back to in-memory cache');
    redisClient = null;
    return null;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisClient !== null && redisClient.isOpen;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}

/**
 * Flush all Redis data (use with caution!)
 */
export async function flushRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.flushAll();
    logger.warn('⚠️  Redis database flushed');
  }
}

/**
 * Get Redis info
 */
export async function getRedisInfo(): Promise<string | null> {
  if (redisClient && redisClient.isOpen) {
    return await redisClient.info();
  }
  return null;
}

/**
 * Get Redis memory stats
 */
export async function getRedisStats(): Promise<{
  keysCount: number;
  memoryUsed: string;
  connected: boolean;
} | null> {
  if (!redisClient || !redisClient.isOpen) {
    return null;
  }

  try {
    const info = await redisClient.info('stats');
    const memory = await redisClient.info('memory');
    const dbSize = await redisClient.dbSize();

    return {
      keysCount: dbSize,
      memoryUsed: memory.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'unknown',
      connected: true,
    };
  } catch (error) {
    logger.error('Failed to get Redis stats:', error);
    return null;
  }
}
