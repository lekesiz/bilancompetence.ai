import type { VercelRequest, VercelResponse } from '@vercel/node';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

// Health check
app.get('/api/health', (req: any, res: any) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Temporary test endpoint
app.post('/api/auth/register', async (req: any, res: any) => {
  res.status(501).json({
    status: 'error',
    message: 'Backend integration in progress - registration endpoint not yet implemented',
    debug: {
      body: req.body,
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/auth/login', async (req: any, res: any) => {
  res.status(501).json({
    status: 'error',
    message: 'Backend integration in progress - login endpoint not yet implemented',
    debug: {
      body: req.body,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// Export as Vercel serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
  return new Promise((resolve, reject) => {
    app(req, res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
};

