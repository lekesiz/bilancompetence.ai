# 🚀 Guide de Migration vers Neon PostgreSQL

## 📊 RÉSUMÉ EXÉCUTIF

**Difficulté :** ⭐⭐☆☆☆ (Facile à Moyen)  
**Temps estimé :** 30-60 minutes  
**Risque :** Faible (avec backup)  
**Coût :** Gratuit (plan Free de Neon)

---

## ✅ POURQUOI MIGRER VERS NEON ?

### Avantages de Neon PostgreSQL

1. **Serverless** - Pas de gestion de serveur
2. **Auto-scaling** - S'adapte automatiquement à la charge
3. **Branching** - Créez des branches de base de données comme Git
4. **Performance** - Très rapide avec edge caching
5. **Gratuit** - Plan Free généreux (0.5 GB storage, 1 compute unit)
6. **Moderne** - Conçu pour les applications modernes
7. **Intégration Vercel** - S'intègre parfaitement avec Vercel

### Comparaison avec la Base de Données Actuelle

| Aspect | Base Actuelle (Railway?) | Neon PostgreSQL |
|--------|--------------------------|-----------------|
| **Coût** | Payant après trial | **Gratuit** (Free tier) |
| **Scaling** | Manuel | **Automatique** |
| **Branching** | Non | **Oui** (comme Git) |
| **Performance** | Bonne | **Excellente** |
| **Vercel Integration** | Manuelle | **Native** |
| **Backup** | Manuel | **Automatique** |

---

## 🛠️ PROCESSUS DE MIGRATION (ÉTAPE PAR ÉTAPE)

### Étape 1 : Créer un Compte Neon (5 min)

1. Allez sur https://neon.tech
2. Cliquez sur "Sign Up"
3. Connectez-vous avec GitHub (recommandé) ou email
4. Vérifiez votre email si nécessaire

**Résultat :** Compte Neon créé ✅

---

### Étape 2 : Créer un Nouveau Projet Neon (5 min)

1. Dans le dashboard Neon, cliquez sur "New Project"
2. Configurez le projet :
   - **Name :** BilanCompetence.AI
   - **Region :** Europe (Paris ou Frankfurt recommandé)
   - **PostgreSQL Version :** 15 ou 16 (dernière version)
   - **Compute Size :** Shared (Free tier)

3. Cliquez sur "Create Project"

**Résultat :** Projet Neon créé avec une base de données vide ✅

---

### Étape 3 : Récupérer la Connection String (2 min)

1. Dans le dashboard du projet, allez dans "Connection Details"
2. Copiez la **Connection String** (format : `postgresql://...`)
3. Notez aussi :
   - **Host**
   - **Database**
   - **User**
   - **Password**

**Exemple de Connection String :**
```
postgresql://neondb_owner:abc123xyz@ep-cool-morning-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Résultat :** Connection String copiée ✅

---

### Étape 4 : Backup de la Base de Données Actuelle (10 min)

**Option A : Via Prisma (Recommandé)**

```bash
# 1. Exporter le schéma Prisma (déjà fait)
cd /home/ubuntu/bilancompetence.ai/apps/backend
cat prisma/schema.prisma

# 2. Exporter les données (si nécessaire)
npx prisma db pull
npx prisma db seed  # Si vous avez un seed script
```

**Option B : Via pg_dump (Si vous avez accès direct)**

```bash
# Exporter toute la base de données
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Exporter seulement le schéma
pg_dump --schema-only $DATABASE_URL > schema_backup.sql

# Exporter seulement les données
pg_dump --data-only $DATABASE_URL > data_backup.sql
```

**Résultat :** Backup créé ✅

---

### Étape 5 : Configurer Neon dans le Projet (5 min)

#### 5.1. Mettre à jour les variables d'environnement

**Backend (.env) :**
```bash
# Ancienne base de données (à commenter)
# DATABASE_URL=postgresql://user:password@old-host:5432/dbname

# Nouvelle base de données Neon
DATABASE_URL=postgresql://neondb_owner:abc123xyz@ep-cool-morning-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Direct URL pour Prisma Migrate (même URL)
DIRECT_URL=postgresql://neondb_owner:abc123xyz@ep-cool-morning-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**Vercel (Environment Variables) :**
1. Allez sur Vercel Dashboard → Votre projet → Settings → Environment Variables
2. Modifiez `DATABASE_URL` :
   - **Value :** `postgresql://neondb_owner:abc123xyz@ep-cool-morning-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require`
   - **Environment :** Production, Preview, Development

3. Ajoutez `DIRECT_URL` (même valeur que `DATABASE_URL`)

