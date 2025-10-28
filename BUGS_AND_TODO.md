# 🐛 Bugs Détectés et Liste des Tâches - BilanCompetence.AI

**Date:** 28 octobre 2025  
**Testeur:** Tests API automatisés  
**Environnement:** Production (Railway + Vercel)  
**Comptes testés:** Admin, Consultant, Client

---

## 🔴 Bugs Critiques (Priorité 1)

### Bug #1: Incohérence des Rôles Utilisateur ⚠️ CRITIQUE

**Sévérité:** 🔴 Critique  
**Impact:** Bloque l'accès aux fonctionnalités admin Qualiopi  
**Statut:** 🔴 Non résolu

**Description:**
La base de données utilise le rôle `ORGANIZATION_ADMIN` mais le middleware d'authentification attend `ORG_ADMIN`. Cette incohérence empêche les administrateurs d'organisation d'accéder aux endpoints Qualiopi.

**Erreur retournée:**
```json
{
  "status": "error",
  "message": "Invalid token payload",
  "details": [{
    "received": "ORGANIZATION_ADMIN",
    "code": "invalid_enum_value",
    "options": ["BENEFICIARY", "CONSULTANT", "ORG_ADMIN", "ADMIN"],
    "path": ["role"],
    "message": "Invalid role"
  }]
}
```

**Endpoints affectés:**
- `GET /api/admin/qualiopi/indicators`
- `GET /api/admin/qualiopi/indicators/core`
- Tous les endpoints nécessitant le rôle admin

**Solution proposée:**
1. **Option A (Recommandée):** Modifier le schéma de validation dans `src/middleware/auth.ts` pour accepter `ORGANIZATION_ADMIN`
2. **Option B:** Migrer toutes les données de `ORGANIZATION_ADMIN` vers `ORG_ADMIN` dans la base de données
3. **Option C:** Créer un mapping dans le middleware pour convertir `ORGANIZATION_ADMIN` → `ORG_ADMIN`

**Fichiers à modifier:**
- `apps/backend/src/middleware/auth.ts`
- `apps/backend/src/types/user.ts`
- Possiblement: migration SQL pour uniformiser les rôles

**Tests requis:**
- ✅ Login admin avec le nouveau rôle
- ✅ Accès aux endpoints Qualiopi
- ✅ Vérification des permissions

---

### Bug #2: Filtrage des Assessments par Utilisateur ⚠️ CRITIQUE

**Sévérité:** 🔴 Critique  
**Impact:** Fuite de données - Les utilisateurs voient les assessments d'autres utilisateurs  
**Statut:** 🔴 Non résolu

**Description:**
L'endpoint `GET /api/assessments` retourne tous les assessments de tous les utilisateurs au lieu de filtrer par l'utilisateur authentifié. C'est une violation de la confidentialité des données.

**Comportement actuel:**
- Client Sophie Bernard (ID: `3330db35-c05b-4bc7-b1b6-8c8378e88d1a`) voit 6 assessments
- Devrait voir uniquement ses 2 assessments

**Assessments retournés (exemple):**
```json
{
  "data": [
    {"id": "361964e6-727f-4146-90f3-baee10d29ccc", "beneficiary_id": "3330db35-c05b-4bc7-b1b6-8c8378e88d1a"},
    {"id": "d445b252-7363-41ff-9639-6bc7f2003496", "beneficiary_id": "3330db35-c05b-4bc7-b1b6-8c8378e88d1a"},
    {"id": "...", "beneficiary_id": "7e3a7a34-49b8-4383-bd67-941a8dc63f52"}, // ❌ Autre utilisateur
    {"id": "...", "beneficiary_id": "2135d15b-780c-4032-8603-25c214899e30"}  // ❌ Autre utilisateur
  ]
}
```

**Solution proposée:**
Ajouter un filtre `WHERE beneficiary_id = $userId` dans la requête SQL de l'endpoint assessments.

**Fichiers à modifier:**
- `apps/backend/src/routes/assessments.ts`
- `apps/backend/src/services/assessmentService.ts`

**Code à ajouter:**
```typescript
// Dans assessmentService.ts
async getAssessments(userId: string, userRole: string) {
  let query = 'SELECT * FROM assessments WHERE deleted_at IS NULL';
  
  // Filtrer par utilisateur sauf pour les admins
  if (userRole === 'BENEFICIARY') {
    query += ' AND beneficiary_id = $1';
  } else if (userRole === 'CONSULTANT') {
    query += ' AND consultant_id = $1';
  }
  
  // Admins voient tout
  return await db.query(query, [userId]);
}
```

**Tests requis:**
- ✅ Client voit uniquement ses assessments
- ✅ Consultant voit uniquement ses assessments assignés
- ✅ Admin voit tous les assessments de son organisation

---

## 🟡 Bugs Moyens (Priorité 2)

