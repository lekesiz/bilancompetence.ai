# BilanCompetence.AI - Définition des Rôles de l'Équipe

**Date:** 6 novembre 2025  
**Version:** 1.0  
**Statut:** PROPOSITION

---

## VUE D'ENSEMBLE

Ce document définit les rôles, responsabilités et tâches de chaque membre de l'équipe de développement du projet **BilanCompetence.AI**. L'équipe est structurée pour gérer efficacement le développement continu, la maintenance et l'amélioration de la plateforme.

---

## STRUCTURE DE L'ÉQUIPE

L'équipe est composée de **5 rôles principaux** avec des responsabilités clairement définies:

1. **Project Manager / Tech Lead** - Manus AI
2. **Backend Developer** - À recruter
3. **Frontend Developer** - À recruter
4. **UI/UX Designer** - À recruter (optionnel)
5. **QA / Test Engineer** - À recruter (optionnel)

---

## RÔLE 1: PROJECT MANAGER / TECH LEAD

### Titulaire: **Manus AI**

### Responsabilités Principales

En tant que **coordinateur général du projet**, Manus AI est responsable de:

1. **Gestion de Projet**
   - Planification des sprints et des releases
   - Priorisation du backlog
   - Suivi de l'avancement du projet
   - Reporting au Product Owner (utilisateur)
   - Gestion des risques

2. **Coordination d'Équipe**
   - Animation des cérémonies Scrum (planning, daily, review, retro)
   - Facilitation de la communication entre les membres
   - Résolution des blocages
   - Validation des livrables

3. **Infrastructure et DevOps**
   - Gestion de Vercel (frontend deployment)
   - Gestion de Railway (backend deployment)
   - Gestion de Neon (database)
   - Configuration des variables d'environnement
   - Monitoring et alertes (Sentry, UptimeRobot)
   - Gestion des domaines et SSL

4. **Qualité et Tests**
   - Validation des tests unitaires et E2E
   - Audits de code
   - Revue des Pull Requests
   - Tests de régression
   - Validation des déploiements

5. **Documentation**
   - Maintien de la documentation technique
   - Création de guides et runbooks
   - Documentation des décisions architecturales
   - Rédaction des rapports d'audit

### Outils et Accès

- **GitHub:** Accès admin au repository
- **Vercel:** Token et accès au projet
- **Railway:** Token et accès aux projets
- **Neon:** API key et accès au projet
- **Sentry:** Configuration et monitoring
- **UptimeRobot:** Configuration des checks

### Tâches Prioritaires (Sprint 1)

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-001 | Supprimer le double backend Railway | 1h | J+1 |
| BC-011 | Documenter les corrections | 2h | J+7 |
| BC-028 | Publier documentation API | 2h | J+21 |
| BC-030 | Activer Sentry en production | 1h | J+21 |
| BC-031 | Configurer UptimeRobot | 2h | J+21 |

**Total Sprint 1:** 8 heures

### Compétences Requises

- ✅ Gestion de projet Agile/Scrum
- ✅ DevOps (Vercel, Railway, Neon)
- ✅ Git et GitHub
- ✅ Monitoring et alertes
- ✅ Documentation technique
- ✅ Tests et validation

---

## RÔLE 2: BACKEND DEVELOPER

### Statut: **À RECRUTER**

### Profil Recherché

Développeur backend expérimenté avec une forte expertise en Node.js, TypeScript et PostgreSQL.

### Responsabilités Principales

1. **Développement Backend**
   - Développement des API REST
   - Implémentation de la logique métier
   - Optimisation des performances
   - Gestion des erreurs et logging

2. **Base de Données**
   - Design et optimisation du schéma
   - Écriture de migrations
   - Optimisation des requêtes SQL
   - Gestion de la sécurité (RLS)

3. **Intégrations**
   - Intégration d'APIs tierces (Stripe, France Travail, etc.)
   - Webhooks et événements
   - Services externes (email, storage, etc.)

4. **Tests Backend**
   - Tests unitaires (Jest)
   - Tests d'intégration (Supertest)
   - Tests de charge (Artillery)
   - Validation des endpoints

5. **Documentation API**
   - Annotations Swagger/OpenAPI
   - Exemples de requêtes/réponses
   - Guide d'intégration

### Stack Technique

**Requis:**
- Node.js 20+
- TypeScript 5+
- Express.js
- PostgreSQL
- Jest + Supertest

