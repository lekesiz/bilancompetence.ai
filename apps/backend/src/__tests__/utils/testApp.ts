/**
 * Test App Utilities (Supertest-based)
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from '../../routes/auth.js';
import chatRoutes from '../../routes/chat.js';
import { sanitizeInput } from '../../middleware/sanitization.js';

export function createTestApp(): Express {
  const app = express();
  
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeInput);
  
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  });
  
  return app;
}

let globalTestApp: Express | null = null;

export function getTestApp(): Express {
  if (!globalTestApp) {
    globalTestApp = createTestApp();
  }
  return globalTestApp;
}
