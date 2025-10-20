import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import passwordResetRoutes from './routes/passwordReset';
import emailVerificationRoutes from './routes/emailVerification';
import usersRoutes from './routes/users';
import assessmentsRoutes from './routes/assessments';
import notificationsRoutes from './routes/notifications';
import { apiLimiter, authLimiter } from './middleware/rateLimit';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Security & Logging
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/email-verification', emailVerificationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
