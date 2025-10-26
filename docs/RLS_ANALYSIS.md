# 🔒 RLS (Row Level Security) Analysis Report

**Date:** 25 Octobre 2025  
**Project:** BilanCompetence.AI  
**Database:** Neon PostgreSQL

---

## 📊 Executive Summary

Cette analyse identifie **32 tables** dans le projet BilanCompetence.AI et évalue leur statut RLS actuel basé sur les fichiers de migration existants.

**Statut Global:**
- ✅ **19 tables** ont RLS activé avec politiques (59%)
- ⚠️ **13 tables** n'ont PAS de RLS activé (41%)

---

## 📋 Liste Complète des Tables

### Backend Migrations (apps/backend/migrations/)

| # | Table | RLS Activé | Politiques Définies | Priorité |
|---|-------|------------|---------------------|----------|
| 1 | `users` | ✅ Oui | Partiel (SELECT only) | 🔴 CRITIQUE |
| 2 | `organizations` | ❌ Non | Aucune | 🔴 CRITIQUE |
| 3 | `bilans` | ✅ Oui | Partiel (SELECT only) | 🔴 CRITIQUE |
| 4 | `competencies` | ✅ Oui | Aucune détaillée | 🟡 HAUTE |
| 5 | `recommendations` | ❌ Non | Aucune | 🟡 HAUTE |
| 6 | `documents` | ✅ Oui (024) | SELECT/INSERT/UPDATE/DELETE | 🟡 HAUTE |
| 7 | `messages` | ✅ Oui (001 + 024) | SELECT/INSERT/UPDATE/DELETE | 🟡 HAUTE |
| 8 | `sessions` | ❌ Non | Aucune | 🟡 HAUTE |
| 9 | `audit_logs` | ✅ Oui (024) | SELECT (users + admins) | 🟢 MOYENNE |
| 10 | `action_plans` | ✅ Oui (024) | SELECT/INSERT/UPDATE/DELETE | 🟡 HAUTE |
| 11 | `assessment_competencies` | ❌ Non | Aucune | 🟡 HAUTE |
| 12 | `assessment_drafts` | ❌ Non | Aucune | 🟡 HAUTE |
| 13 | `assessments` | ❌ Non | Aucune | 🔴 CRITIQUE |
| 14 | `availability_slots` | ❌ Non | Aucune | 🟢 MOYENNE |
| 15 | `cv_analyses` | ✅ Oui (024) | SELECT/INSERT/UPDATE/DELETE | 🟡 HAUTE |
| 16 | `document_access_log` | ✅ Oui (024) | SELECT only | 🟢 MOYENNE |
| 17 | `document_archive` | ✅ Oui (024) | SELECT/INSERT/UPDATE/DELETE | 🟡 HAUTE |
| 18 | `job_recommendations` | ✅ Oui (024) | SELECT/INSERT/UPDATE/DELETE | 🟡 HAUTE |
| 19 | `organization_qualiopi_status` | ❌ Non | Aucune | 🟡 HAUTE |
| 20 | `personality_analyses` | ✅ Oui (024) | SELECT/INSERT/UPDATE/DELETE | 🟡 HAUTE |
| 21 | `qualiopi_audit_log` | ✅ Oui (024) | ADMIN only | 🟢 MOYENNE |
| 22 | `qualiopi_evidence` | ✅ Oui (024) | ADMIN only | 🟢 MOYENNE |
| 23 | `qualiopi_indicators` | ✅ Oui (024) | ADMIN only | 🟢 MOYENNE |
| 24 | `satisfaction_surveys` | ❌ Non | Aucune | 🟡 HAUTE |
| 25 | `session_analytics` | ✅ Oui (024) | SELECT only | 🟢 MOYENNE |
| 26 | `session_bookings` | ❌ Non | Aucune | 🟡 HAUTE |
| 27 | `session_reminders` | ❌ Non | Aucune | 🟢 BASSE |
| 28 | `survey_responses` | ❌ Non | Aucune | 🟡 HAUTE |

### Supabase Migrations (supabase/migrations/)

| # | Table | RLS Activé | Politiques Définies | Priorité |
|---|-------|------------|---------------------|----------|
| 29 | `user_two_factor` | ✅ Oui (security) | SELECT/INSERT/UPDATE/DELETE | 🔴 CRITIQUE |
| 30 | `user_sessions` | ✅ Oui (security) | SELECT/INSERT/UPDATE/DELETE | 🔴 CRITIQUE |
| 31 | `conversations` | ✅ Oui (024 + security) | SELECT/INSERT/UPDATE | 🟡 HAUTE |
| 32 | `auth_sessions` | ✅ Oui (024) | ALL operations | 🔴 CRITIQUE |

### Tables de Questions (Read-Only Public)

| # | Table | RLS Activé | Politiques Définies | Priorité |
|---|-------|------------|---------------------|----------|
| 33 | `mbti_questions` | ✅ Oui (024) | SELECT (authenticated) | 🟢 BASSE |
| 34 | `riasec_questions` | ✅ Oui (024) | SELECT (authenticated) | 🟢 BASSE |

---

## ⚠️ Tables Sans RLS (13 tables)

### 🔴 Priorité CRITIQUE (3 tables)

1. **`users`** - RLS activé mais politiques incomplètes
   - Problème: Seulement SELECT policy, pas INSERT/UPDATE/DELETE
   - Impact: Utilisateurs peuvent potentiellement modifier d'autres profils
   - Action: Ajouter politiques complètes (INSERT, UPDATE, DELETE)

2. **`organizations`** - Aucun RLS
   - Problème: Données d'organisation accessibles publiquement
   - Impact: Fuite d'informations sensibles (SIRET, Stripe IDs)
   - Action: Activer RLS + politiques role-based

