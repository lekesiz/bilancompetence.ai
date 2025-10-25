# Guide d'Intégration du Middleware d'Autorisation

## Vue d'ensemble

Le middleware d'autorisation (`authorization.ts`) a été créé pour sécuriser l'accès aux ressources. Il complète le middleware d'authentification existant.

## Architecture

```
Requête → authMiddleware → authorizeResource → Route Handler
          (vérifie JWT)    (vérifie accès)     (traite requête)
```

## Middlewares Disponibles

### 1. `authorizeResource(resourceType)`

Vérifie que l'utilisateur a le droit d'accéder à une ressource spécifique.

**Types de ressources supportés:**
- `bilan` - Bilans de compétences
- `assessment` - Évaluations
- `appointment` - Rendez-vous
- `document` - Documents
- `cv_analysis` - Analyses de CV
- `job_recommendation` - Recommandations d'emploi
- `personality_analysis` - Analyses de personnalité (MBTI/RIASEC)
- `action_plan` - Plans d'action

**Logique d'autorisation:**

| Ressource | Bénéficiaire | Consultant | Org Admin | Admin |
|-----------|--------------|------------|-----------|-------|
| bilan | Ses bilans | Bilans qu'il gère | Bilans de son org | Tous |
| assessment | Ses évaluations | Toutes | - | Tous |
| appointment | Ses RDV | RDV qu'il anime | - | Tous |
| document | Ses documents | Documents des bilans gérés | - | Tous |
| cv_analysis | Ses analyses | Toutes | - | Tous |
| job_recommendation | Ses recommandations | Toutes | - | Tous |
| personality_analysis | Ses analyses | Toutes | - | Tous |
| action_plan | Ses plans | Tous | - | Tous |

### 2. `requireRole(...roles)`

Vérifie que l'utilisateur a l'un des rôles spécifiés.

**Rôles disponibles:**
- `ADMIN` - Administrateur système
- `CONSULTANT` - Consultant
- `BENEFICIARY` - Bénéficiaire
- `ORGANIZATION_ADMIN` - Administrateur d'organisation

### 3. `requireOrganization()`

Vérifie que l'utilisateur appartient à une organisation.

## Exemples d'Utilisation

### Exemple 1: Protéger l'accès à un bilan spécifique

**Avant:**
```typescript
router.get('/bilans/:id', authMiddleware, async (req, res) => {
  const bilan = await getBilanById(req.params.id);
  res.json(bilan);
});
```

**Après:**
```typescript
import { authorizeResource } from '../middleware/authorization.js';

router.get('/bilans/:id', 
  authMiddleware, 
  authorizeResource('bilan'), 
  async (req, res) => {
    const bilan = await getBilanById(req.params.id);
    res.json(bilan);
  }
);
```

### Exemple 2: Protéger l'accès à une évaluation

```typescript
router.get('/assessments/:assessmentId', 
  authMiddleware, 
  authorizeResource('assessment'), 
  async (req, res) => {
    const assessment = await getAssessmentById(req.params.assessmentId);
    res.json(assessment);
  }
);
```

### Exemple 3: Restreindre l'accès par rôle

```typescript
import { requireRole } from '../middleware/authorization.js';

// Seuls les consultants et admins peuvent créer des bilans
router.post('/bilans', 
  authMiddleware, 
  requireRole('CONSULTANT', 'ADMIN'), 
  async (req, res) => {
    const bilan = await createBilan(req.body);
    res.json(bilan);
  }
);
```

### Exemple 4: Combiner plusieurs middlewares

```typescript
// Seuls les consultants de l'organisation peuvent accéder
router.get('/organization/stats', 
  authMiddleware, 
  requireRole('CONSULTANT', 'ORGANIZATION_ADMIN'),
  requireOrganization(),
  async (req, res) => {
    const stats = await getOrganizationStats(req.user.organization_id);
    res.json(stats);
  }
);
```

### Exemple 5: Routes AI avec autorisation

```typescript
// apps/backend/src/routes/ai.ts

import { authorizeResource } from '../middleware/authorization.js';

// Analyse de CV - l'utilisateur peut seulement accéder à ses propres analyses
router.get('/analyze-cv/:analysisId', 
  authenticateToken, 
  authorizeResource('cv_analysis'), 
  async (req, res) => {
    const analysis = await getCVAnalysis(req.params.analysisId);
    res.json(analysis);
  }
);

// Recommandations d'emploi
router.get('/job-recommendations/:recommendationId', 
  authenticateToken, 
  authorizeResource('job_recommendation'), 
  async (req, res) => {
    const recommendation = await getJobRecommendation(req.params.recommendationId);
    res.json(recommendation);
  }
);

// Analyse de personnalité (MBTI/RIASEC)
router.get('/personality/:analysisId', 
  authenticateToken, 
  authorizeResource('personality_analysis'), 
  async (req, res) => {
    const analysis = await getPersonalityAnalysis(req.params.analysisId);
    res.json(analysis);
  }
);
```

## Routes à Protéger (Checklist)

### Priorité 1 (Critique)

- [ ] `GET /api/bilans/:id` - Détails d'un bilan
- [ ] `PUT /api/bilans/:id` - Mise à jour d'un bilan
- [ ] `DELETE /api/bilans/:id` - Suppression d'un bilan
- [ ] `GET /api/assessments/:assessmentId` - Détails d'une évaluation
- [ ] `PUT /api/assessments/:assessmentId` - Mise à jour d'une évaluation
- [ ] `GET /api/appointments/:appointmentId` - Détails d'un rendez-vous
- [ ] `PUT /api/appointments/:appointmentId` - Mise à jour d'un rendez-vous
- [ ] `DELETE /api/appointments/:appointmentId` - Suppression d'un rendez-vous