**Résultat :** Variables d'environnement configurées ✅

---

### Étape 6 : Migrer le Schéma Prisma vers Neon (5 min)

```bash
cd /home/ubuntu/bilancompetence.ai/apps/backend

# 1. Générer le client Prisma
npx prisma generate

# 2. Pousser le schéma vers Neon (sans migration history)
npx prisma db push

# OU si vous voulez créer une migration
npx prisma migrate dev --name init_neon

# 3. Vérifier que tout est OK
npx prisma db pull
```

**Ce que fait `prisma db push` :**
- Crée toutes les tables dans Neon
- Crée tous les index
- Crée toutes les relations
- Applique toutes les contraintes

**Résultat :** Schéma migré vers Neon ✅

---

### Étape 7 : Migrer les Données (Optionnel - 10 min)

**Si vous avez des données à migrer :**

**Option A : Via Prisma Studio (Interface graphique)**

```bash
# 1. Ouvrir Prisma Studio sur l'ancienne DB
DATABASE_URL=<ancienne_url> npx prisma studio

# 2. Exporter les données (copier manuellement)

# 3. Ouvrir Prisma Studio sur Neon
DATABASE_URL=<neon_url> npx prisma studio

# 4. Importer les données (coller)
```

**Option B : Via Script de Migration**

```bash
# Créer un script de migration
node scripts/migrate-data.js
```

**Exemple de script (`scripts/migrate-data.js`) :**

```javascript
const { PrismaClient } = require('@prisma/client');

// Ancienne DB
const oldDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.OLD_DATABASE_URL
    }
  }
});

// Nouvelle DB (Neon)
const newDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 Starting data migration...');

  // 1. Migrer les utilisateurs
  const users = await oldDb.user.findMany();
  console.log(`📊 Found ${users.length} users`);
  
  for (const user of users) {
    await newDb.user.create({
      data: user
    });
  }
  console.log('✅ Users migrated');

  // 2. Migrer les assessments
  const assessments = await oldDb.assessment.findMany();
  console.log(`📊 Found ${assessments.length} assessments`);
  
  for (const assessment of assessments) {
    await newDb.assessment.create({
      data: assessment
    });
  }
  console.log('✅ Assessments migrated');

  // 3. Migrer les autres tables...
  // ...

  console.log('🎉 Data migration completed!');
}

migrateData()
  .catch(console.error)
  .finally(async () => {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  });
```

**Résultat :** Données migrées vers Neon ✅

---

### Étape 8 : Tester la Nouvelle Base de Données (10 min)

```bash
# 1. Tester la connexion
npx prisma db pull

# 2. Lancer l'application en local
cd /home/ubuntu/bilancompetence.ai/apps/backend
npm run dev

# 3. Tester les endpoints API
curl http://localhost:3001/api/health

# 4. Tester l'authentification
# Se connecter avec le compte Marie Dupont

# 5. Tester les fonctionnalités
# - Créer un assessment
# - Voir les job recommendations
# - Modifier le profil
```

**Checklist de tests :**
- ✅ Connexion à la base de données
- ✅ Authentification (login/register)
- ✅ CRUD operations (create, read, update, delete)
- ✅ Relations (user → assessments → results)
- ✅ Queries complexes
- ✅ Performance (temps de réponse < 500ms)

**Résultat :** Tests réussis ✅

---

### Étape 9 : Déployer sur Vercel (5 min)

```bash
# 1. Committer les changements (si nécessaire)
git add .
git commit -m "feat: Migrate to Neon PostgreSQL"
git push origin main

# 2. Vercel va automatiquement redéployer

# 3. Attendre le déploiement (2-3 min)

# 4. Tester en production
# https://app.bilancompetence.ai
```

**Résultat :** Application déployée avec Neon ✅

---

### Étape 10 : Vérification Finale (5 min)

**Checklist de vérification :**

1. ✅ **Homepage** - https://app.bilancompetence.ai
2. ✅ **Login** - Se connecter avec Marie Dupont
3. ✅ **Dashboard** - Vérifier les stats
4. ✅ **Assessment** - Créer un nouveau assessment
5. ✅ **Job Recommendations** - Vérifier les recommandations
6. ✅ **Profile** - Modifier le profil
7. ✅ **Logout** - Se déconnecter

**Résultat :** Tout fonctionne parfaitement ✅

---

## 📊 CONFIGURATION OPTIMALE DE NEON

### Paramètres Recommandés

**Compute Settings :**
- **Autosuspend delay :** 5 minutes (économise les ressources)
- **Autoscaling :** Activé
- **Min compute units :** 0.25 (Free tier)
- **Max compute units :** 0.25 (Free tier) ou 1 (Pro tier)

