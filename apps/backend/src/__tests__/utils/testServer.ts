/**
 * Test Server Utilities
 *
 * Provides utilities for starting/stopping Express server for integration tests
 */

import express, { Express } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import authRoutes from '../../routes/auth.js';
import dashboardRoutes from '../../routes/dashboardNeon.js';
import usersRoutes from '../../routes/users.js';
import assessmentsRoutes from '../../routes/assessments.js';
import notificationsRoutes from '../../routes/notifications.js';
import chatRoutes from '../../routes/chat.js';
import recommendationsRoutes from '../../routes/recommendations.js';
import schedulingRoutes from '../../routes/scheduling.js';
import exportRoutes from '../../routes/export.js';

// Import middleware
import { apiLimiter } from '../../middleware/rateLimit.js';
import { sanitizeInput } from '../../middleware/sanitization.js';
import { mockAuthMiddleware } from './testAuth.js';

/**
 * Create Express app for testing
 */
export function createTestApp(): Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: true, // Allow all origins in test
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeInput);

  // Disable rate limiting in tests
  // app.use('/api', apiLimiter); // Commented out for tests

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/assessments', assessmentsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/recommendations', recommendationsRoutes);
  app.use('/api/scheduling', schedulingRoutes);
  app.use('/api/export', exportRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Test server error:', err);
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  });

  return app;
}

/**
 * Start test server
 */
export async function startTestServer(port: number = 3001): Promise<http.Server> {
  const app = createTestApp();
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Test server listening on port ${port}`);
      resolve(server);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      reject(error);
    });
  });
}

/**
 * Stop test server
 */
export async function stopTestServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        console.error('Error stopping test server:', err);
        reject(err);
      } else {
        console.log('Test server stopped');
        resolve();
      }
    });
  });
}

/**
 * Test server lifecycle manager
 */
export class TestServerManager {
  private server: http.Server | null = null;
  private port: number;

  constructor(port: number = 3001) {
    this.port = port;
  }

  async start(): Promise<void> {
    if (this.server) {
      console.warn('Test server already running');
      return;
    }
    this.server = await startTestServer(this.port);
  }

  async stop(): Promise<void> {
    if (!this.server) {
      console.warn('Test server not running');
      return;
    }
    await stopTestServer(this.server);
    this.server = null;
  }

  getBaseUrl(): string {
    return `http://localhost:${this.port}`;
  }

  isRunning(): boolean {
    return this.server !== null;
  }
}

// Global test server instance
let globalTestServer: TestServerManager | null = null;

/**
 * Get or create global test server
 */
export function getGlobalTestServer(): TestServerManager {
  if (!globalTestServer) {
    globalTestServer = new TestServerManager();
  }
  return globalTestServer;
}

/**
 * Setup function for beforeAll
 */
export async function setupTestServer(): Promise<TestServerManager> {
  const server = getGlobalTestServer();
  await server.start();
  return server;
}

/**
 * Teardown function for afterAll
 */
export async function teardownTestServer(): Promise<void> {
  const server = getGlobalTestServer();
  await server.stop();
}
