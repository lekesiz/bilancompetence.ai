# 🚀 Guide de Migration Backend vers Neon PostgreSQL avec RLS

## 📊 Vue d'ensemble

Ce guide explique comment migrer le backend BilanCompetence.AI de Supabase vers Neon PostgreSQL tout en conservant le système JWT actuel et en activant Row Level Security (RLS).

---

## ✅ Étape 1 : Exécuter le Script SQL dans Neon

### 1.1 Configurer auth.uid()

Ouvrez le **SQL Editor** de Neon et exécutez le fichier `NEON_CONFIGURE_AUTH_UID.sql` :

```sql
-- Ce script crée :
-- 1. Le schéma auth
-- 2. La fonction auth.uid() pour RLS
-- 3. Les fonctions de gestion de session
-- 4. La table auth.sessions (optionnel)
```

**Résultat attendu :** ✅ "Statement executed successfully"

---

## ✅ Étape 2 : Configurer les Variables d'Environnement

### 2.1 Backend (.env ou Railway)

Ajoutez la variable `DATABASE_URL` avec votre connexion Neon :

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_SmnE0tOXU83Y@ep-shy-waterfall-ahr8f8tp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT (garder l'existant)
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS (garder l'existant)
CORS_ORIGIN=http://localhost:3000,https://bilancompetence.vercel.app

# External APIs (garder l'existant)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2.2 Frontend (.env.local ou Vercel)

Aucun changement nécessaire pour le frontend si l'API backend reste la même.

---

## ✅ Étape 3 : Installer les Dépendances PostgreSQL

### 3.1 Installer le driver pg

```bash
cd /home/ubuntu/bilancompetence.ai/apps/backend
pnpm add pg @types/pg
```

---

## ✅ Étape 4 : Mettre à Jour les Services

### 4.1 Créer un Service Utilisateur avec Neon

Créez `/apps/backend/src/services/userServiceNeon.ts` :

```typescript
import { pool, withUserContext, query, queryOne } from '../config/neon.js';
import { PoolClient } from 'pg';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' | 'ADMIN';
  organization_id?: string;
  cv_url?: string;
  cv_uploaded_at?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Récupérer un utilisateur par email (sans RLS)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    null, // Pas de contexte utilisateur pour la connexion
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Récupérer un utilisateur par ID (sans RLS)
 */
export async function getUserById(userId: string): Promise<User | null> {
  return queryOne<User>(
    null,
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
}

/**
 * Créer un nouvel utilisateur
 */
export async function createUser(userData: {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
}): Promise<User> {
  const result = await query<User>(
    null,
    `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [userData.id, userData.email, userData.password_hash, userData.full_name, userData.role]
  );
  
  return result[0];
}

/**
 * Mettre à jour le profil utilisateur (avec RLS)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Construire dynamiquement la requête UPDATE
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  if (fields.length === 0) {
    return getUserById(userId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query<User>(
    userId, // Contexte utilisateur pour RLS
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Mettre à jour l'URL du CV (avec RLS)
 */
