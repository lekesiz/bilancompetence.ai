# Etap 0: Discovery & Planning Report

**Date:** 2025-10-27  
**Phase:** Discovery & Inventory  
**Status:** ✅ Complete  
**Auditor:** Manus AI

---

## Executive Summary

BilanCompetence.AI is a comprehensive career assessment platform built with **Express.js/Node.js** backend and **Next.js** frontend, currently deployed on Railway (backend) and Vercel (frontend). The project has recently completed MVP development with **99.5% completion**, including successful migration from Supabase to Neon PostgreSQL.

**Key Findings:**
- ✅ **1,141 files** in repository
- ✅ **~80,000 lines** of code (backend + frontend)
- ✅ **50+ API endpoints** implemented
- ⚠️ **Mixed service architecture** (Supabase + Neon services coexist)
- ⚠️ **Test coverage: 10.32%** (target: ≥70%)
- ⚠️ **167 failing tests** (due to Supabase → Neon migration)
- ✅ **E2E tests: 8/8 passing**
- ✅ **Security audit: 7/8 passing**

---

## Project Structure

### Repository Layout

```
bilancompetence.ai/
├── apps/
│   ├── backend/          # Express.js API (39,188 lines)
│   │   ├── src/
│   │   │   ├── services/ # 35 service files (mixed Supabase/Neon)
│   │   │   ├── routes/   # 34 route files
│   │   │   ├── config/   # Configuration files
│   │   │   └── middleware/
│   │   ├── migrations/   # 32 database migrations
│   │   └── tests/
│   ├── frontend/         # Next.js app (41,435 lines)
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities
│   │   └── __tests__/    # Test files
│   └── mobile/           # React Native (future)
├── docs/                 # Comprehensive documentation
├── BilanCompetence.AI/   # Business strategy docs
└── MANUS/                # Audit & remediation (NEW)
```

### Technology Stack

**Backend:**
- Runtime: Node.js 22.x
- Framework: Express.js 4.18
- Language: TypeScript 5.2
- Database: Neon PostgreSQL
- ORM: Raw SQL (pg 8.16)
- Auth: JWT (jsonwebtoken 9.0)
- File Storage: Supabase Storage (legacy)
- Real-time: Socket.io 4.7
- Payment: Stripe 19.1
- Email: Nodemailer 7.0 + Resend 6.2

**Frontend:**
- Framework: Next.js 14.0 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS 3.3
- State: Zustand 4.4 + React Query 5.90
- Forms: React Hook Form 7.48 + Zod 3.22
- UI: Custom components + Lucide icons
- Analytics: Vercel Analytics + Speed Insights
- Monitoring: Sentry 10.22 (disabled)

**DevOps:**
- Backend Hosting: Railway
- Frontend Hosting: Vercel
- Database: Neon PostgreSQL (serverless)
- CI/CD: GitHub Actions
- Containerization: Docker + Docker Compose

---

## Code Inventory

### Backend Services (35 files)

**✅ Neon-Ready Services (12):**
1. `userServiceNeon.ts` - User management
2. `dashboardServiceNeon.ts` - Dashboard data
3. `assessmentServiceNeon.ts` - Assessment workflow
4. `authFlowServiceNeon.ts` - Email verification, password reset
5. `schedulingServiceNeon.ts` - Appointment scheduling
6. `fileServiceNeon.ts` - File uploads
7. `pdfServiceNeon.ts` - PDF generation
8. `cvServiceNeon.ts` - CV parsing
9. `franceTravailService.ts` - France Travail API
10. `emailService.ts` - Email sending
11. `resendService.ts` - Resend integration
12. `stripeService.ts` - Payment processing

**⚠️ Supabase-Dependent Services (15):**
1. `supabaseService.ts` - Legacy Supabase client
2. `assessmentService.ts` - Old assessment logic
3. `schedulingService.ts` - Old scheduling logic
4. `fileService.ts` - Old file handling
5. `pdfService.ts` - Old PDF generation
6. `cvService.ts` - Old CV parsing
7. `analyticsService.ts` - Analytics
8. `chatService.ts` - Real-time chat
9. `complianceReportService.ts` - Compliance reports
10. `documentArchiveService.ts` - Document archiving
11. `notificationService.ts` - Notifications
12. `psychometricScoringService.ts` - Psychometric tests
13. `satisfactionSurveyService.ts` - Surveys
14. `qualioptService.ts` - Qualiopi compliance
15. `wedofService.ts` - Wedof integration

