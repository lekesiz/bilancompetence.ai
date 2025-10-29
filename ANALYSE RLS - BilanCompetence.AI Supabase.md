# ANALYSE RLS - BilanCompetence.AI Supabase

**Date:** 25 Octobre 2025
**Projet:** bilancompetence-ai (njeqztsjijoarouqyuzb)

---

## RÉSUMÉ EXÉCUTIF

Sur **33 tables** dans le schéma `public`, seulement **14 ont RLS activé** (42%).

**19 tables critiques SANS RLS** (58%) - **RISQUE DE SÉCURITÉ MAJEUR** 🔴

---

## TABLES SANS RLS (rls_enabled = false)

### 🔴 PRIORITÉ CRITIQUE (Données Utilisateur Sensibles)

| # | Table | Type de Données | Risque |
|---|-------|-----------------|--------|
| 1 | `auth_sessions` | Sessions d'authentification | **CRITIQUE** - Accès non autorisé aux sessions |
| 2 | `conversations` | Messages privés utilisateurs | **CRITIQUE** - Violation de confidentialité |
| 3 | `user_sessions` | Sessions utilisateur | **CRITIQUE** - Hijacking possible |
| 4 | `user_two_factor` | Codes 2FA | **CRITIQUE** - Bypass 2FA possible |
| 5 | `cv_analyses` | Analyses de CV (données IA) | **HAUTE** - Données personnelles sensibles |
| 6 | `messages` | Messages système/utilisateur | **HAUTE** - Violation de confidentialité |

### 🟠 PRIORITÉ HAUTE (Données Métier)

| # | Table | Type de Données | Risque |
|---|-------|-----------------|--------|
| 7 | `action_plans` | Plans d'action personnalisés | **HAUTE** - Données professionnelles |
| 8 | `job_recommendations` | Recommandations d'emploi | **HAUTE** - Données professionnelles |
| 9 | `personality_analyses` | Résultats MBTI/RIASEC | **HAUTE** - Données psychométriques |
| 10 | `document_archive` | Documents archivés | **MOYENNE** - Historique documents |
| 11 | `documents` | Documents utilisateur | **MOYENNE** - Fichiers personnels |

### 🟡 PRIORITÉ MOYENNE (Audit & Logs)

| # | Table | Type de Données | Risque |
|---|-------|-----------------|--------|
| 12 | `audit_logs` | Logs d'audit système | **MOYENNE** - Traçabilité |
| 13 | `document_access_log` | Logs d'accès documents | **MOYENNE** - Traçabilité |
| 14 | `qualiopi_audit_log` | Logs audit Qualiopi | **MOYENNE** - Conformité |
| 15 | `session_analytics` | Analytiques de session | **BASSE** - Statistiques |

### 🟢 PRIORITÉ BASSE (Données Publiques/Référence)

| # | Table | Type de Données | Risque |
|---|-------|-----------------|--------|
| 16 | `mbti_questions` | Questions MBTI (statiques) | **BASSE** - Données publiques |
| 17 | `riasec_questions` | Questions RIASEC (statiques) | **BASSE** - Données publiques |
| 18 | `qualiopi_evidence` | Preuves Qualiopi | **BASSE** - Documents admin |
| 19 | `qualiopi_indicators` | Indicateurs Qualiopi | **BASSE** - Métriques |

---

## TABLES AVEC RLS ACTIVÉ ✅

| # | Table | RLS Status |
|---|-------|------------|
| 1 | `assessments` | ✅ Activé |
| 2 | `availability_slots` | ✅ Activé |
| 3 | `bilans` | ✅ Activé |
| 4 | `competencies` | ✅ Activé |
| 5 | `organization_qualiopi_status` | ✅ Activé |
| 6 | `organizations` | ✅ Activé |
| 7 | `recommendations` | ✅ Activé |
| 8 | `satisfaction_surveys` | ✅ Activé |
| 9 | `session_bookings` | ✅ Activé |
| 10 | `session_reminders` | ✅ Activé |
| 11 | `sessions` | ✅ Activé |
| 12 | `survey_responses` | ✅ Activé |
| 13 | `test_results` | ✅ Activé |
| 14 | `users` | ✅ Activé |

---

## IMPACT SÉCURITÉ

### Scénarios d'Attaque Possibles

1. **User A accède aux données de User B** via API directe
2. **Lecture de conversations privées** d'autres utilisateurs
3. **Vol de sessions** (session hijacking)
4. **Bypass 2FA** en lisant les codes d'autres utilisateurs
5. **Accès non autorisé aux CV et analyses psychométriques**

### Conformité RGPD

❌ **NON CONFORME** - Les données personnelles ne sont pas protégées au niveau base de données

---

## PLAN D'ACTION

### Phase 1: Tables Critiques (URGENT - Aujourd'hui)
- `auth_sessions`
- `conversations`
- `user_sessions`
- `user_two_factor`
- `cv_analyses`
- `messages`

### Phase 2: Tables Métier (Haute Priorité - Aujourd'hui)
- `action_plans`
- `job_recommendations`
- `personality_analyses`
- `documents`
- `document_archive`

### Phase 3: Audit & Logs (Moyenne Priorité - Demain)
- `audit_logs`
- `document_access_log`
- `qualiopi_audit_log`
- `session_analytics`

### Phase 4: Données Publiques (Basse Priorité - Optionnel)
- `mbti_questions`
- `riasec_questions`
- `qualiopi_evidence`
- `qualiopi_indicators`

---

## PROCHAINES ÉTAPES

1. ✅ Créer migration SQL pour activer RLS sur tables critiques
2. ✅ Définir politiques RLS "users can only access their own data"
3. ✅ Tester les politiques avec 2 utilisateurs différents
4. ✅ Déployer sur Supabase
5. ✅ Vérifier que les 36 issues disparaissent


