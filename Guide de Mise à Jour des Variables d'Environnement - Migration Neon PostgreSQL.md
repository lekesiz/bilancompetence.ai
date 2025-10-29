# Guide de Mise à Jour des Variables d'Environnement - Migration Neon PostgreSQL

**Date :** 25 octobre 2025  
**Projet :** BilanCompetence.AI  
**Migration :** Supabase → Neon PostgreSQL

---

## 📋 Informations de Connexion Neon

### Nouveau Projet Neon
- **Nom :** BilanCompetence-AI-Production
- **Project ID :** wild-frost-61939040
- **Région :** US West 2 (Oregon)
- **PostgreSQL Version :** 17
- **Database :** neondb

### Chaînes de Connexion

#### DATABASE_URL (Pooled Connection)
```
postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

**Usage :** Pour l'application (connexions poolées, haute performance)

#### DIRECT_URL (Direct Connection)
```
postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

**Usage :** Pour les migrations et opérations administratives

---

## 🎯 Étapes de Migration

### 1️⃣ Mise à Jour sur Vercel (Frontend)

#### Accès au Dashboard
1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet **BilanCompetence.AI** ou **app-bilancompetence-ai**
3. Aller dans **Settings** → **Environment Variables**

#### Variables à Mettre à Jour

| Variable | Nouvelle Valeur | Environnements |
|----------|----------------|----------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |

#### Procédure
1. Supprimer l'ancienne variable `DATABASE_URL` (Supabase)
2. Ajouter la nouvelle variable `DATABASE_URL` (Neon) pour tous les environnements
3. Ajouter la variable `DIRECT_URL` (Neon) pour tous les environnements
4. Cliquer sur **Save**
5. **Redéployer** le projet pour appliquer les changements

---

### 2️⃣ Mise à Jour sur Railway (Backend)

#### Accès au Dashboard
1. Aller sur https://railway.app/dashboard
2. Sélectionner le projet **BilanCompetence.AI Backend**
3. Aller dans **Variables**

#### Variables à Mettre à Jour

| Variable | Nouvelle Valeur |
|----------|----------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require` |

#### Procédure
1. Cliquer sur la variable `DATABASE_URL` existante
2. Remplacer la valeur par la nouvelle chaîne de connexion Neon
3. Cliquer sur **Save**
4. Railway redémarrera automatiquement le service

---

### 3️⃣ Mise à Jour des Fichiers Locaux (Optionnel)

#### Backend .env
Fichier : `/home/ubuntu/bilancompetence.ai/apps/backend/.env`

```env
# Neon PostgreSQL Database
DATABASE_URL="postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"

# Autres variables (à conserver)
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=production
```

#### Frontend .env.local
Fichier : `/home/ubuntu/bilancompetence.ai/apps/frontend/.env.local`

```env
# API Backend
NEXT_PUBLIC_API_URL=https://web-production-5a97.up.railway.app

# Database (si nécessaire pour migrations locales)
DATABASE_URL="postgresql://neondb_owner:npg_bCdl4rnwVJq3@ep-bitter-tree-af9ovm2w-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

---

## ✅ Vérification Post-Migration

### 1. Tester la Connexion Backend (Railway)

```bash
# Vérifier les logs Railway
# Devrait afficher "Database connected successfully"
```

### 2. Tester le Frontend (Vercel)

1. Aller sur https://app.bilancompetence.ai
2. Essayer de se connecter avec un compte test
3. Vérifier que les données s'affichent correctement

### 3. Tester l'API

```bash
# Test de santé de l'API
curl https://web-production-5a97.up.railway.app/health

# Test de connexion à la base de données
curl https://web-production-5a97.up.railway.app/api/health/db
```

---

## 🔄 Rollback (Si Nécessaire)

En cas de problème, vous pouvez revenir à Supabase :

### Ancienne DATABASE_URL (Supabase)
```
postgresql://postgres.xxx:password@xxx.supabase.co:5432/postgres
```

**Procédure de rollback :**
1. Restaurer l'ancienne `DATABASE_URL` sur Vercel et Railway
2. Redéployer les services
3. Vérifier que tout fonctionne

---

## 📊 État de la Migration

### ✅ Complété
- [x] Création du projet Neon PostgreSQL
- [x] Migration du schéma complet (20+ tables)
- [x] Création des index et triggers
- [x] Tables AI (cv_analyses, job_recommendations, personality_analyses, action_plans)
- [x] Tables Qualiopi (indicators, evidence, audit_log)
- [x] Tables de planification (availability_slots, session_bookings, reminders)

### 🔄 En Cours
- [ ] Mise à jour des variables d'environnement Vercel
- [ ] Mise à jour des variables d'environnement Railway
- [ ] Tests de connexion en production

### ⏳ À Faire
- [ ] Migration des données existantes (si nécessaire)
- [ ] Tests complets de l'application
- [ ] Documentation finale

---

## 🆘 Support

### Problèmes Courants

#### Erreur : "Connection timeout"
**Solution :** Vérifier que l'URL contient `sslmode=require`

#### Erreur : "Authentication failed"
**Solution :** Vérifier que le mot de passe dans l'URL est correct : `npg_bCdl4rnwVJq3`

#### Erreur : "Database does not exist"
**Solution :** Vérifier que le nom de la base est `neondb`

### Contact Neon Support
- Dashboard : https://console.neon.tech
- Documentation : https://neon.tech/docs
- Support : https://neon.tech/support

---

## 📝 Notes Importantes

1. **Pooled vs Direct Connection**
   - Utilisez `DATABASE_URL` (pooled) pour l'application
   - Utilisez `DIRECT_URL` (direct) pour les migrations Prisma

2. **Sécurité**
   - Ne jamais committer les fichiers `.env` dans Git
   - Utiliser `.env.example` pour les templates
   - Changer les mots de passe en production

3. **Performance**
   - Neon utilise le connection pooling automatique
   - Pas besoin de PgBouncer supplémentaire
   - Autoscaling automatique selon la charge

4. **Backups**
   - Neon fait des backups automatiques
   - Point-in-time recovery disponible
   - Rétention : 7 jours (plan gratuit)

---

**Dernière mise à jour :** 25 octobre 2025, 10:55 UTC  
**Auteur :** Manus AI Agent  
**Version :** 1.0