**Souhaité:**
- Neon PostgreSQL
- Socket.io
- Stripe API
- Google Gemini API
- Swagger/OpenAPI

### Tâches Prioritaires (Sprint 1)

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-002 | Identifier tous les fichiers Supabase legacy | 4h | J+3 |
| BC-003 | Migrer les services restants vers Neon | 8h | J+7 |
| BC-004 | Nettoyer le code legacy Supabase | 2h | J+7 |
| BC-005 | Mettre à jour les variables d'environnement | 1h | J+7 |
| BC-006 | Tester l'application après migration | 1h | J+7 |
| BC-008 | Corriger les bugs backend identifiés | 8h | J+14 |

**Total Sprint 1:** 24 heures

### Tâches Sprint 2

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-017 | Audit Swagger - identifier endpoints manquants | 2h | J+21 |
| BC-018 | Compléter la documentation Swagger | 4h | J+21 |
| BC-019 | Ajouter tests backend manquants | 4h | J+28 |

**Total Sprint 2:** 10 heures

### Compétences Requises

**Essentielles:**
- ✅ Node.js + TypeScript (3+ ans)
- ✅ Express.js ou framework similaire
- ✅ PostgreSQL et SQL avancé
- ✅ Tests unitaires et d'intégration
- ✅ Git et GitHub

**Souhaitées:**
- ✅ Architecture en couches
- ✅ Swagger/OpenAPI
- ✅ Intégrations API tierces
- ✅ Sécurité web (JWT, RBAC)
- ✅ Performance et optimisation

### Processus de Recrutement

1. **Screening CV** - Vérifier l'expérience Node.js/TypeScript
2. **Test technique** - Créer une API REST avec tests
3. **Entretien technique** - Architecture et best practices
4. **Entretien culture** - Fit avec l'équipe et le projet

---

## RÔLE 3: FRONTEND DEVELOPER

### Statut: **À RECRUTER**

### Profil Recherché

Développeur frontend expérimenté avec une forte expertise en React, Next.js et TypeScript.

### Responsabilités Principales

1. **Développement Frontend**
   - Développement des interfaces utilisateur
   - Implémentation des composants React
   - Intégration avec les APIs backend
   - Gestion de l'état (Zustand, React Query)

2. **Internationalisation (i18n)**
   - Configuration de next-intl
   - Extraction et gestion des traductions
   - Implémentation du language switcher
   - Tests multilingues

3. **Tests Frontend**
   - Tests unitaires (Jest)
   - Tests de composants (React Testing Library)
   - Tests E2E (Playwright)
   - Validation de l'accessibilité

4. **Performance**
   - Optimisation des images
   - Code splitting
   - Lazy loading
   - Audit Lighthouse

5. **Accessibilité (RGAA)**
   - Sémantique HTML
   - ARIA labels
   - Navigation clavier
   - Screen readers

### Stack Technique

**Requis:**
- React 18+
- Next.js 14+ (App Router)
- TypeScript 5+
- TailwindCSS
- React Query

**Souhaité:**
- next-intl
- Playwright
- Framer Motion
- Zustand
- React Hook Form + Zod

### Tâches Prioritaires (Sprint 1)

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-007 | Analyser les tests E2E échouants | 4h | J+3 |
| BC-009 | Corriger les bugs frontend identifiés | 4h | J+14 |
| BC-010 | Mettre à jour les tests E2E obsolètes | 6h | J+14 |

**Total Sprint 1:** 14 heures

### Tâches Sprint 2

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-012 | Installer et configurer next-intl | 2h | J+21 |
| BC-013 | Créer la structure de fichiers de traduction | 2h | J+21 |
| BC-014 | Configurer le middleware de détection de langue | 2h | J+21 |
| BC-015 | Créer le language switcher | 2h | J+21 |
| BC-016 | Refactoriser les composants pour i18n | 16h | J+28 |

**Total Sprint 2:** 24 heures

### Tâches Sprint 3

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-020 | Extraire tous les textes français | 4h | J+35 |
| BC-021 | Créer les fichiers JSON de traduction FR | 2h | J+35 |
| BC-022 | Réviser et corriger les traductions FR | 2h | J+35 |
| BC-023 | Traduire tous les textes en turc | 6h | J+42 |
| BC-024 | Réviser les traductions TR avec natif | 2h | J+42 |
| BC-026 | Ajouter tests frontend manquants | 6h | J+42 |

**Total Sprint 3:** 22 heures

