/**
 * Integration Test Fixtures & Factory
 *
 * Provides comprehensive test setup including:
 * - Full Express app initialization with all middleware
 * - Mocked Supabase client with table-specific config
 * - Socket.io server initialization for WebSocket tests
 * - Common test data builders
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import {
  createSupabaseMock,
  createFullSupabaseMock,
  mockDataBuilders,
} from './supabaseMockHelper.js';

/**
 * Test database configuration
 */
export interface TestDBConfig {
  assessments?: any[];
  users?: any[];
  notifications?: any[];
  session_bookings?: any[];
  assessment_answers?: any[];
  [key: string]: any[];
}

/**
 * Full test app configuration
 */
export interface TestAppConfig {
  port?: number;
  dbConfig?: TestDBConfig;
  enableSocketIO?: boolean;
  enableAuth?: boolean;
}

/**
 * Test app instance with all dependencies
 */
export interface TestAppInstance {
  app: Express;
  server: http.Server;
  io?: SocketIOServer;
  mockSupabase: any;
  port: number;
  baseURL: string;
  close: () => Promise<void>;
}

/**
 * Create a full test app instance with all middleware and mocks
 */
export async function createTestApp(config: TestAppConfig = {}): Promise<TestAppInstance> {
  const port = config.port || 3333;
  const app = express();

  // Middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Mock auth middleware (if enabled)
  if (config.enableAuth !== false) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Add mock auth context
      (req as any).user = { id: 'test-user', email: 'test@example.com' };
      next();
    });
  }

  // Create Supabase mock
  const dbConfig = config.dbConfig || {};
  const mockSupabase = createFullSupabaseMock({
    assessments: { selectData: dbConfig.assessments || [mockDataBuilders.assessment()] },
    users: { selectData: dbConfig.users || [mockDataBuilders.user()] },
    notifications: { selectData: dbConfig.notifications || [] },
    session_bookings: {
      selectData: dbConfig.session_bookings || [mockDataBuilders.sessionBooking()],
    },
    assessment_answers: {
      selectData: dbConfig.assessment_answers || [mockDataBuilders.assessmentAnswer()],
    },
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Create HTTP server
  const server = http.createServer(app);

  // Setup Socket.io if enabled
  let io: SocketIOServer | undefined;
  if (config.enableSocketIO !== false) {
    io = new SocketIOServer(server, {
      cors: { origin: '*' },
      transports: ['websocket', 'polling'],
    });

    // Basic Socket.io event handling
    io.on('connection', (socket) => {
      console.log(`Test client connected: ${socket.id}`);

      socket.on('message', (data) => {
        io!.emit('message', data);
      });

      socket.on('disconnect', () => {
        console.log(`Test client disconnected: ${socket.id}`);
      });
    });
  }

  // Start server
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`Test server listening on port ${port}`);
      resolve();
    });
  });

  return {
    app,
    server,
    io,
    mockSupabase,
    port,
    baseURL: `http://localhost:${port}`,
    close: async () => {
      return new Promise<void>((resolve, reject) => {
        if (io) {
          io.close();
        }
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}

/**
 * Create a test request context with mocked dependencies
 */
export function createTestRequestContext(userId: string = 'test-user') {
  return {
    user: { id: userId, email: `${userId}@example.com` },
    requestId: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create test assessment data with full hierarchy
 */
export function createTestAssessmentWithAnswers(assessmentId: string = 'assessment-123') {
  return {
    assessment: mockDataBuilders.assessment({ id: assessmentId }),
    answers: [
      mockDataBuilders.assessmentAnswer({ assessment_id: assessmentId, step_number: 1 }),
      mockDataBuilders.assessmentAnswer({ assessment_id: assessmentId, step_number: 2 }),
      mockDataBuilders.assessmentAnswer({ assessment_id: assessmentId, step_number: 3 }),
    ],
    drafts: [mockDataBuilders.assessmentDraft({ assessment_id: assessmentId })],
  };
}

/**
 * Helper to wait for async operations in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to create test HTTP headers
 */
export function createTestHeaders(token?: string, contentType: string = 'application/json') {
  const headers: any = {
    'Content-Type': contentType,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * WebSocket test client wrapper
 */
export class TestSocketIOClient {
  private socket: any;

  constructor(io: SocketIOServer, userId: string = 'test-user') {
    const { io: ioClient } = require('socket.io-client');
    this.socket = ioClient(`http://localhost:${(io as any).httpServer.address().port}`, {
      auth: {
        userId,
        token: 'test-token',
      },
      transports: ['websocket', 'polling'],
    });
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  disconnect() {
    this.socket.disconnect();
  }

  async waitForEvent(event: string, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeout);

      this.socket.once(event, (data: any) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }
}

/**
 * Common test data sets for integration tests
 */
export const testDataSets = {
  validUserData: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
  },

  validAssessmentData: {
    title: 'Test Assessment',
    assessmentType: 'career',
    currentStep: 0,
  },

  validBookingData: {
    sessionType: 'INITIAL_MEETING',
    meetingFormat: 'VIDEO',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },

  validNotificationData: {
    type: 'assessment',
    title: 'Test Notification',
    message: 'This is a test notification',
  },
};
