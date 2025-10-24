import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local or .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');
const backendDir = path.resolve(__dirname, '../');

// Try loading from root first, then from backend directory
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(backendDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(backendDir, '.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import passwordResetRoutes from './routes/passwordReset.js';
import emailVerificationRoutes from './routes/emailVerification.js';
import usersRoutes from './routes/users.js';
import assessmentsRoutes from './routes/assessments.js';
import notificationsRoutes from './routes/notifications.js';
import filesRoutes from './routes/files.js';
import analyticsRoutes from './routes/analytics.js';
import exportRoutes from './routes/export.js';
import chatRoutes from './routes/chat.js';
import recommendationsRoutes from './routes/recommendations.js';
import qualiopisRoutes from './routes/qualiopi.js';
import schedulingRoutes from './routes/scheduling.js';
import parcoursRoutes from './routes/parcours.js';
import testsRoutes from './routes/tests.js';
import aiRoutes from './routes/ai.js';
import documentsRoutes from './routes/documents.js';
import paymentsRoutes from './routes/payments.js';
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import { cacheHeadersMiddleware, etagMiddleware } from './middleware/cacheHeaders.js';
import { queryMonitoringMiddleware, createMonitoringEndpoint } from './utils/queryMonitoring.js';
import RealtimeService from './services/realtimeService.js';
import { logger } from './utils/logger.js';

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.io for real-time features
const realtime = new RealtimeService(server);

// Trust proxy - Required for Railway deployment
app.set('trust proxy', true);

// Middleware - Security & Logging
app.use(helmet());
// Parse CORS_ORIGIN from environment variable (comma-separated string) or use default
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Cache headers and ETag support
app.use('/api/', cacheHeadersMiddleware);
app.use('/api/', etagMiddleware);

// Query monitoring for performance tracking
app.use('/api/', queryMonitoringMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: '0.1.0',
    name: 'BilanCompetence.AI Backend',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Performance monitoring endpoint (admin only)
const monitoringEndpoint = createMonitoringEndpoint();
app.get('/api/admin/monitoring/stats', (req, res) => {
  res.json(monitoringEndpoint.stats());
});

app.get('/api/admin/monitoring/slow-queries', (req, res) => {
  const limit = parseInt((req.query.limit as string) || '10', 10);
  res.json(monitoringEndpoint.slowQueries(limit));
});

app.get('/api/admin/monitoring/frequent-queries', (req, res) => {
  const limit = parseInt((req.query.limit as string) || '10', 10);
  res.json(monitoringEndpoint.frequentQueries(limit));
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
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/admin/qualiopi', qualiopisRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/parcours', parcoursRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/payments', paymentsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
  });
});

// For serverless environments (Vercel), only start listening if not in a serverless function context
const isVercel = !!process.env.VERCEL;
const isNetlify = !!process.env.NETLIFY;
const isServerless = isVercel || isNetlify;

if (!isServerless) {
  // Traditional Node.js server for local development
  server.listen(PORT, () => {
    logger.info(`✅ Backend server running on http://localhost:${PORT}`);
    logger.info(`📍 Health check: http://localhost:${PORT}/health`);
    logger.info(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔌 WebSocket server initialized for real-time features`);
    logger.info(`📡 Online users: 0`);
  });
} else {
  logger.info(`✅ Backend running in serverless mode (${isVercel ? 'Vercel' : 'Netlify'})`);
}

export default app;
export { server };
