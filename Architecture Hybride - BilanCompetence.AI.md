# Architecture Hybride - BilanCompetence.AI

**Date:** 6 novembre 2025  
**Version:** 1.0  
**Statut:** IMPLÉMENTÉ

---

## RÉSUMÉ EXÉCUTIF

Le projet BilanCompetence.AI utilise une **architecture hybride** pour optimiser les coûts, la performance et la maintenabilité:

- **Base de données:** Neon PostgreSQL (serverless, auto-scaling)
- **Storage:** Supabase Storage (temporaire, migration future vers S3/R2)

---

## ARCHITECTURE ACTUELLE

### Composants

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                        │
│                      Next.js 14                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Railway)                         │
│                    Express.js                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          SERVICES (12 total)                        │  │
│  │                                                     │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  DB ONLY (8 services) → Neon PostgreSQL     │  │  │
│  │  │  - csvService                                │  │  │
│  │  │  - notificationService                       │  │  │
│  │  │  - webhookHandlers                           │  │  │
│  │  │  - psychometricScoringService                │  │  │
│  │  │  - authFlowServiceNeon                       │  │  │
│  │  │  - ssoService                                │  │  │
│  │  │  - twoFactorService                          │  │  │
│  │  │  - franceTravailService                      │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  HYBRID (4 services) → Neon + Supabase      │  │  │
│  │  │  - complianceReportService                   │  │  │
│  │  │  - satisfactionSurveyService                 │  │  │
│  │  │  - documentArchiveService                    │  │  │
│  │  │  - qualioptService                           │  │  │
│  │  │                                              │  │  │
│  │  │  DB queries → Neon PostgreSQL                │  │  │
│  │  │  File storage → Supabase Storage             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────┬──────────────────┘
               │                          │
               ▼                          ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │  Neon PostgreSQL     │   │  Supabase Storage    │
    │  (Primary DB)        │   │  (Temporary)         │
    │  - 28 tables         │   │  - PDF reports       │
    │  - PostgreSQL 17     │   │  - Documents         │
    │  - Serverless        │   │  - Archives          │
    │  - Auto-scaling      │   │  - Evidence files    │
    └──────────────────────┘   └──────────────────────┘
```

---

## SERVICES PAR CATÉGORIE

### Services 100% Neon (8/12 - 67%)

Ces services n'utilisent **que** Neon PostgreSQL pour toutes leurs opérations.

#### 1. csvService.ts
- **Fonction:** Export CSV des données
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** SELECT pour export

#### 2. notificationService.ts
- **Fonction:** Gestion des notifications utilisateurs
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** INSERT, UPDATE, SELECT, DELETE

#### 3. webhookHandlers.ts
- **Fonction:** Webhooks Stripe (paiements, abonnements)
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** INSERT, UPDATE pour payments, subscriptions, invoices

#### 4. psychometricScoringService.ts
- **Fonction:** Calculs MBTI et RIASEC
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** SELECT pour questions, INSERT pour résultats

#### 5. authFlowServiceNeon.ts
- **Fonction:** Authentification et gestion des sessions
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** INSERT, UPDATE, SELECT pour users, sessions

#### 6. ssoService.ts
- **Fonction:** Single Sign-On (Google, Microsoft)
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** INSERT, UPDATE pour OAuth users

#### 7. twoFactorService.ts
- **Fonction:** Authentification 2FA (TOTP)
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** INSERT, UPDATE, SELECT, DELETE pour 2FA secrets

#### 8. franceTravailService.ts
- **Fonction:** Intégration API France Travail
- **DB:** Neon PostgreSQL ✅
- **Storage:** N/A
- **Requêtes:** INSERT, SELECT pour job recommendations, saved jobs

---

### Services Hybrides (4/12 - 33%)

Ces services utilisent **Neon pour la DB** et **Supabase pour le Storage**.

#### 9. complianceReportService.ts
- **Fonction:** Génération de rapports Qualiopi
- **DB:** Neon PostgreSQL ✅
- **Storage:** Supabase Storage ⚠️
- **Raison hybride:** Génération de PDF, stockage de rapports
- **Migration future:** AWS S3 ou Cloudflare R2

#### 10. satisfactionSurveyService.ts
- **Fonction:** Enquêtes de satisfaction
- **DB:** Neon PostgreSQL ✅
- **Storage:** Supabase Storage ⚠️
- **Raison hybride:** Stockage des réponses PDF, exports
- **Migration future:** AWS S3 ou Cloudflare R2

#### 11. documentArchiveService.ts
- **Fonction:** Archivage de documents
- **DB:** Neon PostgreSQL ✅
- **Storage:** Supabase Storage ⚠️
- **Raison hybride:** Stockage de documents, archives ZIP
- **Migration future:** AWS S3 ou Cloudflare R2

#### 12. qualioptService.ts
- **Fonction:** Gestion des indicateurs Qualiopi
- **DB:** Neon PostgreSQL ✅
- **Storage:** Supabase Storage ⚠️
- **Raison hybride:** Stockage des preuves (PDF, images)
- **Migration future:** AWS S3 ou Cloudflare R2

---

## VARIABLES D'ENVIRONNEMENT

### Neon PostgreSQL (Toujours requis)

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_SWnEQIOXU83Y@ep-shy-waterfall-ahr8f8tp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_PROJECT_ID=delicate-recipe-65517628
```