### Bug #3: Assessment Individuel Non Accessible

**Sévérité:** 🟡 Moyen  
**Impact:** Les utilisateurs ne peuvent pas voir les détails de leurs assessments  
**Statut:** 🔴 Non résolu

**Description:**
L'endpoint `GET /api/assessments/:id` retourne une erreur "Failed to fetch assessment" même pour un assessment valide appartenant à l'utilisateur.

**Test effectué:**
```bash
GET /api/assessments/361964e6-727f-4146-90f3-baee10d29ccc
Authorization: Bearer <valid_token>

Response:
{
  "status": "error",
  "message": "Failed to fetch assessment"
}
```

**Causes possibles:**
1. Problème de permissions (vérification trop stricte)
2. Erreur SQL dans la requête
3. Assessment ID non trouvé (mais il existe dans la DB)
4. Soft delete mal géré

**Solution proposée:**
Déboguer le service `assessmentService.getAssessmentById()` et ajouter des logs détaillés.

**Fichiers à modifier:**
- `apps/backend/src/services/assessmentService.ts`
- `apps/backend/src/routes/assessments.ts`

**Tests requis:**
- ✅ Récupération d'un assessment existant
- ✅ Vérification des permissions (propriétaire vs non-propriétaire)
- ✅ Gestion des erreurs 404

---

### Bug #4: Analytics User Activity Échoue

**Sévérité:** 🟡 Moyen  
**Impact:** Dashboard consultant ne peut pas afficher les statistiques  
**Statut:** 🔴 Non résolu

**Description:**
L'endpoint `GET /api/analytics/user-activity` retourne "Failed to fetch user activity" pour le compte consultant.

**Test effectué:**
```bash
GET /api/analytics/user-activity
Authorization: Bearer <consultant_token>

Response:
{
  "status": "error",
  "message": "Failed to fetch user activity"
}
```

**Causes possibles:**
1. Données manquantes dans les tables analytics
2. Requête SQL incorrecte
3. Problème de timezone
4. Permissions insuffisantes

**Solution proposée:**
1. Vérifier que les tables `session_analytics` et `consultant_analytics` existent
2. Ajouter des données de test
3. Améliorer la gestion d'erreur pour retourner des données vides au lieu d'une erreur

**Fichiers à modifier:**
- `apps/backend/src/services/analyticsService.ts`
- `apps/backend/src/routes/analytics.ts`

---

## 🟢 Améliorations (Priorité 3)

### Amélioration #1: Documentation API Swagger Manquante

**Description:**
L'endpoint `/api-docs/swagger.json` retourne une erreur de parsing JSON. La documentation Swagger n'est pas accessible.

**Solution proposée:**
- Vérifier la configuration Swagger dans `src/app.ts`
- Régénérer le fichier swagger.json
- Ajouter des annotations JSDoc sur tous les endpoints

**Fichiers à modifier:**
- `apps/backend/src/app.ts`
- `apps/backend/swagger.json`

---

### Amélioration #2: Messages d'Erreur Plus Détaillés

**Description:**
Les messages d'erreur sont trop génériques ("Failed to fetch assessment"). Ils devraient inclure plus de contexte pour faciliter le débogage.

**Solution proposée:**
Ajouter des codes d'erreur structurés et des messages plus explicites.

**Exemple:**
```typescript
{
  "status": "error",
  "code": "ASSESSMENT_NOT_FOUND",
  "message": "Assessment with ID 361964e6-727f-4146-90f3-baee10d29ccc not found",
  "details": {
    "assessmentId": "361964e6-727f-4146-90f3-baee10d29ccc",
    "userId": "3330db35-c05b-4bc7-b1b6-8c8378e88d1a"
  }
}
```

---

### Amélioration #3: Logs Structurés

**Description:**
Ajouter des logs structurés pour faciliter le débogage en production.

**Solution proposée:**
Utiliser Winston ou Pino avec des niveaux de log appropriés.

---

## 📋 Liste des Tâches Prioritaires

### Sprint 1: Corrections Critiques (1-2 jours)

- [ ] **Tâche 1.1:** Corriger l'incohérence des rôles `ORGANIZATION_ADMIN` vs `ORG_ADMIN`
  - Modifier `src/middleware/auth.ts`
  - Mettre à jour les types TypeScript
  - Tester tous les endpoints admin
  - **Estimation:** 2 heures
  - **Assigné à:** Backend Developer

- [ ] **Tâche 1.2:** Implémenter le filtrage des assessments par utilisateur
  - Modifier `assessmentService.getAssessments()`
  - Ajouter des tests unitaires
  - Tester avec les 3 rôles (client, consultant, admin)
  - **Estimation:** 3 heures
  - **Assigné à:** Backend Developer

