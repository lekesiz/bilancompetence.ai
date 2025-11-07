# Instructions Finales - Exécution des Migrations Supabase

**Date:** 25 octobre 2025  
**Projet:** BilanCompetence.AI  
**Statut:** ✅ Code prêt, migrations à exécuter

---

## 🎯 Objectif

Exécuter 3 migrations SQL sur Supabase pour activer les fonctionnalités AI et les tests psychométriques (MBTI/RIASEC).

---

## ✅ État Actuel

### Code
- ✅ Toutes les corrections poussées vers GitHub
- ✅ Backend Railway en cours de redéploiement
- ✅ Frontend Vercel déployé et fonctionnel
- ✅ Middleware d'autorisation créé

### Migrations à Exécuter
- ⏳ Migration 020: Tables AI (4 tables)
- ⏳ Migration 021: Questions MBTI (60 questions)
- ⏳ Migration 022: Questions RIASEC (48 questions)

---

## 📋 Migrations à Exécuter

### Migration 020: Tables AI

**Fichier:** `apps/backend/migrations/020_create_ai_tables.sql`

**Contenu:** Crée 4 tables pour les fonctionnalités AI
1. `cv_analyses` - Analyses de CV par IA
2. `job_recommendations` - Recommandations d'emploi
3. `personality_analyses` - Résultats MBTI/RIASEC
4. `action_plans` - Plans d'action professionnels

**Temps d'exécution:** ~5 secondes

---

### Migration 021: Questions MBTI

**Fichier:** `apps/backend/migrations/021_seed_mbti_questions.sql`

**Contenu:** Insère 60 questions MBTI
- 15 questions pour E/I (Extraversion/Introversion)
- 15 questions pour S/N (Sensing/Intuition)
- 15 questions pour T/F (Thinking/Feeling)
- 15 questions pour J/P (Judging/Perceiving)

**Temps d'exécution:** ~10 secondes

---

### Migration 022: Questions RIASEC

**Fichier:** `apps/backend/migrations/022_seed_riasec_questions.sql`

**Contenu:** Insère 48 questions RIASEC
- 8 questions pour R (Réaliste)
- 8 questions pour I (Investigateur)
- 8 questions pour A (Artistique)
- 8 questions pour S (Social)
- 8 questions pour E (Entreprenant)
- 8 questions pour C (Conventionnel)

**Temps d'exécution:** ~10 secondes

---

## 🚀 Méthode 1: Via Supabase SQL Editor (RECOMMANDÉ)

### Étape 1: Accéder au SQL Editor

1. Aller sur https://app.supabase.com/project/pesteyhjdfmyrkvpofud/sql/new
2. Vous serez connecté automatiquement (session déjà active)

### Étape 2: Exécuter Migration 020

1. Cliquer sur "New query" ou utiliser l'éditeur existant
2. Copier le contenu de `apps/backend/migrations/020_create_ai_tables.sql`
3. Coller dans l'éditeur SQL
4. Cliquer sur "Run" (ou Ctrl+Enter)
5. Vérifier qu'il n'y a pas d'erreur dans les résultats
6. Sauvegarder la requête (optionnel) : "Save" → "Migration 020 - AI Tables"

### Étape 3: Exécuter Migration 021

1. Créer une nouvelle requête : "New query"
2. Copier le contenu de `apps/backend/migrations/021_seed_mbti_questions.sql`
3. Coller dans l'éditeur SQL
4. Cliquer sur "Run" (ou Ctrl+Enter)
5. Vérifier qu'il n'y a pas d'erreur
6. Sauvegarder : "Save" → "Migration 021 - MBTI Questions"

### Étape 4: Exécuter Migration 022

1. Créer une nouvelle requête : "New query"
2. Copier le contenu de `apps/backend/migrations/022_seed_riasec_questions.sql`
3. Coller dans l'éditeur SQL
4. Cliquer sur "Run" (ou Ctrl+Enter)
5. Vérifier qu'il n'y a pas d'erreur
6. Sauvegarder : "Save" → "Migration 022 - RIASEC Questions"

### Étape 5: Vérifier les Résultats

Exécuter cette requête pour vérifier que tout est bien créé :

```sql
-- Vérifier les tables AI
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('cv_analyses', 'job_recommendations', 'personality_analyses', 'action_plans');

-- Vérifier les questions MBTI
SELECT COUNT(*) as mbti_count 
FROM assessment_questions 
WHERE section = 'mbti_personality';

-- Vérifier les questions RIASEC
SELECT COUNT(*) as riasec_count 
FROM assessment_questions 
WHERE section = 'riasec_interests';
```

**Résultats attendus:**
- 4 tables AI
- 60 questions MBTI
- 48 questions RIASEC

---

## 🔧 Méthode 2: Via Script Node.js (ALTERNATIVE)

Si vous préférez exécuter les migrations via un script :

### Étape 1: Configurer les Variables d'Environnement

Assurez-vous que ces variables sont définies dans `apps/backend/.env` :

```env
SUPABASE_URL=https://pesteyhjdfmyrkvpofud.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
```

### Étape 2: Exécuter le Script