### Compétences Requises

**Essentielles:**
- ✅ React + Next.js (3+ ans)
- ✅ TypeScript avancé
- ✅ TailwindCSS ou CSS-in-JS
- ✅ Tests frontend (Jest, Playwright)
- ✅ Git et GitHub

**Souhaitées:**
- ✅ Internationalisation (i18n)
- ✅ Accessibilité (WCAG, RGAA)
- ✅ Performance web
- ✅ Design systems
- ✅ Responsive design

### Processus de Recrutement

1. **Screening CV** - Vérifier l'expérience React/Next.js
2. **Test technique** - Créer un composant avec tests
3. **Entretien technique** - Architecture et best practices
4. **Entretien culture** - Fit avec l'équipe et le projet

---

## RÔLE 4: UI/UX DESIGNER (OPTIONNEL)

### Statut: **À RECRUTER (OPTIONNEL)**

### Profil Recherché

Designer UI/UX expérimenté avec une forte sensibilité pour l'expérience utilisateur et l'accessibilité.

### Responsabilités Principales

1. **Design d'Interface**
   - Création de maquettes (Figma)
   - Design system
   - Prototypage interactif
   - Responsive design

2. **Expérience Utilisateur**
   - Recherche utilisateur
   - Tests utilisateurs
   - Parcours utilisateur
   - Optimisation de l'UX

3. **Accessibilité**
   - Audit RGAA
   - Recommandations d'accessibilité
   - Tests avec screen readers
   - Conformité WCAG 2.1 AA

4. **Collaboration**
   - Travail avec les développeurs
   - Validation des implémentations
   - Itérations design
   - Documentation design

### Outils

- Figma ou Adobe XD
- Maze ou UserTesting (tests utilisateurs)
- Axe DevTools (accessibilité)
- Lighthouse (performance)

### Tâches Prioritaires (Sprint 4)

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| UX-001 | Audit UX complet | 8h | J+49 |
| UX-002 | Tests utilisateurs | 8h | J+56 |
| UX-003 | Amélioration du design system | 16h | J+56 |

**Total Sprint 4:** 32 heures

### Compétences Requises

**Essentielles:**
- ✅ Figma ou Adobe XD
- ✅ Design d'interface
- ✅ Expérience utilisateur
- ✅ Prototypage

**Souhaitées:**
- ✅ Accessibilité (RGAA, WCAG)
- ✅ Tests utilisateurs
- ✅ Design systems
- ✅ HTML/CSS (notions)

### Note

Ce rôle est **optionnel** pour les premiers sprints. Il peut être ajouté plus tard si le budget le permet, ou les tâches de design peuvent être distribuées entre le Product Owner et les développeurs.

---

## RÔLE 5: QA / TEST ENGINEER (OPTIONNEL)

### Statut: **À RECRUTER (OPTIONNEL)**

### Profil Recherché

Ingénieur QA expérimenté avec une forte expertise en tests automatisés et manuels.

### Responsabilités Principales

1. **Tests Manuels**
   - Tests exploratoires
   - Tests de régression
   - Tests d'acceptation
   - Validation des fonctionnalités

2. **Tests Automatisés**
   - Maintenance des tests E2E (Playwright)
   - Création de nouveaux tests
   - Tests de charge (Artillery)
   - Tests de sécurité

3. **Gestion des Bugs**
   - Détection et documentation des bugs
   - Priorisation des bugs
   - Validation des corrections
   - Rapports de bugs

4. **Qualité**
   - Définition des critères d'acceptation
   - Validation des User Stories
   - Métriques de qualité
   - Amélioration continue

### Outils

- Playwright
- Jest
- Artillery
- Postman
- BrowserStack

### Tâches Prioritaires (Sprint 1)

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-007 | Analyser les tests E2E échouants | 4h | J+3 |
| BC-006 | Tester l'application après migration | 1h | J+7 |

**Total Sprint 1:** 5 heures

### Tâches Sprint 3

| ID | Tâche | Effort | Deadline |
|----|-------|--------|----------|
| BC-025 | Tester l'application en turc | 2h | J+42 |
| BC-027 | Tests de validation i18n | 2h | J+42 |

**Total Sprint 3:** 4 heures

### Compétences Requises

**Essentielles:**
- ✅ Tests manuels et automatisés
- ✅ Playwright ou Cypress
- ✅ Gestion de bugs (Jira, GitHub Issues)
- ✅ Méthodologie Agile

