# BilanCompetence.AI

> **Plateforme de Bilan de Compétences Intelligente**
> 
> Une solution moderne et complète pour accompagner les professionnels dans leur évolution de carrière.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-blue.svg)](https://neon.tech/)

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Documentation](#-documentation)
- [Licence](#-licence)

---

## 🎯 À Propos

**BilanCompetence.AI** est une plateforme web moderne qui digitalise et optimise le processus de bilan de compétences. Elle offre :

- 🎓 **Évaluation des compétences** : Questionnaires interactifs et analyses approfondies
- 🤖 **Recommandations IA** : Suggestions de carrière personnalisées basées sur les compétences
- 📊 **Tableaux de bord** : Visualisation en temps réel de la progression
- 👥 **Gestion multi-rôles** : Bénéficiaires, consultants et administrateurs
- 📄 **Génération de rapports** : Exports PDF professionnels
- 💬 **Messagerie intégrée** : Communication en temps réel entre bénéficiaires et consultants
- 📅 **Planification** : Système de réservation de sessions

---

## 🏗️ Architecture

Le projet utilise une architecture **monorepo** avec trois composantes principales :

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                    │
│                    Vercel Deployment                        │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTPS)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Express.js + TypeScript)           │
│                    Vercel/Railway Deployment                │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌────────────────────────┐    ┌────────────────────────┐
│  Neon PostgreSQL       │    │  Supabase Storage      │
│  (Serverless Database) │    │  (File Storage)        │
└────────────────────────┘    └────────────────────────┘
```

### Architecture Hybride

Le projet utilise une approche hybride innovante :

- **Neon PostgreSQL** : Base de données serverless pour les données structurées (utilisateurs, évaluations, etc.)
- **Supabase Storage** : Stockage de fichiers pour les CV et documents

Cette architecture combine les avantages de Neon (performance, branching, auto-scaling) avec les capacités de stockage de Supabase.

---

## 🛠️ Technologies

### Frontend
- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utility-first
- **React Query** : Gestion d'état serveur
- **Zustand** : Gestion d'état client
- **React Hook Form + Zod** : Gestion et validation de formulaires

### Backend
- **Node.js 20.x** : Runtime JavaScript
- **Express.js** : Framework web
- **TypeScript** : Typage statique
- **pg (node-postgres)** : Driver PostgreSQL natif
- **JWT** : Authentification stateless

### Base de Données
- **Neon PostgreSQL** : Base de données serverless
- **Row-Level Security (RLS)** : Sécurité au niveau des lignes
- **Supabase Storage** : Stockage de fichiers

### DevOps
- **Vercel** : Déploiement frontend et backend
- **GitHub Actions** : CI/CD
- **Jest** : Tests unitaires et d'intégration
- **Playwright** : Tests E2E

---

## 📦 Installation

### Prérequis

- Node.js 20.x ou supérieur
- npm 9.x ou supérieur
- Git
- Compte Neon PostgreSQL
- Compte Supabase (pour Storage uniquement)

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/lekesiz/bilancompetence.ai.git
   cd bilancompetence.ai
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos clés API
   ```

---

## ⚙️ Configuration

### Variables d'Environnement Essentielles

```bash
# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Supabase Storage (pour les fichiers uniquement)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Services externes
STRIPE_SECRET_KEY=sk_test_xxx
RESEND_API_KEY=re_xxx
FRANCE_TRAVAIL_API_KEY=your_api_key
```

Voir `.env.example` pour la liste complète des variables.

---

## 🚀 Développement

### Démarrer le Frontend

```bash
npm run dev --workspace=apps/frontend
```

Le frontend sera accessible sur `http://localhost:3000`

### Démarrer le Backend

```bash
npm run dev --workspace=apps/backend
```

Le backend sera accessible sur `http://localhost:3001`

### Lancer les Tests

```bash
# Tests backend
npm test --workspace=apps/backend

# Tests frontend
npm test --workspace=apps/frontend

# Tests E2E
npm run test:e2e --workspace=apps/frontend
```

---

## 🌐 Déploiement

### Frontend (Vercel)

Le frontend est automatiquement déployé sur Vercel à chaque push sur `main`.

**URL de production** : `https://app.bilancompetence.ai`

### Backend (Vercel/Railway)

Le backend peut être déployé sur Vercel (serverless) ou Railway (container).

**Configuration Vercel** : Voir `apps/backend/vercel.json`

---

## 📚 Documentation

| Document | Description |
|:---------|:------------|
| [TEKNIK_DEVIR_DOKUMANI.md](./TEKNIK_DEVIR_DOKUMANI.md) | 🔥 **Document de transfert technique complet** |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Documentation complète de l'API |
| [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) | Vue d'ensemble de l'architecture |
| [RAPPORT_FINAL_MIGRATION_NEON.md](./docs/RAPPORT_FINAL_MIGRATION_NEON.md) | Rapport de migration vers Neon |

---

## 🔐 Sécurité

- **RLS (Row-Level Security)** : Sécurité au niveau des lignes dans Neon PostgreSQL
- **JWT** : Authentification stateless avec tokens d'accès et de rafraîchissement
- **Helmet** : En-têtes de sécurité HTTP
- **Rate Limiting** : Protection contre les abus
- **CORS** : Contrôle d'origine croisée
- **Input Sanitization** : Protection XSS et injection SQL

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter [CONTRIBUTING.md](./CONTRIBUTING.md) pour plus de détails.

---

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

---

## 📞 Contact

Pour toute question ou support, veuillez ouvrir une issue sur GitHub.

---

**Développé avec ❤️ par l'équipe BilanCompetence.AI**