```bash
cd /home/ubuntu/bilancompetence.ai/apps/backend

# Exécuter toutes les migrations
npx tsx scripts/run-migration.ts migrations/020_create_ai_tables.sql
npx tsx scripts/run-migration.ts migrations/021_seed_mbti_questions.sql
npx tsx scripts/run-migration.ts migrations/022_seed_riasec_questions.sql
```

---

## ✅ Vérification Post-Migration

### 1. Vérifier les Tables

Aller sur https://app.supabase.com/project/pesteyhjdfmyrkvpofud/editor

Vous devriez voir les nouvelles tables :
- `cv_analyses`
- `job_recommendations`
- `personality_analyses`
- `action_plans`

### 2. Vérifier les Questions

Aller sur la table `assessment_questions` et filtrer par :
- `section = 'mbti_personality'` → 60 lignes
- `section = 'riasec_interests'` → 48 lignes

### 3. Tester les Endpoints

Une fois Railway redéployé, tester les endpoints :

```bash
# Health check
curl https://web-production-60dbd.up.railway.app/health

# Récupérer les questions MBTI (nécessite authentification)
curl -H "Authorization: Bearer <token>" \
  https://web-production-60dbd.up.railway.app/api/assessments/questions?section=mbti_personality

# Récupérer les questions RIASEC (nécessite authentification)
curl -H "Authorization: Bearer <token>" \
  https://web-production-60dbd.up.railway.app/api/assessments/questions?section=riasec_interests
```

---

## 🐛 Dépannage

### Erreur: "relation does not exist"

**Cause:** La table `assessments` n'existe pas.

**Solution:** Exécuter d'abord la migration `001_create_schema.sql` qui crée la table `assessments`.

### Erreur: "duplicate key value violates unique constraint"

**Cause:** Les questions ont déjà été insérées.

**Solution:** Ignorer l'erreur ou supprimer les questions existantes avant de réexécuter :

```sql
DELETE FROM assessment_questions WHERE section IN ('mbti_personality', 'riasec_interests');
```

### Erreur: "permission denied"

**Cause:** Vous n'avez pas les droits suffisants.

**Solution:** Utiliser le rôle `postgres` dans le SQL Editor (sélectionner "postgres" dans le dropdown "Role").

---

## 📊 Résumé des Changements

### Tables Créées (Migration 020)

| Table | Colonnes Principales | Index |
|-------|---------------------|-------|
| `cv_analyses` | id, assessment_id, cv_text, analysis_result | assessment_id, analysis_result (GIN) |
| `job_recommendations` | id, assessment_id, recommendations_data | assessment_id, recommendations_data (GIN) |
| `personality_analyses` | id, assessment_id, mbti_type, riasec_scores, analysis_result | assessment_id, mbti_type, riasec_scores (GIN) |
| `action_plans` | id, assessment_id, target_job, plan_data, status | assessment_id, status, plan_data (GIN) |

### Questions Insérées

| Section | Questions | Dimensions |
|---------|-----------|------------|
| `mbti_personality` | 60 | E/I, S/N, T/F, J/P (15 chacune) |
| `riasec_interests` | 48 | R, I, A, S, E, C (8 chacune) |

---

## 🎯 Prochaines Étapes Après Migration

### 1. Tester les Fonctionnalités

- [ ] Upload de CV et analyse
- [ ] Test MBTI complet (60 questions)
- [ ] Test RIASEC complet (48 questions)
- [ ] Génération de recommandations d'emploi
- [ ] Création de plan d'action

### 2. Intégrer le Middleware d'Autorisation

Suivre le guide : `apps/backend/AUTHORIZATION_INTEGRATION_GUIDE.md`

Routes prioritaires :
- [ ] `GET /api/bilans/:id`
- [ ] `GET /api/assessments/:assessmentId`
- [ ] `GET /api/ai/analyze-cv/:analysisId`
- [ ] `GET /api/ai/personality/:analysisId`

### 3. Améliorer les Tests

- [ ] Ajouter des tests pour le scoring MBTI
- [ ] Ajouter des tests pour le scoring RIASEC
- [ ] Tester l'upload de CV avec fichiers réels
- [ ] Augmenter la couverture à 80%+

---

## 📞 Support

Si vous rencontrez des problèmes lors de l'exécution des migrations :

1. Vérifier les logs Supabase
2. Vérifier que la table `assessments` existe
3. Vérifier les permissions du rôle utilisé
4. Consulter la documentation Supabase : https://supabase.com/docs

---

## ✅ Checklist Finale

- [ ] Migration 020 exécutée (Tables AI)
- [ ] Migration 021 exécutée (Questions MBTI)
- [ ] Migration 022 exécutée (Questions RIASEC)
- [ ] Vérification des tables créées
- [ ] Vérification des questions insérées
- [ ] Test des endpoints API
- [ ] Backend Railway redéployé avec succès
- [ ] Fonctionnalités testées en production

---

**Temps total estimé:** 15-20 minutes

**Difficulté:** ⭐⭐☆☆☆ (Facile)

**Prérequis:** Accès au projet Supabase

---

**Généré le:** 25 octobre 2025 à 05:52 GMT+2  
**Par:** Manus AI Assistant  
**Version:** 1.0