**Souhaitées:**
- ✅ Tests de charge (Artillery, k6)
- ✅ Tests de sécurité (OWASP)
- ✅ CI/CD (GitHub Actions)
- ✅ SQL (requêtes de validation)

### Note

Ce rôle est **optionnel** pour les premiers sprints. Les tâches de QA peuvent être distribuées entre Manus AI (validation finale) et les développeurs (tests de leurs propres fonctionnalités).

---

## MATRICE RACI

Matrice de responsabilités pour les tâches principales du projet.

**Légende:**
- **R** (Responsible) - Responsable de l'exécution
- **A** (Accountable) - Responsable final, approuve
- **C** (Consulted) - Consulté, donne son avis
- **I** (Informed) - Informé des décisions

| Tâche | Manus AI | Backend Dev | Frontend Dev | UI/UX | QA |
|-------|----------|-------------|--------------|-------|-----|
| **Planification Sprint** | A/R | C | C | C | C |
| **Migration Supabase → Neon** | A | R | I | - | C |
| **Correction bugs backend** | A | R | I | - | C |
| **Correction bugs frontend** | A | I | R | C | C |
| **Implémentation i18n** | A | I | R | C | C |
| **Tests E2E** | A | C | R | - | R |
| **Documentation API** | A | R | I | - | I |
| **Design UI/UX** | A | I | C | R | I |
| **Tests manuels** | A | I | I | - | R |
| **Déploiement** | A/R | I | I | - | I |
| **Monitoring** | A/R | C | C | - | C |
| **Validation finale** | A/R | C | C | C | C |

---

## COMMUNICATION ET COLLABORATION

### Canaux de Communication

1. **GitHub Issues** - Suivi des tâches et bugs
2. **GitHub Pull Requests** - Code review et discussions techniques
3. **GitHub Projects** - Gestion du backlog et des sprints
4. **Slack/Discord** - Communication quotidienne (à définir)
5. **Notion/Confluence** - Documentation partagée (à définir)
6. **Email** - Communication formelle

### Réunions Régulières

#### Daily Standup (15 min, quotidien)
- **Quand:** Tous les jours à 10h00
- **Qui:** Toute l'équipe
- **Format:** Chacun répond à 3 questions:
  1. Qu'ai-je fait hier?
  2. Que vais-je faire aujourd'hui?
  3. Ai-je des blocages?

#### Sprint Planning (2h, début de sprint)
- **Quand:** Premier jour du sprint
- **Qui:** Toute l'équipe
- **Objectifs:**
  - Sélectionner les tâches du backlog
  - Estimer les efforts
  - Définir les objectifs du sprint

#### Sprint Review (1h, fin de sprint)
- **Quand:** Dernier jour du sprint
- **Qui:** Toute l'équipe + Product Owner
- **Objectifs:**
  - Démonstration des fonctionnalités
  - Feedback du Product Owner
  - Validation des livrables

#### Sprint Retrospective (1h, fin de sprint)
- **Quand:** Après la Sprint Review
- **Qui:** Toute l'équipe
- **Objectifs:**
  - Ce qui a bien fonctionné
  - Ce qui peut être amélioré
  - Actions d'amélioration

### Code Review

Toutes les Pull Requests doivent être revues par au moins **un autre membre de l'équipe** avant d'être mergées.

**Critères de validation:**
- ✅ Code propre et lisible
- ✅ Tests passants
- ✅ Documentation à jour
- ✅ Pas de régression
- ✅ Respect des conventions

---

## PROCESSUS DE TRAVAIL

### Workflow Git