export async function updateUserCV(
  userId: string,
  cvUrl: string
): Promise<User | null> {
  const result = await query<User>(
    userId,
    `UPDATE users 
     SET cv_url = $1, cv_uploaded_at = NOW(), updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [cvUrl, userId]
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Supprimer l'URL du CV (avec RLS)
 */
export async function deleteUserCV(userId: string): Promise<User | null> {
  const result = await query<User>(
    userId,
    `UPDATE users 
     SET cv_url = NULL, cv_uploaded_at = NULL, updated_at = NOW() 
     WHERE id = $2 
     RETURNING *`,
    [userId]
  );

  return result.length > 0 ? result[0] : null;
}
```

### 4.2 Mettre à Jour les Routes Auth

Modifiez `/apps/backend/src/routes/auth.ts` pour utiliser le nouveau service :

```typescript
import { Router } from 'express';
import { 
  hashPassword, 
  comparePassword, 
  generateTokenPair,
  validatePasswordStrength,
  validateEmail,
  generateUserId
} from '../services/authService.js';
import { 
  getUserByEmail, 
  createUser 
} from '../services/userServiceNeon.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, and full name are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        status: 'error',
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists'
      });
    }

    // Créer l'utilisateur
    const password_hash = await hashPassword(password);
    const userId = generateUserId();

    const newUser = await createUser({
      id: userId,
      email,
      password_hash,
      full_name,
      role: 'BENEFICIARY'
    });

    // Générer les tokens
    const tokens = generateTokenPair({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role
        },
        ...tokens
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      details: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Récupérer l'utilisateur
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Générer les tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        ...tokens
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      details: error.message
    });
  }
});

export default router;
```

---

## ✅ Étape 5 : Mettre à Jour les Routes Users (CV Upload)

Modifiez `/apps/backend/src/routes/users.ts` :

```typescript
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { updateUserCV, deleteUserCV, getUserById } from '../services/userServiceNeon.js';
import { uploadCV, deleteCV } from '../services/cvService.js';

const router = Router();
const upload = multer({ dest: '/tmp/uploads/' });

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        cv_url: user.cv_url,
        cv_uploaded_at: user.cv_uploaded_at
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user',
      details: error.message
    });
  }
});

// POST /api/users/upload-cv
router.post('/upload-cv', authMiddleware, upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const userId = req.user!.id;

    // Upload le CV vers le storage (S3, Supabase Storage, etc.)
    const cvUrl = await uploadCV(userId, req.file);

    // Mettre à jour la base de données avec RLS
    const updatedUser = await updateUserCV(userId, cvUrl);

    res.json({
      status: 'success',
      data: {
        cv_url: updatedUser?.cv_url,
        cv_uploaded_at: updatedUser?.cv_uploaded_at
      }
    });
  } catch (error: any) {
    console.error('CV upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload CV',
      details: error.message
    });
  }
});

// DELETE /api/users/delete-cv
router.delete('/delete-cv', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await getUserById(userId);

    if (!user?.cv_url) {
      return res.status(404).json({
        status: 'error',
        message: 'No CV found'
      });
    }

    // Supprimer le CV du storage
    await deleteCV(user.cv_url);

    // Mettre à jour la base de données avec RLS
    await deleteUserCV(userId);

    res.json({
      status: 'success',
      message: 'CV deleted successfully'
    });
  } catch (error: any) {
    console.error('CV delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete CV',
      details: error.message
    });
  }
});

export default router;
```

---

## ✅ Étape 6 : Déployer sur Railway

### 6.1 Configurer les Variables d'Environnement

Dans Railway, ajoutez :

```
DATABASE_URL=postgresql://neondb_owner:npg_SmnE0tOXU83Y@ep-shy-waterfall-ahr8f8tp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=https://bilancompetence.vercel.app
```

### 6.2 Déployer

```bash
git add .
git commit -m "feat: migrate backend to Neon PostgreSQL with RLS support"
git push origin main
```

Railway détectera automatiquement les changements et redéploiera.

---

## ✅ Étape 7 : Tester l'Authentification avec RLS

### 7.1 Tester l'inscription

```bash
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!@#",
    "full_name": "Test User"
  }'
```

### 7.2 Tester la connexion

```bash
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!@#"
  }'
```

### 7.3 Tester l'accès au profil avec RLS

```bash
curl -X GET https://your-backend.railway.app/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔐 Comment Fonctionne RLS avec JWT

### 1. L'utilisateur se connecte

```
POST /api/auth/login
→ Backend génère un JWT avec { id, email, full_name, role }
→ Frontend stocke le JWT
```

### 2. L'utilisateur fait une requête

```
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Le middleware vérifie le JWT

```typescript
// middleware/auth.ts
const decoded = verifyToken(token);
req.user = decoded; // { id, email, full_name, role }
```

### 4. Le service exécute la requête avec RLS

```typescript
// services/userServiceNeon.ts
await query(
  req.user.id, // ← user_id pour RLS
  'SELECT * FROM users WHERE id = $1',
  [req.user.id]
);
```

### 5. Neon applique les politiques RLS

```sql
-- Dans neon.ts
SELECT set_config('app.current_user_id', 'user_id', true);

-- PostgreSQL applique automatiquement :
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id::text);
```

### 6. Seules les données autorisées sont retournées

```
✅ L'utilisateur peut voir son propre profil
❌ L'utilisateur ne peut pas voir les profils des autres
✅ Les admins peuvent voir tous les profils
```

---

## 📊 Résumé des Changements

| Fichier | Action | Description |
|---------|--------|-------------|
| `NEON_CONFIGURE_AUTH_UID.sql` | ✅ Créé | Configure `auth.uid()` pour RLS |
| `config/neon.ts` | ✅ Créé | Pool PostgreSQL avec support RLS |
| `services/userServiceNeon.ts` | ✅ Créé | Service utilisateur avec Neon |
| `routes/auth.ts` | 🔄 Modifier | Utiliser `userServiceNeon` |
| `routes/users.ts` | 🔄 Modifier | Utiliser `userServiceNeon` |
| `.env` (Railway) | 🔄 Modifier | Ajouter `DATABASE_URL` |

---

## 🎯 Prochaines Étapes

1. ✅ Exécuter `NEON_CONFIGURE_AUTH_UID.sql` dans Neon SQL Editor
2. 🔄 Installer `pg` : `pnpm add pg @types/pg`
3. 🔄 Créer `userServiceNeon.ts`
4. 🔄 Mettre à jour `routes/auth.ts` et `routes/users.ts`
5. 🔄 Configurer `DATABASE_URL` dans Railway
6. 🔄 Déployer et tester

---

## ❓ Questions Fréquentes

### Q : Dois-je supprimer Supabase complètement ?

**R :** Non, vous pouvez garder Supabase Storage pour les fichiers (CV, documents) et utiliser Neon uniquement pour la base de données.

### Q : Les politiques RLS fonctionnent-elles avec les admins ?

**R :** Oui, les politiques incluent des règles spéciales pour les admins qui peuvent voir toutes les données.

### Q : Que se passe-t-il si je n'envoie pas l'user_id ?

**R :** Les requêtes sans user_id ne pourront pas accéder aux données protégées par RLS (sauf les tables publiques).

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez que `auth.uid()` est bien créé dans Neon
2. Vérifiez que `DATABASE_URL` est configuré dans Railway
3. Vérifiez les logs du backend pour les erreurs de connexion
4. Testez la connexion avec `checkConnection()` dans `neon.ts`

---

✅ **Migration terminée !** Votre backend utilise maintenant Neon PostgreSQL avec RLS activé.

