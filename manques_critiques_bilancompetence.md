# Manques Critiques - Projet BilanCompetence.AI

**Date :** 25 octobre 2025  
**Analysé par :** Manus AI  
**Priorité :** 🔴 CRITIQUE

---

## Résumé Exécutif

Après une analyse approfondie du code frontend et backend, **7 manques critiques** ont été identifiés qui empêchent le fonctionnement complet de la plateforme en production.

---

## 1. 🔴 Tests Psychométriques MBTI/RIASEC Incomplets

### Problème

Les pages des tests MBTI et RIASEC existent dans le frontend, mais **aucune question n'est présente dans la base de données**.

**Fichiers concernés :**
- `/apps/frontend/app/(protected)/dashboard/beneficiaire/tests/[assessmentId]/mbti/page.tsx`
- `/apps/frontend/app/(protected)/dashboard/beneficiaire/tests/[assessmentId]/riasec/page.tsx`

**Migrations manquantes :**
- ❌ Aucune migration pour les questions MBTI
- ❌ Aucune migration pour les questions RIASEC
- ❌ Aucune migration pour le scoring des tests

### Impact

- ✅ Les pages se chargent
- ❌ Aucune question à afficher
- ❌ Impossible de passer les tests
- ❌ Impossible de calculer les résultats

### Solution Requise

**Créer 2 nouvelles migrations :**

1. **`020_seed_mbti_questions.sql`** - 60-70 questions MBTI
2. **`021_seed_riasec_questions.sql`** - 48 questions RIASEC (8 par dimension)

**Créer 2 nouveaux services :**

1. **`mbtiScoringService.ts`** - Calcul du type MBTI (16 types)
2. **`riasecScoringService.ts`** - Calcul des scores RIASEC (6 dimensions)

**Estimation :** 2-3 jours de développement

---

## 2. 🔴 Analyse de CV par IA - Upload de Fichier Manquant

### Problème

Le frontend envoie un **fichier PDF/DOC** via FormData, mais le backend attend du **texte brut** (`cv_text`).

**Code frontend (ligne 59) :**
```typescript
const formData = new FormData();
formData.append('cv', file);

const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/analyze-cv`, {
  method: 'POST',
  body: formData,
});
```

**Code backend attendu (ligne 17) :**
```typescript
const { cv_text, assessment_id } = req.body;
```

### Impact

- ✅ La page d'upload fonctionne
- ❌ Le fichier n'est jamais traité
- ❌ L'analyse échoue systématiquement
- ✅ Le fallback en mode démo fonctionne

### Solution Requise

**Modifier `/apps/backend/src/routes/ai.ts` :**

1. Ajouter `multer` pour gérer l'upload de fichiers
2. Ajouter une bibliothèque d'extraction de texte :
   - `pdf-parse` pour les PDF
   - `mammoth` pour les fichiers Word
3. Extraire le texte du fichier uploadé
4. Passer le texte à l'API Gemini

**Exemple de code :**
```typescript
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-cv', authenticateToken, upload.single('cv'), async (req, res) => {
  const file = req.file;
  
  let cv_text = '';
  if (file.mimetype === 'application/pdf') {
    const pdfData = await pdfParse(file.buffer);
    cv_text = pdfData.text;
  } else if (file.mimetype.includes('word')) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    cv_text = result.value;
  }
  
  // Continue with existing logic...
});
```

**Estimation :** 1 jour de développement

---

## 3. 🔴 Tables de Base de Données Manquantes pour l'IA

### Problème

Les routes AI tentent d'insérer des données dans des tables qui **n'existent pas** dans le schéma de base de données.

**Tables manquantes :**
1. `cv_analyses` (ligne 54 de `ai.ts`)
2. `job_recommendations` (ligne 109 de `ai.ts`)
3. `personality_analyses` (ligne 157 de `ai.ts`)
4. `action_plans` (ligne 223 de `ai.ts`)

### Impact

- ✅ Les appels API fonctionnent
- ❌ Les résultats ne sont jamais sauvegardés
- ❌ Impossible de consulter l'historique
- ❌ Erreurs SQL en production

### Solution Requise

**Créer une nouvelle migration : `022_create_ai_tables.sql`**

```sql
-- Table pour les analyses de CV
CREATE TABLE IF NOT EXISTS cv_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  cv_text TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les recommandations d'emploi
CREATE TABLE IF NOT EXISTS job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  recommendations_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les analyses de personnalité
CREATE TABLE IF NOT EXISTS personality_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  mbti_type VARCHAR(4),
  riasec_scores JSONB,
  analysis_result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les plans d'action
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  target_job VARCHAR(255) NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_cv_analyses_assessment ON cv_analyses(assessment_id);
CREATE INDEX idx_job_recommendations_assessment ON job_recommendations(assessment_id);
CREATE INDEX idx_personality_analyses_assessment ON personality_analyses(assessment_id);
CREATE INDEX idx_action_plans_assessment ON action_plans(assessment_id);
```

**Estimation :** 2 heures de développement

---

## 4. 🔴 149 Tests Échoués (34.2%)

### Problème

**Test Suite Summary :**
- ✅ 286 tests passent (65.6%)
- ❌ 149 tests échouent (34.2%)
- ⏭️ 1 test ignoré (0.2%)
- **Total :** 436 tests

### Problèmes Identifiés

#### A. `schedulingService.spec.ts` - Import Vitest au lieu de Jest

**Erreur :**
```
Cannot find module 'vitest' from 'src/__tests__/services/schedulingService.spec.ts'
```

**Ligne 5 :**
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
```