### Priorité 2 (Important)

- [ ] `GET /api/documents/:documentId` - Téléchargement d'un document
- [ ] `DELETE /api/documents/:documentId` - Suppression d'un document
- [ ] `GET /api/ai/analyze-cv/:analysisId` - Résultat d'analyse CV
- [ ] `GET /api/ai/job-recommendations/:recommendationId` - Recommandation d'emploi
- [ ] `GET /api/ai/personality/:analysisId` - Analyse de personnalité
- [ ] `GET /api/ai/action-plans/:planId` - Plan d'action

### Priorité 3 (Recommandé)

- [ ] `GET /api/users/:userId` - Profil utilisateur
- [ ] `PUT /api/users/:userId` - Mise à jour profil
- [ ] `GET /api/recommendations/:id` - Recommandation spécifique
- [ ] `GET /api/scheduling/:bilanId/slots` - Créneaux disponibles

## Tests

### Test Unitaire

```typescript
import { authorizeResource } from '../middleware/authorization';

describe('Authorization Middleware', () => {
  it('should allow beneficiary to access their own bilan', async () => {
    const req = {
      user: { id: 'user-123', role: 'BENEFICIARY' },
      params: { id: 'bilan-123' }
    };
    
    // Mock Supabase response
    supabase.from().select().eq().single.mockResolvedValue({
      data: { beneficiary_id: 'user-123' },
      error: null
    });
    
    const next = jest.fn();
    await authorizeResource('bilan')(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  it('should deny access to another user\'s bilan', async () => {
    const req = {
      user: { id: 'user-123', role: 'BENEFICIARY' },
      params: { id: 'bilan-456' }
    };
    
    supabase.from().select().eq().single.mockResolvedValue({
      data: { beneficiary_id: 'user-789' },
      error: null
    });
    
    const next = jest.fn();
    await authorizeResource('bilan')(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
```

### Test d'Intégration

```typescript
import request from 'supertest';
import app from '../index';

describe('Protected Routes', () => {
  it('should return 403 when accessing another user\'s bilan', async () => {
    const token = generateToken({ id: 'user-123', role: 'BENEFICIARY' });
    
    const response = await request(app)
      .get('/api/bilans/bilan-456')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
    
    expect(response.body.error).toContain('Forbidden');
  });

  it('should return 200 when consultant accesses managed bilan', async () => {
    const token = generateToken({ id: 'consultant-123', role: 'CONSULTANT' });
    
    const response = await request(app)
      .get('/api/bilans/bilan-456')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('id', 'bilan-456');
  });
});
```

## Dépannage

### Erreur: "Resource ID missing"

**Cause:** Le nom du paramètre ne correspond pas aux noms attendus.

**Solution:** Vérifier que le paramètre s'appelle `id`, `bilanId`, `assessmentId`, etc.

```typescript
// ❌ Mauvais
router.get('/bilans/:bilanIdentifier', authorizeResource('bilan'), ...);

// ✅ Bon
router.get('/bilans/:id', authorizeResource('bilan'), ...);
// ou
router.get('/bilans/:bilanId', authorizeResource('bilan'), ...);
```

### Erreur: "User not authenticated"

**Cause:** Le middleware `authMiddleware` n'a pas été appelé avant `authorizeResource`.

**Solution:** Toujours mettre `authMiddleware` en premier.

```typescript
// ❌ Mauvais
router.get('/bilans/:id', authorizeResource('bilan'), authMiddleware, ...);

// ✅ Bon
router.get('/bilans/:id', authMiddleware, authorizeResource('bilan'), ...);
```

### Les admins n'ont pas accès

**Cause:** Le rôle n'est pas correctement défini dans le token JWT.

**Solution:** Vérifier que le token contient `role: 'ADMIN'`.

## Performance

Le middleware effectue **1 requête Supabase** par vérification d'autorisation. Pour optimiser :

1. **Cache:** Implémenter un cache Redis pour les vérifications fréquentes
2. **Batch:** Grouper les vérifications quand possible
3. **Index:** S'assurer que les colonnes utilisées sont indexées

```sql
-- Optimisation des index
CREATE INDEX IF NOT EXISTS idx_bilans_beneficiary ON bilans(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_bilans_consultant ON bilans(consultant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
```

## Sécurité

### Bonnes Pratiques

1. **Toujours utiliser authMiddleware en premier**
2. **Ne jamais contourner l'autorisation** pour des raisons de commodité
3. **Logger les tentatives d'accès non autorisées** pour détecter les attaques
4. **Tester tous les cas limites** (utilisateur supprimé, ressource inexistante, etc.)

### Logging des Accès Non Autorisés

```typescript
// Dans authorization.ts
if (!authorized) {
  console.warn('Unauthorized access attempt:', {
    userId,
    userRole,
    resourceType,
    resourceId,
    timestamp: new Date().toISOString()
  });
  
  return res.status(403).json({ 
    error: 'Forbidden: You do not have access to this resource'
  });
}
```

## Conclusion

Le middleware d'autorisation est maintenant prêt à être intégré. Suivez ce guide pour protéger toutes les routes qui manipulent des ressources sensibles.

**Prochaines étapes:**
1. Intégrer le middleware dans les routes existantes
2. Ajouter des tests unitaires et d'intégration
3. Monitorer les logs pour détecter les problèmes
4. Optimiser les performances si nécessaire