**🔌 Third-Party Integrations (8):**
1. `ssoService.ts` - SSO authentication
2. `twoFactorService.ts` - 2FA
3. `pennylaneService.ts` - Accounting integration
4. `realtimeService.ts` - Real-time features
5. `authService.ts` - Authentication core
6. `csvService.ts` - CSV export
7. `pdfGenerator.ts` - PDF utilities
8. `userService.ts` - User utilities

### Backend Routes (34 files)

**✅ Neon-Ready Routes (8):**
1. `auth.ts` - Authentication
2. `dashboardNeon.ts` - Dashboard
3. `assessments.ts` - Assessments
4. `emailVerificationNeon.ts` - Email verification
5. `passwordResetNeon.ts` - Password reset
6. `scheduling.ts` - Scheduling
7. `files.ts` - File uploads
8. `export.ts` - PDF exports

**⚠️ Needs Review/Migration (26):**
- `analytics.ts`, `chat.ts`, `chatEnhanced.ts`
- `documents.ts`, `notifications.ts`, `parcours.ts`
- `payments.ts`, `pennylane.ts`, `qualiopi.ts`
- `recommendations.ts`, `sessions.ts`, `tests.ts`
- `twoFactor.ts`, `users.ts`, `wedof.ts`
- `ai.ts` (AI/ML features - not yet implemented)
- `v1/` subdirectory (API versioning)

**🗑️ Backup Files (3):**
- `auth.neon.ts.backup`
- `auth.supabase.backup.ts`
- `users.supabase.backup.ts`

### Database Migrations (32 files)

**Migration Status:**
- ✅ All 32 migrations applied successfully
- ✅ Schema includes: users, assessments, bilans, recommendations, files, scheduling, audit_logs
- ⚠️ Some migrations reference Supabase-specific features (RLS policies, storage buckets)

### Frontend Structure

**Pages (App Router):**
- `/` - Landing page
- `/login`, `/register` - Authentication
- `/dashboard` - Main dashboard
- `/assessments` - Assessment wizard
- `/profile` - User profile
- `/admin` - Admin panel

**Components:**
- ✅ Design system implemented
- ✅ Reusable UI components
- ⚠️ No i18n (TR/FR) yet
- ⚠️ Accessibility (RGAA) not verified

---

## Dependency Analysis

### Backend Dependencies (29 packages)

**Critical:**
- `express` 4.18 - Web framework
- `pg` 8.16 - PostgreSQL client
- `jsonwebtoken` 9.0 - JWT auth
- `bcryptjs` 2.4 - Password hashing
- `zod` 3.22 - Schema validation

**Security:**
- `helmet` 7.0 - Security headers
- `cors` 2.8 - CORS middleware
- `express-rate-limit` 7.1 - Rate limiting

**File Processing:**
- `multer` 2.0 - File uploads
- `pdf-lib` 1.17, `pdfkit` 0.17 - PDF generation
- `pdf-parse` 2.4 - PDF parsing
- `mammoth` 1.11 - Word document parsing

**External Services:**
- `@supabase/supabase-js` 2.76 ⚠️ (legacy, should be removed)
- `stripe` 19.1 - Payments
- `nodemailer` 7.0, `resend` 6.2 - Email
- `socket.io` 4.7 - Real-time

**Utilities:**
- `axios` 1.12 - HTTP client
- `dotenv` 16.6 - Environment variables
- `winston` 3.18 - Logging
- `uuid` 9.0 - UUID generation

### Frontend Dependencies (26 packages)

**Core:**
- `next` 14.0 - Framework
- `react` 18.2, `react-dom` 18.2
- `typescript` (implicit)

**State Management:**
- `zustand` 4.4 - Global state
- `@tanstack/react-query` 5.90 - Server state

**Forms & Validation:**
- `react-hook-form` 7.48
- `@hookform/resolvers` 3.3
- `zod` 3.22

**UI & Styling:**
- `tailwindcss` 3.3
- `framer-motion` 12.23 - Animations
- `lucide-react` 0.546 - Icons
- `clsx` 2.0, `tailwind-merge` 2.2 - Class utilities
- `class-variance-authority` 0.7 - Component variants

**Data Visualization:**
- `recharts` 3.3 - Charts

**Utilities:**
- `axios` 1.6 - HTTP client
- `date-fns` 4.1 - Date utilities
- `react-hot-toast` 2.6, `sonner` 2.0 - Notifications

**Monitoring:**
- `@sentry/nextjs` 10.22 (disabled)
- `@vercel/analytics` 1.5
- `@vercel/speed-insights` 1.2

**Real-time:**
- `socket.io-client` 4.7

**⚠️ Legacy:**
- `@supabase/supabase-js` 2.38 (should be removed)