### Supabase (Requis uniquement pour Storage)

```env
# Supabase Storage (temporary, for compliance services)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_KEY=your-anon-key
```

**Note:** Les variables Supabase sont **uniquement** utilisées pour le Storage, **pas pour la DB**.

---

## DÉPENDANCES NPM

### Requises

```json
{
  "dependencies": {
    "pg": "^8.11.3",                    // Neon PostgreSQL client
    "@supabase/supabase-js": "^2.39.0"  // Supabase Storage only
  }
}
```

**Note:** `@supabase/supabase-js` est conservé **uniquement** pour le Storage.

---

## AVANTAGES DE L'ARCHITECTURE HYBRIDE

### 1. Performance

- **Neon:** Serverless, auto-scaling, faible latence
- **Supabase Storage:** CDN global, rapide pour les fichiers

### 2. Coûts

- **Neon:** Pay-per-use, pas de coûts fixes
- **Supabase Storage:** Gratuit jusqu'à 1GB, puis $0.021/GB

### 3. Maintenabilité

- **Séparation des préoccupations:** DB vs Storage
- **Migration progressive:** Pas de big bang
- **Rollback facile:** En cas de problème

### 4. Flexibilité

- **Migration Storage future:** Vers AWS S3, Cloudflare R2, etc.
- **Pas de vendor lock-in:** PostgreSQL standard

---

## INCONVÉNIENTS ET RISQUES

### 1. Complexité

- **Deux fournisseurs:** Neon + Supabase
- **Deux SDKs:** pg + @supabase/supabase-js
- **Deux configurations:** DATABASE_URL + SUPABASE_URL

**Mitigation:** Documentation claire, variables d'environnement bien nommées

### 2. Coûts

- **Double facturation:** Neon + Supabase
- **Coûts Storage Supabase:** Peuvent augmenter

**Mitigation:** Migrer vers S3/R2 à moyen terme (40h de travail)

### 3. Maintenance

- **Deux services à surveiller:** Neon + Supabase
- **Deux points de défaillance:** DB + Storage

**Mitigation:** Monitoring et alertes sur les deux services

---

## PLAN DE MIGRATION FUTURE

### Phase 1: Architecture Hybride (ACTUEL)

- ✅ DB: Neon PostgreSQL
- ⚠️ Storage: Supabase Storage

**Durée:** Immédiat  
**Coût:** Minimal

### Phase 2: Migration Storage vers S3/R2 (FUTUR)

- ✅ DB: Neon PostgreSQL
- ✅ Storage: AWS S3 ou Cloudflare R2

**Durée:** 40 heures de développement  
**Coût:** ~€3,000-4,000 (développement)