3. **`assessments`** - Aucun RLS
   - Problème: Évaluations accessibles sans restriction
   - Impact: Violation RGPD, accès non autorisé aux données personnelles
   - Action: Activer RLS + politiques basées sur user_id

### 🟡 Priorité HAUTE (9 tables)

4. **`recommendations`** - Aucun RLS
5. **`sessions`** - Aucun RLS
6. **`assessment_competencies`** - Aucun RLS
7. **`assessment_drafts`** - Aucun RLS
8. **`organization_qualiopi_status`** - Aucun RLS
9. **`satisfaction_surveys`** - Aucun RLS
10. **`session_bookings`** - Aucun RLS
11. **`survey_responses`** - Aucun RLS
12. **`bilans`** - RLS activé mais politiques incomplètes (SELECT only)

### 🟢 Priorité MOYENNE/BASSE (1 table)

13. **`availability_slots`** - Aucun RLS (peut rester public)
14. **`session_reminders`** - Aucun RLS (notifications système)

---

## 🎯 Stratégie RLS par Type de Table

### Type 1: Tables Utilisateur (User-Owned Data)

**Principe:** L'utilisateur ne peut accéder qu'à ses propres données.

**Tables concernées:**
- `users` (self-profile)
- `documents`
- `document_archive`
- `cv_analyses`
- `user_two_factor`
- `user_sessions`

**Politique Standard:**
```sql
CREATE POLICY "Users can access their own data"
ON table_name
FOR ALL
USING (user_id = auth.uid());
```

### Type 2: Tables Assessment (Assessment-Owned Data)

**Principe:** L'utilisateur peut accéder aux données liées à ses assessments.

**Tables concernées:**
- `assessments`
- `assessment_competencies`
- `assessment_drafts`
- `action_plans`
- `job_recommendations`
- `personality_analyses`
- `survey_responses`

**Politique Standard:**
```sql
CREATE POLICY "Users can access their assessment data"
ON table_name
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = table_name.assessment_id
    AND assessments.user_id = auth.uid()
  )
);
```

### Type 3: Tables Bilan (Multi-Role Access)

**Principe:** Bénéficiaire, Consultant, et Org Admin peuvent accéder selon leur rôle.

**Tables concernées:**
- `bilans`
- `competencies`
- `recommendations`
- `sessions`
- `session_bookings`

**Politique Standard:**
```sql
CREATE POLICY "Users can access bilans they're involved with"
ON table_name
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bilans
    WHERE bilans.id = table_name.bilan_id
    AND (
      bilans.beneficiary_id = auth.uid()
      OR bilans.consultant_id = auth.uid()
      OR bilans.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
);
```

### Type 4: Tables Organization (Org-Scoped Data)

**Principe:** Seuls les membres de l'organisation peuvent accéder.

**Tables concernées:**
- `organizations`
- `organization_qualiopi_status`
- `satisfaction_surveys`

**Politique Standard:**
```sql
CREATE POLICY "Org members can access org data"
ON table_name
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('ORG_ADMIN', 'ADMIN')
  )
);
```

### Type 5: Tables Admin-Only

**Principe:** Seuls les ADMINs peuvent accéder.

**Tables concernées:**
- `qualiopi_audit_log`
- `qualiopi_evidence`
- `qualiopi_indicators`
- `audit_logs` (lecture pour tous, écriture admin)

**Politique Standard:**
```sql
CREATE POLICY "Only admins can access"
ON table_name
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);
```

### Type 6: Tables Public Read-Only

**Principe:** Tous les utilisateurs authentifiés peuvent lire, seuls admins peuvent modifier.

**Tables concernées:**
- `mbti_questions`
- `riasec_questions`
- `availability_slots` (optionnel)

**Politique Standard:**
```sql
CREATE POLICY "Authenticated users can read"
ON table_name
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify"
ON table_name
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'ADMIN'
  )
);
```

---

## 📝 Prochaines Étapes

### Phase 1: Tables Critiques (Priorité 🔴)

1. ✅ Compléter RLS sur `users` (INSERT, UPDATE, DELETE policies)
2. ✅ Activer RLS sur `organizations`
3. ✅ Activer RLS sur `assessments`

### Phase 2: Tables Haute Priorité (Priorité 🟡)

4. ✅ Activer RLS sur `recommendations`
5. ✅ Activer RLS sur `sessions`
6. ✅ Activer RLS sur `assessment_competencies`
7. ✅ Activer RLS sur `assessment_drafts`
8. ✅ Activer RLS sur `session_bookings`
9. ✅ Activer RLS sur `survey_responses`
10. ✅ Compléter RLS sur `bilans` (INSERT, UPDATE, DELETE)

### Phase 3: Tables Moyenne Priorité (Priorité 🟢)

11. ✅ Activer RLS sur `organization_qualiopi_status`
12. ✅ Activer RLS sur `satisfaction_surveys`
13. ⚪ Évaluer si `availability_slots` doit rester public
14. ⚪ Évaluer si `session_reminders` nécessite RLS

---

## 🔍 Méthode de Vérification

Pour vérifier le statut RLS dans Supabase:

```sql
-- Lister toutes les tables et leur statut RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Compter les tables sans RLS
SELECT 
    COUNT(*) as tables_without_rls
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Lister les politiques RLS existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 📊 Statistiques

- **Total Tables:** 34
- **RLS Activé:** 19 (56%)
- **RLS Manquant:** 15 (44%)
- **Priorité Critique:** 3 tables
- **Priorité Haute:** 9 tables
- **Priorité Moyenne/Basse:** 3 tables

---

**Rapport généré le:** 25 Octobre 2025  
**Auteur:** Manus AI  
**Version:** 1.0

