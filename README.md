# BilanCompetence.AI

> **Plateforme SaaS de bilan de compétences alimentée par l'IA**

[![Production](https://img.shields.io/badge/Production-LIVE-success)](https://app.bilancompetence.ai)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple)](https://railway.app)
[![Database](https://img.shields.io/badge/Database-Neon-blue)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 🌐 Production URLs

| Service | URL | Status |
|:--------|:----|:-------|
| **Frontend** | [app.bilancompetence.ai](https://app.bilancompetence.ai) | ✅ LIVE |
| **Backend API** | [web-production-60dbd.up.railway.app](https://web-production-60dbd.up.railway.app) | ✅ LIVE |
| **Database** | Neon PostgreSQL (Private) | ✅ ACTIVE |

---

## 📋 Table des Matières

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
└─────────┬───────────────────────┬───────────────────────┘
          │                       │
          ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│  Neon PostgreSQL │    │  Supabase Storage    │
│   (Database)     │    │   (File Storage)     │
│   ✅ Pooled      │    │   ✅ CV Files        │
│   ✅ RLS Active  │    │   ✅ Documents       │
└──────────────────┘    └──────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              SERVICES EXTERNES                           │
│  • Google Gemini (AI Analysis)                          │
│  • Stripe (Payments)                                    │
│  • SendGrid (Emails)                                    │
│  • France Travail API (Job Data)                        │
└─────────────────────────────────────────────────────────┘
```

### Architecture Technique

**Monorepo Structure:**
```
bilancompetence.ai/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   └── backend/           # Express.js API
├── packages/              # Shared code (future)
├── docs/                  # Documentation
└── supabase/             # Database migrations (legacy)
```

**Stack:**
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Express.js, TypeScript, Node.js 18+
- **Database:** Neon PostgreSQL (Serverless)
- **Storage:** Supabase Storage
- **AI:** Google Gemini API
- **Auth:** JWT + Row-Level Security (RLS)
- **Payment:** Stripe
- **Email:** SendGrid

---

## 🚀 Déploiement

### Production (Actuel)

#### Frontend (Vercel)
```bash
# Déploiement automatique sur push vers main
git push origin main

# Vercel build et deploy automatiquement
# URL: https://app.bilancompetence.ai
```

**Configuration Vercel:**
- Build Command: `cd apps/frontend && npm run build`
- Output Directory: `apps/frontend/.next`
- Install Command: `npm install`
- Node Version: 18.x

#### Backend (Railway)
```bash
# Déploiement automatique sur push vers main
git push origin main

# Railway build et deploy automatiquement
# URL: https://web-production-60dbd.up.railway.app
```

**Configuration Railway:**
- Build Command: `cd apps/backend && npm run build`
- Start Command: `cd apps/backend && npm start`
- Port: 3001 (auto-assigned by Railway)
- Health Check: `/health`

### Rollback

**Frontend (Vercel):**
1. Vercel Dashboard → Deployments
2. Sélectionner le déploiement précédent
3. "Promote to Production"

**Backend (Railway):**
1. Railway Dashboard → Deployments → HISTORY
2. Sélectionner le déploiement précédent
3. "Redeploy"

---

## 💻 Installation Locale

### Prérequis

- **Node.js:** 18.x ou supérieur
- **npm:** 9.x ou supérieur
- **Git:** Dernière version
- **PostgreSQL:** 14+ (ou compte Neon gratuit)

### Étapes d'Installation

#### 1. Cloner le Repository

```bash
git clone https://github.com/lekesiz/bilancompetence.ai.git
cd bilancompetence.ai
```

#### 2. Installer les Dépendances

```bash
# Root
npm install

# Frontend
cd apps/frontend && npm install

# Backend
cd apps/backend && npm install
```

#### 3. Configurer les Variables d'Environnement

**Frontend (.env.local):**
```bash
cd apps/frontend
cp .env.example .env.local
```

Éditer `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env):**
```bash
cd apps/backend
cp .env.example .env
```

Éditer `.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bilancompetence
DIRECT_URL=postgresql://user:password@localhost:5432/bilancompetence

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars

# Supabase Storage
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# External APIs (Optional for local dev)
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

#### 4. Initialiser la Base de Données

**Option A: Neon (Recommandé)**
1. Créer un compte gratuit sur [Neon](https://neon.tech)
2. Créer un nouveau projet
3. Copier le connection string
4. Mettre à jour `DATABASE_URL` dans `.env`

**Option B: PostgreSQL Local**
```bash
# Créer la base de données
createdb bilancompetence

# Exécuter les migrations
cd apps/backend
npm run migrate
```

#### 5. Lancer l'Application

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
# Backend running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
# Frontend running on http://localhost:3000
```

#### 6. Accéder à l'Application

Ouvrir le navigateur: [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du Projet

```
bilancompetence.ai/
├── apps/
│   ├── frontend/                    # Application Next.js
│   │   ├── app/                     # App Router (Next.js 14)
│   │   │   ├── (auth)/             # Routes d'authentification
│   │   │   ├── (dashboard)/        # Routes du tableau de bord
│   │   │   ├── api/                # API Routes (Next.js)
│   │   │   ├── layout.tsx          # Layout racine
│   │   │   └── page.tsx            # Page d'accueil
│   │   ├── components/             # Composants React
│   │   │   ├── ui/                 # Composants UI (Shadcn)
│   │   │   ├── forms/              # Formulaires
│   │   │   └── layouts/            # Layouts
│   │   ├── lib/                    # Utilitaires
│   │   ├── styles/                 # Styles globaux
│   │   ├── public/                 # Assets statiques
│   │   ├── next.config.js          # Configuration Next.js
│   │   ├── tailwind.config.ts      # Configuration Tailwind
│   │   └── package.json
│   │
│   └── backend/                     # API Express.js
│       ├── src/
│       │   ├── routes/             # Routes API
│       │   │   ├── auth.neon.ts   # Auth endpoints (Neon)
│       │   │   ├── users.neon.ts  # User endpoints (Neon)
│       │   │   ├── cv.neon.ts     # CV endpoints (Neon)
│       │   │   └── ...
│       │   ├── services/           # Business logic
│       │   │   ├── userServiceNeon.ts
│       │   │   ├── cvServiceNeon.ts
│       │   │   └── ...
│       │   ├── middleware/         # Middlewares
│       │   │   ├── auth.ts        # JWT authentication
│       │   │   ├── errorHandler.ts
│       │   │   └── ...
│       │   ├── config/            # Configuration
│       │   │   ├── neon.ts       # Neon PostgreSQL config
│       │   │   └── supabase.ts   # Supabase Storage config
│       │   ├── types/            # TypeScript types
│       │   ├── utils/            # Utilitaires
│       │   └── index.ts          # Point d'entrée
│       ├── tests/                # Tests
│       ├── migrations/           # Database migrations
│       ├── dist/                 # Build output
│       └── package.json
│
├── docs/                          # Documentation
│   ├── 01_project/               # Documentation projet
│   ├── 02_architecture/          # Architecture
│   ├── 03_api/                   # API documentation
│   └── 04_deployment/            # Déploiement
│
├── .github/                      # GitHub configuration
│   └── workflows/                # CI/CD (future)
│
├── DEPLOYMENT_STATUS.md          # 🆕 Statut déploiement
├── TEKNIK_DEVIR_DOKUMANI.md     # Documentation technique
├── README.md                     # Ce fichier
├── .gitignore
└── package.json                  # Root package.json
```

---

## 🛠️ Technologies

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Shadcn/ui
- **State Management:** React Context + Hooks
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Fetch API
- **Auth:** JWT (localStorage)

### Backend
- **Framework:** Express.js 4.18
- **Language:** TypeScript 5.0
- **Database ORM:** node-postgres (pg)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **File Upload:** Multer
- **CORS:** cors middleware
- **Logging:** Winston (future)

### Database & Storage
- **Database:** Neon PostgreSQL (Serverless)
  - Connection Pooling ✅
  - Row-Level Security (RLS) ✅
  - Automatic Backups ✅
- **File Storage:** Supabase Storage
  - CV files
  - Documents
  - Profile pictures

### External Services
- **AI:** Google Gemini API (CV analysis)
- **Payment:** Stripe
- **Email:** SendGrid
- **Job Data:** France Travail API

### DevOps
- **Hosting Frontend:** Vercel
- **Hosting Backend:** Railway.app
- **Version Control:** Git + GitHub
- **CI/CD:** Vercel (auto) + Railway (auto)
- **Monitoring:** Vercel Analytics + Railway Metrics

---

## 📜 Scripts Disponibles

### Root
```bash
npm install          # Installer toutes les dépendances
npm run clean        # Nettoyer node_modules et build
```

### Frontend
```bash
cd apps/frontend

npm run dev          # Démarrer en mode développement (port 3000)
npm run build        # Build pour production
npm run start        # Démarrer en mode production
npm run lint         # Linter le code
npm run type-check   # Vérifier les types TypeScript
```

### Backend
```bash
cd apps/backend

npm run dev          # Démarrer en mode développement (port 3001)
npm run build        # Compiler TypeScript → JavaScript
npm run start        # Démarrer en mode production
npm run test         # Lancer les tests
npm run test:watch   # Tests en mode watch
npm run migrate      # Exécuter les migrations DB
npm run lint         # Linter le code
```

---

## 🔐 Variables d'Environnement

### Frontend (Vercel)

| Variable | Description | Requis | Exemple |
|:---------|:------------|:-------|:--------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | ✅ | `https://web-production-60dbd.up.railway.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | ✅ | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ | `eyJhbGciOiJIUzI1...` |

### Backend (Railway)

| Variable | Description | Requis | Exemple |
|:---------|:------------|:-------|:--------|
| `DATABASE_URL` | Connection string Neon (pooled) | ✅ | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | Connection string Neon (direct) | ✅ | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret pour JWT tokens | ✅ | `min_32_caracteres_secret_key` |
| `JWT_REFRESH_SECRET` | Secret pour refresh tokens | ⚠️ | `min_32_caracteres_refresh_key` |
| `SUPABASE_URL` | URL Supabase | ✅ | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role | ✅ | `eyJhbGciOiJIUzI1...` |
| `NODE_ENV` | Environnement | ✅ | `production` |
| `PORT` | Port du serveur | ⚠️ | `3001` (Railway auto-assign) |
| `FRONTEND_URL` | URL du frontend | ✅ | `https://app.bilancompetence.ai` |
| `CORS_ORIGIN` | Origine CORS autorisée | ✅ | `https://app.bilancompetence.ai` |
| `GEMINI_API_KEY` | Clé API Google Gemini | ⚠️ | `AIzaSy...` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | ⚠️ | `sk_live_...` |
| `SENDGRID_API_KEY` | Clé API SendGrid | ⚠️ | `SG.xxx` |

**Légende:**
- ✅ Requis pour fonctionnement de base
- ⚠️ Optionnel ou requis pour certaines fonctionnalités

---

## 📚 Documentation

### Documentation Principale
- [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md) - **🆕 Statut déploiement actuel**
- [TEKNIK_DEVIR_DOKUMANI.md](./TEKNIK_DEVIR_DOKUMANI.md) - Documentation technique complète
- [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) - Vue d'ensemble architecture
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentation API

### Documentation Détaillée
- [docs/01_project/](./docs/01_project/) - Documentation projet
- [docs/02_architecture/](./docs/02_architecture/) - Architecture technique
- [docs/03_api/](./docs/03_api/) - Endpoints API
- [docs/04_deployment/](./docs/04_deployment/) - Guides de déploiement

### Rapports
- [NIHAI_MVP_BACKLOG.md](./NIHAI_MVP_BACKLOG.md) - Backlog MVP
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Statut du projet
- [RAPPORT_FINAL_MIGRATION_NEON.md](./docs/RAPPORT_FINAL_MIGRATION_NEON.md) - Migration Neon

---

## 🤝 Contribution

### Workflow Git

```bash
# 1. Créer une branche feature
git checkout -b feature/nom-de-la-feature

# 2. Développer et commiter
git add .
git commit -m "feat: description de la feature"

# 3. Push vers GitHub
git push origin feature/nom-de-la-feature

# 4. Créer une Pull Request sur GitHub

# 5. Après review et merge, supprimer la branche
git checkout main
git pull origin main
git branch -d feature/nom-de-la-feature
```

### Convention de Commit

Utiliser [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, point-virgules manquants, etc.
refactor: refactorisation du code
test: ajout de tests
chore: tâches de maintenance
```

**Exemples:**
```bash
git commit -m "feat: add CV upload functionality"
git commit -m "fix: resolve authentication token expiration"
git commit -m "docs: update deployment documentation"
```

---

## 🆘 Support

### Issues & Bugs

Créer une issue sur GitHub: [Issues](https://github.com/lekesiz/bilancompetence.ai/issues)

### Documentation

- **Deployment:** [DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)
- **Technical:** [TEKNIK_DEVIR_DOKUMANI.md](./TEKNIK_DEVIR_DOKUMANI.md)
- **API:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Ressources Externes

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Express Docs:** https://expressjs.com/

---

## 📄 License

Proprietary - Tous droits réservés

---

## 👥 Équipe

- **Développeur Principal:** lekesiz
- **AI Assistant:** Manus AI

---

## 🎯 Roadmap

### Phase 1: MVP (En cours - 85% complété)
- [x] Authentication système
- [x] CV upload et analyse
- [x] Assessment questionnaires
- [x] Dashboard utilisateur
- [ ] Recommendation engine (en cours)
- [ ] PDF report generation (en cours)
- [ ] Email notifications (en cours)

### Phase 2: Production Launch (Prochaine)
- [ ] Custom domain backend: `api.bilancompetence.ai`
- [ ] Monitoring & alerting (Sentry)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Marketing website

### Phase 3: Scale (Future)
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Team collaboration features
- [ ] White-label solution

---

**Dernière mise à jour:** 26 Octobre 2025  
**Version:** 1.0.0-beta  
**Statut:** ✅ Production LIVE


