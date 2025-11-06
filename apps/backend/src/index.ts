import './config/env.js';
import { initSentry, Sentry } from './config/sentry.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import http from 'http';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboardNeon.js';
import passwordResetRoutes from './routes/passwordResetNeon.js';
import emailVerificationRoutes from './routes/emailVerificationNeon.js';
import usersRoutes from './routes/users.js';
import assessmentsRoutes from './routes/assessments.js';
import assessmentsDraftRoutes from './routes/assessmentsDraftNew.js';
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
import wedofRoutes from './routes/wedof.js';
import pennylaneRoutes from './routes/pennylane.js';
import twoFactorRoutes from './routes/twoFactor.js';
import chatEnhancedRoutes from './routes/chatEnhanced.js';
import sessionsRoutes from './routes/sessions.js';
import healthRoutes from './routes/health.js';
import consentRoutes from './routes/consent.js';
import { apiLimiter, authLimiter, publicLimiter, uploadLimiter } from './middleware/rateLimiter.js';
import { sanitizeInput } from './middleware/sanitization.js';
import { cacheHeadersMiddleware, etagMiddleware } from './middleware/cacheHeaders.js';
import { queryMonitoringMiddleware, createMonitoringEndpoint } from './utils/queryMonitoring.js';
import RealtimeService from './services/realtimeService.js';
import { logger } from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerConfig.js';

// Initialize Sentry for error tracking
initSentry();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);

// Initialize Socket.io for real-time features
const realtime = new RealtimeService(server);

// Trust proxy - Required for Railway deployment
app.set('trust proxy', true);

// Middleware - Security & Logging
app.use(helmet());
// Parse CORS_ORIGIN from environment variable (comma-separated string) or use default
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : process.env.NODE_ENV === 'production'
    ? [
        'https://bilancompetence.vercel.app',
        'https://bilancompetence-git-main-lekesizs-projects.vercel.app',
      ]
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed patterns
      const allowedPatterns = [
        /^https:\/\/.*\.vercel\.app$/, // All Vercel deployments
        /^http:\/\/localhost:\d+$/, // Local development
        /^https:\/\/bilancompetence\.ai$/, // Production domain
        /^https:\/\/app\.bilancompetence\.ai$/, // Production app subdomain
        /^https:\/\/.*\.bilancompetence\.ai$/, // All subdomains
      ];

      const isAllowed =
        allowedPatterns.some((pattern) => pattern.test(origin)) || corsOrigins.includes(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 🔒 SECURITY: Cookie parsing for HttpOnly auth cookies

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Cache headers and ETag support
app.use('/api/', cacheHeadersMiddleware);
app.use('/api/', etagMiddleware);

// Query monitoring for performance tracking
app.use('/api/', queryMonitoringMiddleware);

// Input sanitization (protection XSS et SQL Injection)
app.use('/api/', sanitizeInput());

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

// Performance monitoring endpoint (admin only) - ✅ SECURITY FIX: Added authentication
const monitoringEndpoint = createMonitoringEndpoint();
app.get('/api/admin/monitoring/stats', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => {
  res.json(monitoringEndpoint.stats());
});

app.get('/api/admin/monitoring/slow-queries', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => {
  const limit = parseInt((req.query.limit as string) || '10', 10);
  res.json(monitoringEndpoint.slowQueries(limit));
});

app.get('/api/admin/monitoring/frequent-queries', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => {
  const limit = parseInt((req.query.limit as string) || '10', 10);
  res.json(monitoringEndpoint.frequentQueries(limit));
});

// Health checks (no rate limiting)
app.use('/', healthRoutes);

// API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/assessments', assessmentsDraftRoutes); // New JSONB-based draft routes
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
app.use('/api/wedof', wedofRoutes);
app.use('/api/pennylane', pennylaneRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/chat-enhanced', chatEnhancedRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/consent', consentRoutes);

// Sentry automatically captures errors in v8

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
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
const isServerless = isVercel || isNetlify;

// Railway and traditional servers should always start listening
if (!isServerless || isRailway) {
  // Run migrations before starting server
  if (process.env.NODE_ENV === 'production' && isRailway) {
    logger.info('🔄 Running database migrations...');
    try {
      const { execSync } = await import('child_process');
      execSync('npm run migrate', { stdio: 'inherit' });
      logger.info('✅ Migrations completed successfully');
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      // Continue anyway - migrations might have already run
    }
  }

  // Start the HTTP server
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`✅ Backend server running on port ${PORT}`);
    logger.info(`📍 Health check: /health`);
    logger.info(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔌 WebSocket server initialized for real-time features`);
    logger.info(`📡 Online users: 0`);
    if (isRailway) {
      logger.info(`🚂 Running on Railway`);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
} else {
  logger.info(`✅ Backend running in serverless mode (${isVercel ? 'Vercel' : 'Netlify'})`);
}

export default app;
export { server };

// Test endpoint to verify deployment
app.get('/api/test/deployment-version', (req, res) => {
  res.json({
    version: 'v2.0-phase3-complete',
    timestamp: new Date().toISOString(),
    commit: 'c2382ac',
    features: ['email-verification', 'password-reset', 'optional-email-service'],
  });
});