**Étapes:**
1. Choisir le provider (S3 vs R2)
2. Configurer les buckets
3. Migrer les 4 services compliance
4. Migrer les fichiers existants
5. Tester et valider
6. Supprimer Supabase Storage

**Timing recommandé:** Après stabilisation du projet (3-6 mois)

---

## MONITORING

### Métriques à Surveiller

#### Neon PostgreSQL

- **Connexions actives:** < 100
- **Latence des requêtes:** < 50ms (p95)
- **Taille de la DB:** < 10GB (gratuit)
- **Nombre de requêtes:** < 1M/mois (gratuit)

#### Supabase Storage

- **Stockage utilisé:** < 1GB (gratuit)
- **Bande passante:** < 2GB/mois (gratuit)
- **Nombre de fichiers:** < 10,000

### Alertes

- ⚠️ **Neon:** Si connexions > 80
- ⚠️ **Neon:** Si latence > 100ms
- ⚠️ **Supabase:** Si stockage > 800MB
- 🔴 **Neon:** Si DB down
- 🔴 **Supabase:** Si Storage down

---

## CODE EXAMPLES

### Service 100% Neon

```typescript
// csvService.ts - 100% Neon
import { pool } from '../config/neon.js';

export async function exportUsers() {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
}
```

### Service Hybride

```typescript
// documentArchiveService.ts - Hybrid
import { pool } from '../config/neon.js';
import { createClient } from '@supabase/supabase-js';

// HYBRID ARCHITECTURE: DB queries use Neon, Storage uses Supabase
export class DocumentArchiveService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // DB query → Neon
  async getDocuments(userId: string) {
    const result = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  // File storage → Supabase
  async uploadDocument(file: File, userId: string) {
    const { data, error } = await this.supabase.storage
      .from('documents')
      .upload(`${userId}/${file.name}`, file);
    
    if (error) throw error;
    return data;
  }
}
```

---

## TESTS

### Tests Unitaires

```typescript
// Test avec Neon
describe('csvService', () => {
  it('should export users from Neon', async () => {
    const users = await exportUsers();
    expect(users).toBeInstanceOf(Array);
  });
});

// Test avec Supabase Storage
describe('documentArchiveService', () => {
  it('should upload file to Supabase Storage', async () => {
    const service = new DocumentArchiveService('org-123');
    const file = new File(['test'], 'test.pdf');
    const result = await service.uploadDocument(file, 'user-123');
    expect(result).toBeDefined();
  });
});
```

---

## FAQ

### Q: Pourquoi une architecture hybride?

**R:** Pour migrer progressivement sans casser les fonctionnalités existantes. Migration Storage vers S3/R2 = 40h de travail supplémentaire.

### Q: Quand migrer vers S3/R2?

**R:** Après stabilisation du projet (3-6 mois). Pas urgent.

### Q: Quels sont les coûts?

**R:**
- **Neon:** Gratuit jusqu'à 10GB DB, puis $19/mois
- **Supabase Storage:** Gratuit jusqu'à 1GB, puis $0.021/GB
- **Total actuel:** ~$0-20/mois

### Q: Est-ce sécurisé?

**R:** Oui, les deux services sont sécurisés:
- **Neon:** SSL/TLS, encryption at rest
- **Supabase:** Row-level security, encryption

### Q: Peut-on rollback?

**R:** Oui, facilement. Les services hybrides peuvent revenir à 100% Supabase si nécessaire.

---

## CONCLUSION

L'architecture hybride est une **solution pragmatique** qui permet de:

1. ✅ Migrer rapidement la DB vers Neon (8h au lieu de 48h)
2. ✅ Préserver les fonctionnalités Storage existantes
3. ✅ Réduire les coûts (Neon serverless)
4. ✅ Améliorer les performances (Neon auto-scaling)
5. ⏳ Migrer le Storage plus tard (40h de travail)

**Recommandation:** Garder cette architecture pendant 3-6 mois, puis migrer vers S3/R2.

---

**Dernière mise à jour:** 6 novembre 2025  
**Auteur:** Manus AI  
**Version:** 1.0
