import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes from backend
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
import recommendationsRoutes from '../apps/backend/src/routes/recommendations';
import qualiopisRoutes from '../apps/backend/src/routes/qualiopi';
import schedulingRoutes from '../apps/backend/src/routes/scheduling';
import { apiLimiter, authLimiter } from '../apps/backend/src/middleware/rateLimit';
import { logger } from '../apps/backend/src/utils/logger';

// Create Express app
const app = express();

// Middleware - Security & Logging
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount API routes
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
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/qualiopi', qualiopisRoutes);
app.use('/api/scheduling', schedulingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('API Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// Export as Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  // Convert VercelRequest to Express Request
  return new Promise((resolve, reject) => {
    app(req as any, res as any);
    res.on('finish', resolve);
    res.on('error', reject);
  });
};