---

## Configuration Files

### Environment Variables

**Backend (.env.example):**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
SENDGRID_API_KEY=...
STRIPE_SECRET_KEY=...
SUPABASE_URL=...          ⚠️ Legacy
SUPABASE_SERVICE_KEY=...  ⚠️ Legacy
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=...
NEXT_PUBLIC_STRIPE_KEY=...
```

### Docker Configuration

**docker-compose.yml:**
- ✅ Backend service defined
- ✅ PostgreSQL service (local dev)
- ⚠️ No Redis service (Socket.io uses in-memory adapter)
- ⚠️ No frontend service (runs separately)

**Dockerfile.backend:**
- ✅ Multi-stage build
- ✅ Node 22 Alpine base
- ⚠️ No optimization for production

### CI/CD

**.github/workflows/ci.yml:**
- ✅ Runs on push/PR
- ✅ Linting
- ✅ Type checking
- ⚠️ Tests disabled (failing)
- ⚠️ No security scanning (SAST/SCA)

---

## Current Deployment Status

### Backend (Railway)

**URL:** `https://web-production-60dbd.up.railway.app`

**Status:** ✅ Running
- Health check: OK
- Uptime: Stable
- Auto-deploy: Enabled (GitHub integration)

**Environment:**
- Node.js 22.x
- PostgreSQL (Neon external)
- 512MB RAM
- Auto-scaling enabled

### Frontend (Vercel)

**URL:** `https://app.bilancompetence.ai`

**Status:** ✅ Running
- Build: Successful
- Deployment: Automatic (GitHub integration)
- CDN: Global edge network

**Environment:**
- Next.js 14 (App Router)
- Serverless functions
- Edge middleware

### Database (Neon)

**Status:** ✅ Running
- Serverless PostgreSQL
- Auto-scaling
- 32 migrations applied
- Backup: Manual (needs automation)

---

## Risk Assessment

### 🔴 Critical Risks

1. **Mixed Service Architecture**
   - **Issue:** Supabase and Neon services coexist
   - **Impact:** Confusion, potential bugs, maintenance overhead
   - **Mitigation:** Complete migration to Neon, remove Supabase dependencies

2. **Low Test Coverage (10.32%)**
   - **Issue:** 167 failing tests, mostly due to Supabase references
   - **Impact:** High regression risk, difficult refactoring
   - **Mitigation:** Fix tests, achieve ≥70% coverage

3. **No Automated Backups**
   - **Issue:** Database backups are manual
   - **Impact:** Data loss risk
   - **Mitigation:** Implement automated backup strategy

4. **Secrets in Codebase Risk**
   - **Issue:** Need to verify no hardcoded secrets
   - **Impact:** Security breach potential
   - **Mitigation:** Run secret scanning tools

### 🟡 Medium Risks

5. **No i18n Implementation**
   - **Issue:** TR/FR internationalization not implemented
   - **Impact:** Limited market reach
   - **Mitigation:** Implement i18n in Etap 7

6. **RGAA Accessibility Not Verified**
   - **Issue:** No accessibility audit performed
   - **Impact:** Compliance risk, user exclusion
   - **Mitigation:** RGAA audit in Etap 7

7. **No AI/ML Features**
   - **Issue:** ESCO/spaCy/OpenAI integrations not implemented
   - **Impact:** Core value proposition missing
   - **Mitigation:** Implement in Etap 5

8. **Rate Limiting Not Comprehensive**
   - **Issue:** Only basic rate limiting on some endpoints
   - **Impact:** DDoS vulnerability, cost overrun risk
   - **Mitigation:** Implement comprehensive rate limiting

### 🟢 Low Risks

9. **Documentation Drift**
   - **Issue:** Some docs may not reflect latest code
   - **Impact:** Developer confusion
   - **Mitigation:** "Doc-as-code" approach in all phases

10. **Performance Not Benchmarked**
    - **Issue:** No performance baselines established
    - **Impact:** Unknown scalability limits
    - **Mitigation:** Performance testing in Etap 4

---

## Compliance Status

### RGPD (GDPR)

**Status:** ⚠️ Partial
- ✅ User data in database
- ✅ Password hashing
- ✅ JWT authentication
- ⚠️ No data flow map
- ⚠️ No retention policy documented
- ⚠️ No PII masking in logs
- ⚠️ No user data export/deletion endpoints

**Action:** Create RGPD compliance checklist in Etap 3

### Qualiopi

**Status:** ❌ Not Implemented
- ❌ No compliance tracking
- ❌ No audit trail for training activities
- ❌ No evidence collection system

