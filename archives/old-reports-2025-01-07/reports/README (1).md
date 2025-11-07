# BilanCompetence.AI - Backend API

> Enterprise-grade backend API for BilanCompetence.AI platform

[![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](../../100_PERCENT_SUCCESS_REPORT.md)
[![Production Ready](https://img.shields.io/badge/Production%20Ready-100%2F100-brightgreen)](../../FINAL_PRODUCTION_READINESS_REPORT.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org/)

---

## 🚀 Status

**Production Ready:** ✅ 100/100  
**Test Coverage:** ✅ 455/455 tests passing (100%)  
**Code Quality:** ✅ 0 ESLint errors  
**Last Updated:** October 28, 2025

---

## 📋 Features

### Core Features
- ✅ **JWT Authentication** with refresh tokens
- ✅ **Role-based Access Control** (RBAC)
- ✅ **Row-level Security** (RLS) with Neon PostgreSQL
- ✅ **AI-powered CV Analysis** (Google Gemini)
- ✅ **Real-time Chat** (Socket.io)
- ✅ **PDF Generation** (professional reports)
- ✅ **Email Service** (Resend)
- ✅ **File Upload** (Supabase Storage)

### Production Features
- ✅ **Error Tracking** (Sentry)
- ✅ **Multi-tier Rate Limiting**
- ✅ **Enhanced Health Checks** (Kubernetes-ready)
- ✅ **Performance Monitoring**
- ✅ **API Documentation** (Swagger/OpenAPI)
- ✅ **Automated Testing** (Jest)
- ✅ **CI/CD Pipeline** (GitHub Actions)
- ✅ **Code Quality** (ESLint + Prettier + Husky)

---

## 🏗️ Architecture

### Tech Stack
- **Runtime:** Node.js 22
- **Framework:** Express.js
- **Language:** TypeScript 5.0
- **Database:** Neon PostgreSQL (serverless)
- **ORM:** Direct SQL with connection pooling
- **Authentication:** JWT + bcrypt
- **Real-time:** Socket.io
- **AI:** Google Gemini API
- **Email:** Resend
- **Storage:** Supabase Storage
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI

### Database
- **Primary:** Neon PostgreSQL (serverless, auto-scaling)
- **Connection Pooling:** Configured for optimal performance
- **Row-level Security:** Enabled for data isolation
- **Migrations:** Managed through SQL scripts

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm (or npm)
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run database migrations (if needed)
# ...

# Start development server
pnpm dev
```

### Environment Variables

See `.env.example` for all required variables. Key variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# AI
GEMINI_API_KEY=your-gemini-key

# Email
RESEND_API_KEY=your-resend-key

# Monitoring (Production)
SENTRY_DSN=your-sentry-dsn
```

---

## 📚 Available Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Performance Testing
pnpm test:load        # Run load tests (Artillery)
pnpm test:stress      # Run stress tests (Artillery)
pnpm test:perf        # Run all performance tests
```

---

## 🧪 Testing

### Test Coverage: 100% (455/455 tests)

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/__tests__/routes/auth.integration.spec.ts

# Run tests with coverage
pnpm test:coverage
```

**Test Categories:**
- ✅ Unit Tests: 287/287 passing
- ✅ Integration Tests: 168/168 passing
- ✅ Route Tests: 36/36 passing (qualiopi)

**Reports:**
- [100% Success Report](../../100_PERCENT_SUCCESS_REPORT.md)
- [Final Test Report](../../FINAL_TEST_REPORT.md)
- [Test Coverage Report](../../TEST_COVERAGE_REPORT.md)

---

## 📖 API Documentation

### Swagger UI
Access interactive API documentation at:
- **Development:** http://localhost:3001/api-docs
- **Production:** https://your-domain.com/api-docs

### Health Checks
- **Basic:** `/health` - Server status and uptime
- **Detailed:** `/health/detailed` - Database, memory, version
- **Readiness:** `/health/ready` - Kubernetes readiness probe
- **Liveness:** `/health/live` - Kubernetes liveness probe

### Main Endpoints
- **Authentication:** `/api/auth/*`
- **Users:** `/api/users/*`
- **Assessments:** `/api/assessments/*`
- **Dashboard:** `/api/dashboard/*`
- **Recommendations:** `/api/recommendations/*`
- **Chat:** `/api/chat/*`
- **Files:** `/api/files/*`
- **Admin:** `/api/admin/*`

---

## 🔒 Security

### Implemented Measures
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (multi-tier)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Row-level security (RLS)

### Rate Limiting
- **General API:** 100 req/15min per IP
- **Authentication:** 5 req/15min per IP
- **Public Endpoints:** 300 req/15min per IP
- **File Uploads:** 10 uploads/hour per IP

---

## 📊 Monitoring

### Sentry Error Tracking
- Real-time error notifications
- Performance monitoring
- Release tracking
- User impact analysis

**Setup:**
```bash
# Add to .env
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Health Monitoring
Use health check endpoints for monitoring:
- **UptimeRobot:** Monitor `/health` every 5 minutes
- **Kubernetes:** Use `/health/live` and `/health/ready` probes

---

## 🚀 Deployment

### Railway (Recommended)
```bash
railway login
railway link
railway up
```

### Vercel (Serverless)
```bash
vercel --prod
```

### Docker
```bash
docker build -t bilancompetence-backend .
docker run -p 3001:3001 --env-file .env bilancompetence-backend
```

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

---

## 📁 Project Structure

```
apps/backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts        # Environment variables
│   │   ├── neon.ts       # Database connection
│   │   └── sentry.ts     # Error tracking
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication
│   │   ├── rateLimiter.ts # Rate limiting
│   │   └── ...
│   ├── routes/           # API routes
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── assessments.ts
│   │   ├── health.ts     # Health checks
│   │   └── ...
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── aiService.ts
│   │   └── ...
│   ├── utils/            # Utility functions
│   ├── __tests__/        # Test files
│   └── index.ts          # Application entry point
├── performance-tests/    # Load & stress tests
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📚 Documentation

- [Architecture](../../ARCHITECTURE.md) - System architecture overview
- [Contributing](../../CONTRIBUTING.md) - Contribution guidelines
- [Production Readiness](../../FINAL_PRODUCTION_READINESS_REPORT.md) - Production checklist
- [Test Coverage](../../100_PERCENT_SUCCESS_REPORT.md) - Test success report

---

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for detailed contribution guidelines.

---

## 📞 Support

For issues and questions:
- **Documentation:** See `/docs` folder
- **Issues:** GitHub Issues
- **Email:** support@bilancompetence.ai

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ by the BilanCompetence.AI team**

