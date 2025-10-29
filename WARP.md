# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Monorepo with three apps and one serverless adapter:
  - apps/backend: Express + TypeScript API server (Supabase, Socket.io, Stripe, email/PDF, caching, rate limiting, monitoring)
  - apps/frontend: Next.js 14 (App Router) web app
  - apps/mobile: Expo (React Native) app
  - api: Vercel serverless adapter that reuses backend code (CommonJS build target)

Environment setup
- Copy environment examples and fill values as needed:
  - Backend: apps/backend/.env.example -> .env or .env.local (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, JWT_SECRET, CORS_ORIGIN, …)
  - Frontend: apps/frontend/.env.example -> .env.local (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, …)
- Defaults: backend PORT=3001, frontend uses NEXT_PUBLIC_API_URL (defaults to /api in example) and will talk to http://localhost:3001 if not overridden in next.config.js

Common commands
- Backend (apps/backend)
  - Install: npm install
  - Dev server: npm run dev
  - Build: npm run build
  - Start (after build): npm start
  - Lint: npm run lint
  - Type check: npm run type-check
  - Tests: npm test
  - Watch tests: npm run test:watch
  - Run a single test file: npx jest src/__tests__/routes/assessments.integration.spec.ts
  - Run a single test by name: npx jest -t "should create new assessment draft"
- Frontend (apps/frontend)
  - Install: npm install
  - Dev server: npm run dev
  - Build: npm run build
  - Start (after build): npm start
  - Lint: npm run lint
  - Type check: npm run type-check
  - Unit tests: npm test
  - Watch tests: npm run test:watch
  - E2E tests (Playwright): npm run test:e2e
  - E2E with UI: npm run test:e2e:ui
  - E2E debug: npm run test:e2e:debug
  - E2E single test file: npx playwright test tests/e2e/path/to.spec.ts
  - E2E single test by name: npx playwright test -g "test name"
  - Override E2E base URL locally: BASE_URL=http://localhost:3000 npx playwright test
- Mobile (apps/mobile)
  - Install: npm install
  - Start (Expo): npm run start
  - iOS simulator: npm run ios
  - Android emulator: npm run android
  - Web: npm run web
  - Build (EAS): npm run build
  - Submit to stores (EAS): npm run submit
  - Lint: npm run lint
  - Type check: npm run type-check
  - Tests: npm test

High-level architecture
- Backend (apps/backend)
  - Entry point: src/index.ts
    - Loads env from repo root and backend dir
    - Express server + http.Server + Socket.io for real-time features
    - Security & ops middleware: helmet, CORS (CORS_ORIGIN list), morgan, JSON parsing
    - Rate limiting: apiLimiter and strict authLimiter (src/middleware/rateLimit.ts)
    - Cache/ETag: cacheHeadersMiddleware and etagMiddleware (src/middleware/cacheHeaders.ts)
    - Request performance monitoring: queryMonitoringMiddleware and admin stats endpoints (src/utils/queryMonitoring.ts)
    - Input sanitization: sanitizeInput (src/middleware/sanitization.ts)
    - Health and version endpoints; 404 and centralized error handler using Winston logger (src/utils/logger.ts)
  - Routing
    - Feature modules under src/routes (auth, dashboard, assessments, files, chat, recommendations, payments, scheduling, admin/qualiopi, etc.) plus API v1 aggregator in src/routes/v1/index.ts
  - Services layer (src/services)
    - supabaseService.ts: typed Supabase client + data access helpers (uses src/types/database.types.ts)
    - Business services: authService, assessmentService, pdfService, emailService, schedulingService, stripeService, realtimeService (Socket.io), etc.
  - Validation and types
    - zod validators under src/validators (e.g., authValidator.ts)
    - Domain enums and generated database types under src/types
  - Utilities
    - Logging (Winston) with structured levels and request context; pagination, error types, monitoring helpers
  - Testing
    - Jest config loads .env.test (jest.config.cjs)
    - Integration tests under src/__tests__ using supertest; Supabase mocked in src/__tests__/setup.ts
  - Deployment modes
    - Detects serverless (Vercel/Netlify) and Railway; starts listener only where appropriate
    - api/ package extends backend tsconfig for CommonJS to support @vercel/node
- Frontend (apps/frontend)
  - Next.js 14 with App Router (app/), components/, hooks/, lib/, contexts/
  - next.config.js
    - Injects NEXT_PUBLIC_* env with sensible local defaults
    - Image optimization enabled, compression on, poweredByHeader disabled
  - next.config.optimization.js
    - Extra perf tuning for admin/qualiopi pages (headers, splitChunks, SWC/experimental settings)
  - Testing
    - Unit tests with Jest + Testing Library (jest.config.js)
    - E2E tests with Playwright (playwright.config.ts) — default baseURL is production; override BASE_URL for local
  - Deployment
    - vercel.json defines Next.js build and security headers
- Mobile (apps/mobile)
  - Expo app (app.json, eas.json) with TypeScript and common web client libs (zustand, react-hook-form, zod, socket.io-client)
  - Jest testing via jest-expo

Notes for day-to-day development
- Run backend and frontend in separate terminals from their respective directories.
- For local integration, set NEXT_PUBLIC_API_URL in apps/frontend/.env.local to http://localhost:3001 (or use the default in next.config.js) and ensure apps/backend is running on PORT=3001.