- [ ] **Tâche 1.3:** Corriger l'endpoint GET /api/assessments/:id
  - Déboguer `assessmentService.getAssessmentById()`
  - Ajouter des logs détaillés
  - Tester la récupération d'assessments
  - **Estimation:** 2 heures
  - **Assigné à:** Backend Developer

### Sprint 2: Corrections Moyennes (2-3 jours)

- [ ] **Tâche 2.1:** Corriger l'endpoint analytics user-activity
  - Vérifier les tables analytics
  - Ajouter des données de test
  - Gérer le cas "pas de données"
  - **Estimation:** 3 heures
  - **Assigné à:** Backend Developer

- [ ] **Tâche 2.2:** Tester tous les endpoints avec les comptes démo
  - Login (admin, consultant, client)
  - Assessments CRUD
  - Qualiopi indicators
  - Analytics
  - **Estimation:** 4 heures
  - **Assigné à:** QA Engineer

- [ ] **Tâche 2.3:** Créer des tests d'intégration pour les bugs corrigés
  - Test filtrage assessments
  - Test rôles utilisateur
  - Test permissions
  - **Estimation:** 4 heures
  - **Assigné à:** Backend Developer

### Sprint 3: Améliorations (3-5 jours)

- [ ] **Tâche 3.1:** Réparer la documentation Swagger
  - Vérifier la configuration
  - Régénérer swagger.json
  - Ajouter JSDoc
  - **Estimation:** 3 heures
  - **Assigné à:** Backend Developer

- [ ] **Tâche 3.2:** Améliorer les messages d'erreur
  - Créer des codes d'erreur
  - Standardiser les réponses
  - Documenter les erreurs
  - **Estimation:** 4 heures
  - **Assigné à:** Backend Developer

- [ ] **Tâche 3.3:** Implémenter des logs structurés
  - Installer Winston/Pino
  - Configurer les niveaux de log
  - Ajouter des logs dans les endpoints critiques
  - **Estimation:** 3 heures
  - **Assigné à:** Backend Developer

- [ ] **Tâche 3.4:** Tests end-to-end avec Playwright
  - Login flows
  - Assessment creation
  - Dashboard navigation
  - **Estimation:** 6 heures
  - **Assigné à:** QA Engineer

---

## 🧪 Tests Réussis ✅

### Tests API Fonctionnels

1. ✅ **Health Check**
   - Endpoint: `GET /health`
   - Statut: 200 OK
   - Uptime: 1922 secondes

2. ✅ **Login Client**
   - Email: client@demo.bilancompetence.ai
   - Statut: success
   - Token: Généré correctement
   - Rôle: BENEFICIARY

3. ✅ **Login Consultant**
   - Email: consultant@demo.bilancompetence.ai
   - Statut: success
   - Token: Généré correctement
   - Rôle: CONSULTANT

4. ✅ **Login Admin**
   - Email: admin@demo.bilancompetence.ai
   - Statut: success
   - Token: Généré correctement
   - Rôle: ORGANIZATION_ADMIN (mais pose problème avec les endpoints)

5. ✅ **Frontend Accessible**
   - URL: https://app.bilancompetence.ai/login
   - Statut: 200 OK
   - Page de login s'affiche correctement

---

## 📊 Résumé des Tests

| Catégorie | Total | Réussis | Échoués | Taux de Réussite |
|:----------|:------|:--------|:--------|:-----------------|
| Authentification | 3 | 3 | 0 | 100% ✅ |
| Endpoints Assessments | 2 | 0 | 2 | 0% ❌ |
| Endpoints Qualiopi | 1 | 0 | 1 | 0% ❌ |
| Endpoints Analytics | 1 | 0 | 1 | 0% ❌ |
| Health Checks | 1 | 1 | 0 | 100% ✅ |
| **TOTAL** | **8** | **4** | **4** | **50%** |

---

## 🎯 Objectifs Post-Correction

Après correction de tous les bugs critiques et moyens, les objectifs suivants doivent être atteints :

1. **Taux de réussite des tests API:** 100%
2. **Aucune fuite de données:** Chaque utilisateur voit uniquement ses propres données
3. **Rôles cohérents:** Tous les rôles fonctionnent correctement
4. **Documentation complète:** Swagger accessible et à jour
5. **Logs détaillés:** Faciliter le débogage en production

---

## 📞 Support et Questions

Pour toute question sur ce rapport :
- Consulter les fichiers de code mentionnés
- Vérifier les logs Railway pour plus de détails
- Tester localement avec les comptes démo

---

**Rapport généré par:** Tests API automatisés  
**Date:** 28 octobre 2025  
**Version:** 1.0  
**Statut:** 🔴 Corrections requises

---

**Prochaines étapes:**
1. Prioriser les bugs critiques (Sprint 1)
2. Assigner les tâches aux développeurs
3. Créer des branches Git pour chaque correction
4. Tester après chaque correction
5. Déployer progressivement les corrections

---

**Fin du rapport**

