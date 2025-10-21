/**
 * Vercel Serverless Function - Backend API
 * This file wraps the Express app to run on Vercel
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Import all route handlers
import authRoutes from '../apps/backend/src/routes/auth';
import dashboardRoutes from '../apps/backend/src/routes/dashboard';
import passwordResetRoutes from '../apps/backend/src/routes/passwordReset';
import emailVerificationRoutes from '../apps/backend/src/routes/emailVerification';
import usersRoutes from '../apps/backend/src/routes/users';
import assessmentsRoutes from '../apps/backend/src/routes/assessments';
import notificationsRoutes from '../apps/backend/src/routes/notifications';
import filesRoutes from '../apps/backend/src/routes/files';
import analyticsRoutes from '../apps/backend/src/routes/analytics';
import exportRoutes from '../apps/backend/src/routes/export';
import chatRoutes from '../apps/backend/src/routes/chat';
import { apiLimiter, authLimiter } from '../apps/backend/src/middleware/rateLimit';

// Initialize Express app
const app = express();

// Middleware - Security & Logging
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['https://bilancompetence-ai-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check endpoint
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// API version endpoint
app.get('/api/version', (req: express.Request, res: express.Response) => {
  res.json({
    version: '1.0.0',
    name: 'BilanCompetence.AI Backend',
    environment: process.env.NODE_ENV || 'production',
    platform: 'Vercel Serverless',
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Export for Vercel
export default app;
