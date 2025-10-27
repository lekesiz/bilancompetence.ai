# BilanCompetence.AI

> **Plateforme SaaS de bilan de compétences alimentée par l'IA**

[![Production](https://img.shields.io/badge/Production-LIVE-success)](https://app.bilancompetence.ai)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple)](https://railway.app)
[![Database](https://img.shields.io/badge/Database-Neon-blue)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-60%25-yellow)](MANUS/REPORTS/)
[![Production Ready](https://img.shields.io/badge/Production%20Ready-72%2F100-yellow)](MANUS/PRODUCTION_CHECKLIST.md)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 🚀 Production Readiness Status

**Overall Score:** 72/100 (⚠️ Good Foundation, Needs Work)  
**Status:** ⚠️ NOT READY FOR PRODUCTION  
**Last Updated:** October 27, 2025

| Area | Score | Status | Priority |
|:-----|:------|:-------|:---------|
| **Build & Deployment** | 95/100 | ✅ Excellent | - |
| **Database Schema** | 100/100 | ✅ Complete | - |
| **Test Coverage** | 60/100 | ⚠️ In Progress | 🔴 HIGH |
| **RGPD Compliance** | 60/100 | ⚠️ Partial | 🔴 HIGH |
| **Security** | 85/100 | ✅ Good | 🟡 MEDIUM |
| **Monitoring** | 88/100 | ✅ Excellent | 🟢 LOW |
| **AI/ML Integration** | 75/100 | ✅ Good | 🟡 MEDIUM |
| **i18n (FR/TR)** | 0/100 | ❌ Not Implemented | 🔴 HIGH |
| **Documentation** | 90/100 | ✅ Excellent | 🟢 LOW |

**Required Work:** 120 hours (Phase 1 - Critical Fixes)  
**Go-Live Timeline:** 3 weeks minimum

📊 **Detailed Reports:** [MANUS/FINAL_AUDIT_REPORT.md](MANUS/FINAL_AUDIT_REPORT.md)  
✅ **Production Checklist:** [MANUS/PRODUCTION_CHECKLIST.md](MANUS/PRODUCTION_CHECKLIST.md)

---

## 🔄 Current Work: Phase 1.1 - Test Coverage

**Objective:** Increase test coverage from 57% to 70%  
**Progress:** 60% (+3% / Target: +13%)  
**Status:** ⚠️ IN PROGRESS (37% complete)

**Latest Updates:**
- ✅ schedulingService.spec.ts: 100% passing (+10 tests)
- ⚠️ recommendations.integration.test.ts: 34% passing (+6 tests)
- ⏳ assessmentService.spec.ts: In progress

📈 **Progress Report:** [MANUS/REPORTS/phase1.1-test-coverage-progress.md](MANUS/REPORTS/phase1.1-test-coverage-progress.md)

---

## 🌐 Production URLs

| Service | URL | Status |
|:--------|:----|:-------|
| **Frontend** | [app.bilancompetence.ai](https://app.bilancompetence.ai) | ✅ LIVE |
| **Backend API** | [web-production-60dbd.up.railway.app](https://web-production-60dbd.up.railway.app) | ✅ LIVE |
| **Database** | Neon PostgreSQL (Private) | ✅ ACTIVE |

---

## 📋 Table des Matières

- [Production Readiness Status](#-production-readiness-status)
- [Current Work](#-current-work-phase-11---test-coverage)
- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Déploiement](#-déploiement)
- [Installation Locale](#-installation-locale)
- [Structure du Projet](#-structure-du-projet)
- [Technologies](#-technologies)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables d'Environnement](#-variables-denvironnement)
- [Documentation](#-documentation)
- [Contribution](#-contribution)
- [Support](#-support)

---

## 🎯 Vue d'ensemble

BilanCompetence.AI est une plateforme SaaS moderne qui révolutionne le processus de bilan de compétences en utilisant l'intelligence artificielle. La plateforme permet aux utilisateurs de :

- 📄 **Analyser automatiquement les CV** avec l'IA (Google Gemini)
- 🎯 **Évaluer les compétences** via des questionnaires interactifs
- 💼 **Recevoir des recommandations personnalisées** de carrière
- 📊 **Générer des rapports PDF** professionnels
- 📅 **Planifier des sessions** avec des conseillers
- 💬 **Communiquer en temps réel** via chat intégré
- 🔐 **Gérer les données** de manière sécurisée (RLS)
- ✅ **Conformité Qualiopi** (90/100 - Excellent)

---

## 🏗️ Architecture

### Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEURS                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 14)                       │
│         https://app.bilancompetence.ai                   │
│                  (Vercel Edge)                           │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│            BACKEND API (Express.js)                      │
│    https://web-production-60dbd.up.railway.app          │
│                 (Railway.app)                            │
│  • Winston Logging (95/100)                             │
│  • Query Monitoring                                     │
│  • Rate Limiting                                        │
│  • CORS, Helmet, RLS                                    │
└─────────┬───────────────────────┬───────────────────────┘
          │                       │
          ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│  Neon PostgreSQL │    │  Supabase Storage    │
│   (Database)     │    │   (File Storage)     │
│   ✅ 43 Tables   │    │   ✅ CV Files        │
│   ✅ 29 Migrations│   │   ✅ Documents       │
│   ✅ RLS Active  │    │   ✅ Chat Files      │
│   ✅ Pooled      │    │                      │
└──────────────────┘    └──────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              SERVICES EXTERNES                           │
│  • Google Gemini (AI Analysis) - 75/100                 │
│  • France Travail API (Jobs) - 90/100                   │
│  • Stripe (Payments)                                    │
│  • SendGrid (Emails)                                    │
│  • Pennylane (Invoicing)                                │
│  • Wedof (Integration)                                  │
└─────────────────────────────────────────────────────────┘
```

### Architecture Technique

**Monorepo Structure:**
```
bilancompetence.ai/
├── apps/
│   ├── frontend/          # Next.js 14 app (Vercel)
│   └── backend/           # Express.js API (Railway)
├── packages/              # Shared packages
├── MANUS/                 # Audit & Documentation
│   ├── FINAL_AUDIT_REPORT.md
│   ├── PRODUCTION_CHECKLIST.md
│   └── REPORTS/           # Detailed reports
├── RUNBOOK.md             # Operations guide (1,200+ lines)
├── MIGRATIONS.md          # Database migrations (1,500+ lines)
├── DOCKER_SETUP.md        # Local development (650+ lines)
└── README.md              # This file
```

---

## 🚀 Déploiement

### Production (Actuel)

**Frontend (Vercel):**
- URL: https://app.bilancompetence.ai
- Auto-deploy from `main` branch
- Edge functions enabled
- Environment variables configured

**Backend (Railway):**
- URL: https://web-production-60dbd.up.railway.app
- Auto-deploy from `main` branch
- Health checks: `/health`, `/api/version`
- Uptime monitoring enabled

**Database (Neon):**
- PostgreSQL 15
- Connection pooling enabled
- Automated daily backups
- RTO < 1h, RPO < 1h

### Déploiement Local

Voir [DOCKER_SETUP.md](DOCKER_SETUP.md) pour les instructions complètes.

**Quick Start:**
```bash
# 1. Clone repository
git clone https://github.com/lekesiz/bilancompetence.ai.git
cd bilancompetence.ai

# 2. Install dependencies
npm install

# 3. Setup environment
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 4. Start with Docker Compose
docker-compose up -d

# 5. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

---

## 📁 Structure du Projet

```
bilancompetence.ai/
├── apps/
│   ├── frontend/
│   │   ├── app/              # Next.js 14 app directory
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities
│   │   ├── public/           # Static assets
│   │   └── package.json
│   │
│   └── backend/
│       ├── src/
│       │   ├── routes/       # API routes (24 modules)
│       │   ├── services/     # Business logic (11 Neon services)
│       │   ├── middleware/   # Express middleware
│       │   ├── utils/        # Utilities (logger, etc.)
│       │   └── index.ts      # Entry point
│       ├── migrations/       # Database migrations (29 files)
│       ├── __tests__/        # Tests (18 files, 60% coverage)
│       └── package.json
│
├── MANUS/                    # Comprehensive Audit
│   ├── FINAL_AUDIT_REPORT.md          # Executive summary
│   ├── PRODUCTION_CHECKLIST.md        # Go-live checklist
│   └── REPORTS/                       # Detailed reports
│       ├── etap1-completion-report.md
│       ├── etap2-overall-summary.md
│       ├── etap3-completion-report.md
│       ├── etap4-partial-completion-report.md
│       ├── etap5-summary-completion.md
│       ├── etap6-completion-report.md
│       ├── etap7-completion-report.md
│       ├── etap8-completion-report.md
│       ├── etap9-completion-report.md
│       └── phase1.1-test-coverage-progress.md
│
├── RUNBOOK.md                # Operations guide
├── MIGRATIONS.md             # Migration documentation
├── DOCKER_SETUP.md           # Docker setup guide
├── docker-compose.yml        # Local development
└── README.md                 # This file
```

---

## 🛠️ Technologies

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, shadcn/ui
- **State Management:** React Context
- **Forms:** React Hook Form + Zod
- **Testing:** Playwright (E2E)

### Backend
- **Runtime:** Node.js 22
- **Framework:** Express.js
- **Language:** TypeScript 5.0
- **Database:** PostgreSQL 15 (Neon)
- **ORM:** Raw SQL (connection pooling)
- **Authentication:** JWT
- **Validation:** Zod
- **Logging:** Winston (production-grade)
- **Testing:** Jest (60% coverage)

### Infrastructure
- **Frontend Hosting:** Vercel (Edge)
- **Backend Hosting:** Railway
- **Database:** Neon PostgreSQL
- **File Storage:** Supabase Storage
- **Monitoring:** Winston + Query Monitoring
- **CI/CD:** GitHub Actions (planned)

### External Services
- **AI:** Google Gemini API
- **Jobs:** France Travail API
- **Payments:** Stripe
- **Emails:** SendGrid
- **Invoicing:** Pennylane
- **Integration:** Wedof

---

## 📜 Scripts Disponibles

### Backend

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript
npm run start            # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Database
npm run migrate          # Run migrations
npm run migrate:rollback # Rollback last migration

# Linting
npm run lint             # Lint code
npm run format           # Format code with Prettier
```

### Frontend

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test:e2e         # Run Playwright E2E tests

# Linting
npm run lint             # Lint code
npm run format           # Format code
```

---

## 🔐 Variables d'Environnement

### Backend (.env)

Voir [apps/backend/.env.example](apps/backend/.env.example) pour la liste complète.

**Critiques:**
```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AI
GEMINI_API_KEY=your-gemini-key

# External APIs
FRANCE_TRAVAIL_CLIENT_ID=...
FRANCE_TRAVAIL_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
SENDGRID_API_KEY=...
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📚 Documentation

### Guides Opérationnels
- [RUNBOOK.md](RUNBOOK.md) - Operations guide (1,200+ lines)
  - System overview & architecture
  - Deployment procedures
  - Database operations
  - Monitoring & health checks
  - Backup & disaster recovery (RTO < 1h, RPO < 1h)
  - Troubleshooting guide
  - Incident response (SEV1-SEV4)

- [MIGRATIONS.md](MIGRATIONS.md) - Database migrations (1,500+ lines)
  - 29 migration files documented
  - 3 execution methods
  - Rollback strategies
  - Best practices
  - Troubleshooting

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Local development (650+ lines)
  - Quick start (4 steps)
  - 6 services configuration
  - Troubleshooting guide

### Audit & Production Readiness
- [MANUS/FINAL_AUDIT_REPORT.md](MANUS/FINAL_AUDIT_REPORT.md) - Executive summary
  - Overall score: 72/100
  - 10 etaps completed
  - 250 hours roadmap
  - Prioritized action items

- [MANUS/PRODUCTION_CHECKLIST.md](MANUS/PRODUCTION_CHECKLIST.md) - Go-live checklist
  - 120 hours critical fixes
  - 3-week timeline
  - Phase-by-phase plan

### Progress Reports
- [MANUS/REPORTS/](MANUS/REPORTS/) - Detailed reports
  - Etap 1-10 completion reports
  - Phase 1.1 progress report
  - Test coverage analysis
  - RGPD compliance audit
  - Database schema audit

---

## 🤝 Contribution

### Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow TypeScript best practices
   - Add tests (target: 70% coverage)
   - Update documentation

3. **Test**
   ```bash
   npm test                  # Backend tests
   npm run test:e2e          # Frontend E2E tests
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push & PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

### Code Standards

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint + Prettier
- **Testing:** Jest (backend), Playwright (frontend)
- **Commits:** Conventional Commits format
- **Documentation:** Update README for major changes

---

## 📞 Support

### Resources

- **Documentation:** This README + linked guides
- **Audit Reports:** [MANUS/REPORTS/](MANUS/REPORTS/)
- **Runbook:** [RUNBOOK.md](RUNBOOK.md)
- **Issues:** [GitHub Issues](https://github.com/lekesiz/bilancompetence.ai/issues)

### Contact

- **Repository:** https://github.com/lekesiz/bilancompetence.ai
- **Production:** https://app.bilancompetence.ai
- **API:** https://web-production-60dbd.up.railway.app

---

## 📄 License

Proprietary - All rights reserved

---

**Last Updated:** October 27, 2025  
**Version:** 1.0.0 (Pre-Production)  
**Production Ready:** ⚠️ NO (72/100 - Needs 120h work)