**Solution :**
```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
```

---

#### B. `recommendations.integration.test.ts` - Mocks Incorrects

**Erreur :**
```
TypeError: Cannot read properties of undefined (reading 'getUserCompetencies')
```

**Cause :** Les mocks de `FranceTravailService` ne sont pas correctement initialisés.

**Solution :** Corriger le mock dans le fichier de test.

---

### Solution Requise

1. Corriger `schedulingService.spec.ts` (remplacer vitest par jest)
2. Corriger les mocks dans `recommendations.integration.test.ts`
3. Exécuter tous les tests et corriger les échecs restants

**Estimation :** 2-3 jours de développement

---

## 5. 🔴 Configuration CORS en Production

### Problème

La configuration CORS actuelle utilise une valeur par défaut qui ne fonctionne qu'en développement.

**Code actuel (`index.ts` ligne 66-68) :**
```typescript
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];
```

### Impact

- ✅ Fonctionne en développement
- ⚠️ Peut bloquer les requêtes en production si `CORS_ORIGIN` n'est pas configuré

### Solution Requise

**Vérifier que `CORS_ORIGIN` est configuré sur Railway :**

```bash
CORS_ORIGIN=https://bilancompetence.vercel.app,https://bilancompetence-git-main-lekesizs-projects.vercel.app
```

**Ou ajouter un fallback en production :**
```typescript
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://bilancompetence.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'];
```

**Estimation :** 30 minutes

---

## 6. 🔴 Gestion des Erreurs et Logging Insuffisants

### Problème

Plusieurs routes manquent de gestion d'erreurs appropriée et de logging détaillé.

**Exemples :**

1. **Routes AI** - Les erreurs Gemini ne sont pas loggées avec suffisamment de détails
2. **Routes de fichiers** - Pas de validation de taille/type de fichier
3. **Routes de paiement** - Erreurs Stripe non loggées

### Impact

- ⚠️ Difficulté de debugging en production
- ⚠️ Risque de failles de sécurité (upload de fichiers malveillants)
- ⚠️ Perte d'informations sur les erreurs

### Solution Requise

1. Ajouter un logger centralisé (Winston est déjà configuré)
2. Logger toutes les erreurs avec contexte (user_id, request_id, etc.)
3. Ajouter une validation stricte des fichiers uploadés
4. Créer un middleware de gestion d'erreurs global

**Estimation :** 1-2 jours de développement

---

## 7. 🔴 Sécurité - Autorisation Insuffisante

### Problème

Certaines routes ne vérifient pas si l'utilisateur a le droit d'accéder aux ressources demandées.

**Exemples :**

1. **`/api/assessments/:id`** - Un bénéficiaire peut-il accéder au bilan d'un autre ?
2. **`/api/users/:id`** - Un utilisateur peut-il voir le profil d'un autre ?
3. **`/api/documents/:id`** - Les documents sont-ils protégés ?

### Impact

- 🔴 **Risque de fuite de données personnelles**
- 🔴 **Non-conformité RGPD**
- 🔴 **Vulnérabilité de sécurité critique**

### Solution Requise

**Créer un middleware d'autorisation :**