**Connection Pooling :**
- **Pooler :** Activé (recommandé pour Vercel)
- **Mode :** Transaction
- **Pool size :** 100

**Branching (Très utile !) :**
```bash
# Créer une branche de développement
neon branches create --project-id <project-id> --name dev

# Créer une branche de test
neon branches create --project-id <project-id> --name test

# Utiliser la branche dev en local
DATABASE_URL=postgresql://...@...dev.neon.tech/...
```

---

## 💰 COÛTS

### Plan Free (Recommandé pour commencer)

**Inclus :**
- ✅ 0.5 GB storage
- ✅ 1 compute unit (0.25 vCPU, 1 GB RAM)
- ✅ 10 branches
- ✅ Autosuspend après 5 min d'inactivité
- ✅ Backups automatiques (7 jours)

**Limites :**
- ❌ 1 projet
- ❌ Pas de support prioritaire

**Suffisant pour :** Développement, tests, petites applications

---

### Plan Pro ($19/mois)

**Inclus :**
- ✅ 10 GB storage inclus
- ✅ Autoscaling jusqu'à 4 compute units
- ✅ Branches illimitées
- ✅ Backups automatiques (30 jours)
- ✅ Support prioritaire
- ✅ Pas d'autosuspend

**Recommandé pour :** Production, applications avec trafic modéré

---

## 🔧 INTÉGRATION VERCEL (BONUS)

### Neon + Vercel = ❤️

**Avantages :**
1. **Edge Caching** - Requêtes ultra-rapides
2. **Auto-scaling** - S'adapte au trafic Vercel
3. **Branching** - Une branche DB par preview deployment
4. **Zero Config** - Intégration native

**Configuration :**

1. Installer l'intégration Neon sur Vercel :
   - https://vercel.com/integrations/neon

2. Connecter votre projet Vercel à Neon

3. Vercel créera automatiquement :
   - `DATABASE_URL` pour production
   - `DATABASE_URL_PREVIEW` pour preview deployments

---

## 🚨 ROLLBACK (En cas de problème)

**Si quelque chose ne va pas, vous pouvez revenir en arrière :**

```bash
# 1. Restaurer les anciennes variables d'environnement
DATABASE_URL=<ancienne_url>

# 2. Redéployer sur Vercel
git commit --allow-empty -m "chore: Rollback to old database"
git push origin main

# 3. Attendre le déploiement (2-3 min)
```

**Résultat :** Retour à l'ancienne base de données ✅

---

## 📋 CHECKLIST COMPLÈTE

### Avant la Migration
- [ ] Créer un compte Neon
- [ ] Créer un projet Neon
- [ ] Récupérer la Connection String
- [ ] Faire un backup de la base actuelle
- [ ] Tester Neon en local

### Pendant la Migration
- [ ] Configurer les variables d'environnement
- [ ] Migrer le schéma Prisma (`prisma db push`)
- [ ] Migrer les données (si nécessaire)
- [ ] Tester en local
- [ ] Configurer Vercel

### Après la Migration
- [ ] Déployer sur Vercel
- [ ] Tester en production
- [ ] Vérifier les performances
- [ ] Monitorer les erreurs
- [ ] Supprimer l'ancienne base (après 1 semaine)

---

## 🎯 RECOMMANDATION FINALE

**Je recommande de migrer vers Neon PostgreSQL car :**

1. ✅ **Facile** - Migration en 30-60 minutes
2. ✅ **Gratuit** - Plan Free généreux
3. ✅ **Moderne** - Serverless, auto-scaling, branching
4. ✅ **Performant** - Plus rapide que Railway
5. ✅ **Vercel-friendly** - Intégration native
6. ✅ **Sécurisé** - Backups automatiques
7. ✅ **Évolutif** - Facile de passer au plan Pro plus tard

**Risque :** Faible (avec backup)  
**Effort :** Faible (30-60 min)  
**Bénéfice :** Élevé (gratuit, performant, moderne)

---

## 🚀 VOULEZ-VOUS QUE JE FASSE LA MIGRATION MAINTENANT ?

**Je peux faire la migration pour vous en 30-60 minutes :**

1. ✅ Créer le projet Neon
2. ✅ Configurer les variables d'environnement
3. ✅ Migrer le schéma Prisma
4. ✅ Tester en local et en production
5. ✅ Déployer sur Vercel
6. ✅ Vérifier que tout fonctionne

**Voulez-vous que je commence la migration maintenant ?** 🚀