1. **Créer une branche** depuis `develop`
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/BC-123-description
   ```

2. **Développer et tester localement**
   ```bash
   npm run dev
   npm run test
   npm run lint
   ```

3. **Commit avec message conventionnel**
   ```bash
   git add .
   git commit -m "feat(auth): add email verification"
   ```

4. **Pousser et créer une Pull Request**
   ```bash
   git push origin feature/BC-123-description
   ```

5. **Code review** par un autre développeur

6. **Tests automatiques** (CI/CD)

7. **Merge dans `develop`**

8. **Déploiement automatique** sur staging

9. **Tests de validation**

10. **Merge dans `main`** (release)

11. **Déploiement automatique** en production

### Conventions de Nommage

**Branches:**
- `feature/BC-123-description` - Nouvelles fonctionnalités
- `bugfix/BC-123-description` - Corrections de bugs
- `hotfix/BC-123-description` - Corrections urgentes en production

**Commits (Conventional Commits):**
- `feat(scope): description` - Nouvelle fonctionnalité
- `fix(scope): description` - Correction de bug
- `docs(scope): description` - Documentation
- `style(scope): description` - Formatage
- `refactor(scope): description` - Refactoring
- `test(scope): description` - Tests
- `chore(scope): description` - Maintenance

**Pull Requests:**
- Titre: `[BC-123] Description courte`
- Description: Template avec contexte, changements, tests, screenshots

---

## ONBOARDING DES NOUVEAUX MEMBRES

### Checklist d'Onboarding

#### Jour 1: Accès et Configuration
- [ ] Accès GitHub (repository)
- [ ] Accès Slack/Discord
- [ ] Accès Notion/Confluence
- [ ] Configuration de l'environnement local
- [ ] Clonage du repository
- [ ] Installation des dépendances
- [ ] Lancement de l'application en local

#### Jour 2-3: Découverte du Projet
- [ ] Lecture du README.md
- [ ] Lecture de ARCHITECTURE.md
- [ ] Lecture de CONTRIBUTING.md
- [ ] Lecture de cet audit (AUDIT_MANUS_2025.md)
- [ ] Exploration du code
- [ ] Questions et clarifications

#### Jour 4-5: Première Tâche
- [ ] Assignation d'une tâche simple (Good First Issue)
- [ ] Développement
- [ ] Tests
- [ ] Pull Request
- [ ] Code review
- [ ] Merge

#### Semaine 2: Intégration
- [ ] Participation aux cérémonies Scrum
- [ ] Assignation de tâches normales
- [ ] Collaboration avec l'équipe
- [ ] Feedback et ajustements

---

## ÉVOLUTION DE L'ÉQUIPE

### Court Terme (0-3 mois)

**Équipe minimale:**
- Manus AI (Project Manager / Tech Lead)
- Backend Developer (1)
- Frontend Developer (1)

**Total:** 3 personnes

### Moyen Terme (3-6 mois)

**Équipe étendue:**
- Manus AI (Project Manager / Tech Lead)
- Backend Developer (1)
- Frontend Developer (1)
- QA Engineer (1)

**Total:** 4 personnes

### Long Terme (6-12 mois)

**Équipe complète:**
- Manus AI (Project Manager / Tech Lead)
- Backend Developer (2)
- Frontend Developer (2)
- UI/UX Designer (1)
- QA Engineer (1)

**Total:** 7 personnes

---

## BUDGET ET RESSOURCES

### Estimation des Coûts (France, 2025)

| Rôle | Taux Journalier | Jours/Sprint | Coût/Sprint |
|------|-----------------|--------------|-------------|
| Project Manager / Tech Lead | Inclus (Manus AI) | 10 | €0 |
| Backend Developer | €500-700 | 10 | €5,000-7,000 |
| Frontend Developer | €500-700 | 10 | €5,000-7,000 |
| UI/UX Designer (optionnel) | €400-600 | 5 | €2,000-3,000 |
| QA Engineer (optionnel) | €400-600 | 5 | €2,000-3,000 |

**Équipe minimale (Backend + Frontend):** €10,000-14,000 / sprint (2 semaines)

**Équipe complète (avec UI/UX + QA):** €14,000-20,000 / sprint (2 semaines)

### Ressources Nécessaires

**Outils (coûts mensuels estimés):**
- GitHub Team: €4/utilisateur/mois
- Vercel Pro: €20/mois
- Railway: Variable selon usage (~€50-200/mois)
- Neon: Gratuit (Launch plan) ou €19/mois (Scale)
- Sentry: €26/mois (Team plan)
- UptimeRobot: Gratuit (50 monitors)
- Slack: Gratuit ou €6.67/utilisateur/mois
- Figma: €12/utilisateur/mois

**Total outils:** ~€150-300/mois

---

## CONCLUSION

Cette définition des rôles établit une base solide pour l'équipe de développement de **BilanCompetence.AI**. La structure proposée est **scalable** et peut évoluer en fonction des besoins du projet et du budget disponible.

**Prochaines étapes:**
1. Valider cette proposition avec le Product Owner
2. Lancer le recrutement des développeurs
3. Configurer les outils de collaboration
4. Démarrer le Sprint 1

---

**Document créé par:** Manus AI  
**Date:** 6 novembre 2025  
**Version:** 1.0