```typescript
// middleware/authorization.ts
export const authorizeResourceAccess = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const resourceId = req.params.id;
    const userRole = req.user?.role;
    
    // Admin can access everything
    if (userRole === 'ORG_ADMIN') {
      return next();
    }
    
    // Check if user owns the resource
    const { data, error } = await supabase
      .from(resourceType)
      .select('beneficiary_id, consultant_id')
      .eq('id', resourceId)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Beneficiary can only access their own resources
    if (userRole === 'BENEFICIARY' && data.beneficiary_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Consultant can only access assigned resources
    if (userRole === 'CONSULTANT' && data.consultant_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};
```

**Appliquer sur toutes les routes sensibles :**
```typescript
router.get('/api/assessments/:id', 
  authenticateToken, 
  authorizeResourceAccess('bilans'),
  async (req, res) => {
    // ...
  }
);
```

**Estimation :** 2-3 jours de développement

---

## Récapitulatif des Manques Critiques

| # | Manque | Priorité | Estimation | Impact |
|---|--------|----------|------------|--------|
| 1 | Tests MBTI/RIASEC incomplets | 🔴 Critique | 2-3 jours | Fonctionnalité principale non disponible |
| 2 | Upload CV manquant | 🔴 Critique | 1 jour | Fonctionnalité AI non fonctionnelle |
| 3 | Tables AI manquantes | 🔴 Critique | 2 heures | Erreurs SQL en production |
| 4 | 149 tests échoués | 🔴 Critique | 2-3 jours | Qualité du code compromise |
| 5 | Configuration CORS | 🟠 Important | 30 min | Peut bloquer l'accès en production |
| 6 | Logging insuffisant | 🟠 Important | 1-2 jours | Difficulté de debugging |
| 7 | Autorisation insuffisante | 🔴 Critique | 2-3 jours | Faille de sécurité majeure |

**Temps total estimé :** 10-15 jours de développement

---

## Plan d'Action Recommandé

### Phase 1 : Corrections Urgentes (2-3 jours)

**Jour 1 :**
1. ✅ Créer la migration `022_create_ai_tables.sql`
2. ✅ Configurer CORS en production
3. ✅ Ajouter l'upload de fichiers CV avec extraction de texte

**Jour 2-3 :**
4. ✅ Corriger tous les tests échoués
5. ✅ Implémenter le middleware d'autorisation

### Phase 2 : Fonctionnalités Manquantes (3-4 jours)

**Jour 4-5 :**
6. ✅ Créer les migrations MBTI/RIASEC avec questions
7. ✅ Implémenter les services de scoring

**Jour 6-7 :**
8. ✅ Tester les tests psychométriques end-to-end
9. ✅ Tester l'analyse de CV end-to-end

### Phase 3 : Amélioration et Sécurisation (3-4 jours)

**Jour 8-9 :**
10. ✅ Améliorer le logging
11. ✅ Ajouter la validation des fichiers

**Jour 10 :**
12. ✅ Tests de sécurité complets
13. ✅ Documentation des corrections

---

## Fichiers à Créer/Modifier

### Nouveaux Fichiers à Créer

1. `/apps/backend/migrations/020_seed_mbti_questions.sql`
2. `/apps/backend/migrations/021_seed_riasec_questions.sql`
3. `/apps/backend/migrations/022_create_ai_tables.sql`
4. `/apps/backend/src/services/mbtiScoringService.ts`
5. `/apps/backend/src/services/riasecScoringService.ts`
6. `/apps/backend/src/middleware/authorization.ts`

### Fichiers à Modifier

1. `/apps/backend/src/routes/ai.ts` - Ajouter upload de fichiers
2. `/apps/backend/src/index.ts` - Améliorer CORS
3. `/apps/backend/src/__tests__/services/schedulingService.spec.ts` - Corriger import
4. `/apps/backend/src/__tests__/routes/recommendations.integration.test.ts` - Corriger mocks
5. Toutes les routes sensibles - Ajouter middleware d'autorisation

---

## Conclusion

Le projet BilanCompetence.AI est **bien structuré** mais présente **7 manques critiques** qui doivent être corrigés avant une mise en production complète.

**Risques si non corrigés :**
- 🔴 Failles de sécurité (accès non autorisé aux données)
- 🔴 Fonctionnalités principales non fonctionnelles (tests psychométriques, analyse CV)
- 🔴 Erreurs en production (tables manquantes, CORS)
- 🟠 Difficulté de maintenance (tests échoués, logging insuffisant)

**Recommandation :** Bloquer la mise en production jusqu'à la correction des manques critiques (priorité 🔴).

---

**Prochaine étape :** Commencer immédiatement par la Phase 1 (Corrections Urgentes)