**Action:** Implement Qualiopi requirements in Etap 3

### ISO 21001

**Status:** ❌ Not Implemented
- ❌ No educational quality management system
- ❌ No learner satisfaction tracking
- ❌ No continuous improvement process

**Action:** ISO 21001 alignment in Etap 3

### RGAA (Accessibility)

**Status:** ❌ Not Verified
- ⚠️ No accessibility audit
- ⚠️ No keyboard navigation testing
- ⚠️ No screen reader compatibility

**Action:** RGAA Level AA audit in Etap 7

---

## Next Steps

### Immediate (Etap 1)

1. **Build & Run Verification**
   - Test Docker Compose locally
   - Verify all migrations
   - Create comprehensive .env.example
   - Run smoke tests

2. **Documentation Update**
   - Update README with current state
   - Create RUNBOOK for operations
   - Document all environment variables

### Short-term (Etap 2-3)

3. **Code Cleanup**
   - Remove all Supabase service files
   - Delete backup files
   - Eliminate dead code
   - Fix linting issues

4. **Security Hardening**
   - Run SAST/SCA tools
   - Scan for secrets
   - Implement comprehensive rate limiting
   - Add security headers

### Medium-term (Etap 4-5)

5. **Test Coverage**
   - Fix all 167 failing tests
   - Add integration tests
   - Achieve ≥70% coverage

6. **AI/ML Integration**
   - Implement ESCO dataset
   - Add spaCy NLP pipeline
   - Integrate OpenAI API with rate limiting

### Long-term (Etap 6-7)

7. **Production Readiness**
   - Optimize Docker builds
   - Implement observability
   - Automate backups

8. **UX/Accessibility**
   - Implement TR/FR i18n
   - RGAA Level AA compliance
   - Performance optimization

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Etap 0: Discovery | ✅ 4h | None |
| Etap 1: Build & Smoke | 6h | Etap 0 |
| Etap 2: Code Cleanup | 12h | Etap 1 |
| Etap 3: Security | 10h | Etap 2 |
| Etap 4: Testing | 16h | Etap 2 |
| Etap 5: AI/ML | 20h | Etap 3 |
| Etap 6: DevOps | 12h | Etap 4 |
| Etap 7: UX/i18n | 14h | Etap 4 |
| Final: Delivery | 8h | All |
| **Total** | **~102h** | **~13-15 days** |

---

## Code References

### Key Files to Review

**Backend:**
- `apps/backend/src/index.ts` - Main entry point
- `apps/backend/src/config/neon.ts` - Database connection
- `apps/backend/src/middleware/auth.ts` - Authentication
- `apps/backend/src/services/*Neon.ts` - Neon services

**Frontend:**
- `apps/frontend/app/layout.tsx` - Root layout
- `apps/frontend/lib/api.ts` - API client
- `apps/frontend/hooks/useAuth.ts` - Auth hook

**Configuration:**
- `.env.example` - Environment variables
- `docker-compose.yml` - Local development
- `.github/workflows/ci.yml` - CI/CD pipeline

---

## Artifacts

1. ✅ `/MANUS/TODO/todo.json` - Task breakdown (9 items, 102h estimated)
2. ✅ `/MANUS/REPORTS/plan-and-inventory.md` - This report
3. ✅ `/MANUS/README.md` - MANUS directory overview

---

## Approval Request

**Etap 0 is now complete.** 

**Summary:**
- ✅ Project structure documented
- ✅ Code inventory completed (35 services, 34 routes, 32 migrations)
- ✅ Dependency analysis done (29 backend, 26 frontend packages)
- ✅ Risk assessment identified (10 risks, 3 critical)
- ✅ Task breakdown created (9 phases, 102h estimated)

**Changes Made:**
- Created `/MANUS/` directory structure
- Generated `TODO/todo.json` with 9 work items
- Produced this comprehensive inventory report

**Evidence:**
- All files created in `/MANUS/` directory
- Project statistics: 1,141 files, ~80K lines of code
- Deployment status: Backend (Railway) ✅, Frontend (Vercel) ✅, Database (Neon) ✅

**Risks:**
- 🔴 Critical: Mixed Supabase/Neon architecture, low test coverage (10.32%), no automated backups
- 🟡 Medium: No i18n, RGAA not verified, AI/ML not implemented
- 🟢 Low: Documentation drift, performance not benchmarked

**Next Phase:** Etap 1 - Build & Smoke Test (6h estimated)

**Awaiting approval to proceed to Etap 1.**

---

*Report generated by Manus AI - 2025-10-27*

