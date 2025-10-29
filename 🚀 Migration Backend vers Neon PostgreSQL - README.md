# 🚀 Migration Backend vers Neon PostgreSQL - README

## 📊 État Actuel

✅ **Base de données Neon configurée**
- 33 tables migrées
- RLS activé sur toutes les tables
- Fonction `auth.uid()` créée et testée

✅ **Fichiers Backend créés**
- `config/neon.ts` - Configuration PostgreSQL avec support RLS
- `services/userServiceNeon.ts` - Service utilisateur avec Neon
- `routes/auth.neon.ts` - Routes d'authentification
- `routes/users.neon.ts` - Routes utilisateur avec CV upload

✅ **Dépendances installées**
- `pg` v8.16.3
- `@types/pg` v8.15.5

---

## 🎯 Comment Migrer

### Option 1 : Migration Automatique (Recommandé)

```bash
# Exécuter le script de migration
/home/ubuntu/MIGRATION_SWITCH_TO_NEON.sh
```

Ce script va :
1. Sauvegarder les fichiers originaux (`.supabase.backup.ts`)
2. Remplacer `auth.ts` et `users.ts` par les versions Neon
3. Vérifier que tous les fichiers nécessaires existent

### Option 2 : Migration Manuelle

```bash
cd /home/ubuntu/bilancompetence.ai/apps/backend

# Sauvegarder les fichiers originaux
cp src/routes/auth.ts src/routes/auth.supabase.backup.ts
cp src/routes/users.ts src/routes/users.supabase.backup.ts

# Remplacer par les versions Neon
cp src/routes/auth.neon.ts src/routes/auth.ts
cp src/routes/users.neon.ts src/routes/users.ts
```

---

## ⚙️ Configuration Requise

### 1. Variables d'Environnement

Créez un fichier `.env` dans `/home/ubuntu/bilancompetence.ai/apps/backend/` :

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_SmnE0tOXU83Y@ep-shy-waterfall-ahr8f8tp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS
CORS_ORIGIN=http://localhost:3000,https://bilancompetence.vercel.app

# External APIs
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Railway Configuration

Dans Railway, ajoutez les variables d'environnement :

```
DATABASE_URL=postgresql://neondb_owner:npg_SmnE0tOXU83Y@ep-shy-waterfall-ahr8f8tp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=https://bilancompetence.vercel.app
NODE_ENV=production
```

---

## 🧪 Tester Localement

### 1. Démarrer le Backend

```bash
cd /home/ubuntu/bilancompetence.ai/apps/backend
pnpm dev
```

### 2. Tester l'Inscription

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!@#",
    "full_name": "Test User"
  }'
```

**Réponse attendue :**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "full_name": "Test User",
      "role": "BENEFICIARY"
    },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "7d"
  }
}
```

### 3. Tester la Connexion

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!@#"
  }'
```

### 4. Tester le Profil avec RLS

```bash
# Remplacez YOUR_ACCESS_TOKEN par le token obtenu lors de la connexion
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Réponse attendue :**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "BENEFICIARY",
    "cv_url": null,
    "cv_uploaded_at": null
  }
}
```

---

## 🚀 Déployer sur Railway

### 1. Commiter les Changements

```bash
cd /home/ubuntu/bilancompetence.ai
git add .
git commit -m "feat: migrate backend to Neon PostgreSQL with RLS support"
git push origin main
```

### 2. Vérifier le Déploiement

Railway détectera automatiquement les changements et redéploiera le backend.

Surveillez les logs dans Railway pour vérifier que :
- ✅ La connexion à Neon est établie
- ✅ Le serveur démarre sans erreur
- ✅ Les routes sont accessibles

### 3. Tester en Production

```bash
# Remplacez YOUR_RAILWAY_URL par l'URL de votre backend Railway
curl -X POST https://YOUR_RAILWAY_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123456"
  }'
```

---

## 🔐 Vérifier que RLS Fonctionne

### Test 1 : Un utilisateur ne peut voir que son propre profil

```bash
# Connectez-vous avec l'utilisateur A
TOKEN_A=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user_a@example.com","password":"Password123!"}' \
  | jq -r '.data.accessToken')

# Essayez d'accéder au profil (devrait réussir)
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer $TOKEN_A"
```

### Test 2 : Les admins peuvent voir tous les utilisateurs

```bash
# Connectez-vous avec un admin
TOKEN_ADMIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123456"}' \
  | jq -r '.data.accessToken')

# Récupérez tous les utilisateurs (devrait réussir)
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

---

## 📦 Structure des Fichiers

```
apps/backend/
├── src/
│   ├── config/
│   │   ├── neon.ts                    ✅ Nouveau - Pool PostgreSQL avec RLS
│   │   └── supabase.ts                ⚠️  Ancien - Peut être supprimé
│   ├── services/
│   │   ├── userServiceNeon.ts         ✅ Nouveau - Service utilisateur Neon
│   │   ├── authService.ts             ✅ Existant - Pas de changement
│   │   └── supabaseService.ts         ⚠️  Ancien - À remplacer progressivement
│   ├── routes/
│   │   ├── auth.ts                    🔄 Remplacé par auth.neon.ts
│   │   ├── auth.neon.ts               ✅ Nouveau - Routes auth avec Neon
│   │   ├── auth.supabase.backup.ts    📦 Backup
│   │   ├── users.ts                   🔄 Remplacé par users.neon.ts
│   │   ├── users.neon.ts              ✅ Nouveau - Routes users avec Neon
│   │   └── users.supabase.backup.ts   📦 Backup
│   └── middleware/
│       └── auth.ts                    ✅ Existant - Pas de changement
```

---

## 🔙 Revenir en Arrière

Si vous rencontrez des problèmes, vous pouvez revenir aux versions Supabase :

```bash
cd /home/ubuntu/bilancompetence.ai/apps/backend

# Restaurer les fichiers originaux
cp src/routes/auth.supabase.backup.ts src/routes/auth.ts
cp src/routes/users.supabase.backup.ts src/routes/users.ts

# Redémarrer le backend
pnpm dev
```

---

## ❓ FAQ

### Q : Dois-je supprimer Supabase complètement ?

**R :** Non, vous pouvez garder Supabase Storage pour les fichiers (CV, documents). Seule la base de données est migrée vers Neon.

### Q : Les utilisateurs existants fonctionnent-ils toujours ?

**R :** Oui, les 3 utilisateurs demo créés dans Neon fonctionnent :
- `demo@example.com` / `Demo123456`
- `admin@example.com` / `Admin123456`
- `consultant@example.com` / `Consultant123456`

### Q : Comment fonctionne RLS avec JWT ?

**R :** Le middleware `authMiddleware` vérifie le JWT et extrait l'`user_id`. Ensuite, les fonctions dans `neon.ts` utilisent `SET app.current_user_id = 'user_id'` pour définir le contexte utilisateur. PostgreSQL applique automatiquement les politiques RLS basées sur `auth.uid()`.

### Q : Que faire si la connexion à Neon échoue ?

**R :** Vérifiez :
1. Que `DATABASE_URL` est correctement configuré
2. Que l'IP du serveur est autorisée dans Neon (ou désactivez IP Allowlist)
3. Les logs du backend pour voir l'erreur exacte

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du backend : `pnpm dev`
2. Vérifiez la connexion Neon : SQL Editor → `SELECT 1;`
3. Vérifiez que `auth.uid()` existe : `SELECT auth.uid();`
4. Consultez le guide complet : `GUIDE_MIGRATION_BACKEND_NEON.md`

---

✅ **Migration prête à être déployée !**

