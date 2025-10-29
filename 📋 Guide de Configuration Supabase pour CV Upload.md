# 📋 Guide de Configuration Supabase pour CV Upload

**Date :** 25 octobre 2025  
**Projet :** BilanCompetence.AI  
**Objectif :** Configurer Supabase pour activer l'upload de CV

---

## 🎯 Vue d'ensemble

Pour que la fonctionnalité d'upload de CV fonctionne, vous devez :
1. Appliquer la migration SQL pour ajouter les colonnes `cv_url` et `cv_uploaded_at` à la table `users`
2. Créer un bucket de storage `cvs` pour stocker les fichiers CV
3. Configurer les politiques RLS (Row Level Security) pour sécuriser l'accès

---

## ✅ Étape 1 : Appliquer la Migration SQL

### Option A : Via Supabase Dashboard (Recommandé)

1. Connectez-vous à https://supabase.com/dashboard
2. Sélectionnez votre projet BilanCompetence.AI
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Cliquez sur **New Query**
5. Copiez-collez le contenu du fichier `/apps/backend/migrations/023_add_cv_columns_to_users.sql` :

```sql
-- Migration: Add CV columns to users table
-- Description: Add cv_url and cv_uploaded_at columns to store user CV information
-- Date: 2025-10-25

-- Add cv_url column to store the URL of the uploaded CV
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- Add cv_uploaded_at column to store the timestamp when CV was uploaded
ALTER TABLE users
ADD COLUMN IF NOT EXISTS cv_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add index on cv_uploaded_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_cv_uploaded_at ON users(cv_uploaded_at);

-- Add comment to cv_url column
COMMENT ON COLUMN users.cv_url IS 'URL of the user CV file stored in Supabase Storage';

-- Add comment to cv_uploaded_at column
COMMENT ON COLUMN users.cv_uploaded_at IS 'Timestamp when the CV was last uploaded';
```

6. Cliquez sur **Run** pour exécuter la migration
7. Vérifiez qu'il n'y a pas d'erreur dans la console

### Option B : Via Script Node.js

```bash
cd /home/ubuntu
SUPABASE_KEY="votre_service_role_key" node apply_cv_migration.mjs
```

**Note :** Remplacez `votre_service_role_key` par votre clé Service Role de Supabase (disponible dans Settings > API > service_role key).

---

## ✅ Étape 2 : Créer le Bucket de Storage

### Via Supabase Dashboard

1. Dans le dashboard Supabase, allez dans **Storage** (menu de gauche)
2. Cliquez sur **Create a new bucket**
3. Configurez le bucket :
   - **Name :** `cvs`
   - **Public bucket :** ❌ **Non** (décoché)
   - **File size limit :** `5242880` (5 MB)
   - **Allowed MIME types :** 
     ```
     application/pdf
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     ```
4. Cliquez sur **Create bucket**

### Note Importante

Le code backend (`cvService.ts`) tente de créer automatiquement le bucket s'il n'existe pas lors du premier upload. Cependant, il est recommandé de le créer manuellement pour avoir un contrôle total sur la configuration.

---

## ✅ Étape 3 : Configurer les Politiques RLS (Row Level Security)

### Politique 1 : Permettre aux utilisateurs de voir leur propre CV

1. Dans **Storage > cvs**, cliquez sur **Policies**
2. Cliquez sur **New Policy**
3. Sélectionnez **For full customization**
4. Configurez :
   - **Policy name :** `Users can view their own CV`
   - **Allowed operation :** `SELECT`
   - **Target roles :** `authenticated`
   - **USING expression :**
     ```sql
     (storage.foldername(name))[1] = auth.uid()::text
     ```
5. Cliquez sur **Review** puis **Save policy**

### Politique 2 : Permettre aux utilisateurs d'uploader leur propre CV

1. Cliquez sur **New Policy**
2. Sélectionnez **For full customization**
3. Configurez :
   - **Policy name :** `Users can upload their own CV`
   - **Allowed operation :** `INSERT`
   - **Target roles :** `authenticated`
   - **WITH CHECK expression :**
     ```sql
     (storage.foldername(name))[1] = auth.uid()::text
     ```
4. Cliquez sur **Review** puis **Save policy**

### Politique 3 : Permettre aux utilisateurs de supprimer leur propre CV

1. Cliquez sur **New Policy**
2. Sélectionnez **For full customization**
3. Configurez :
   - **Policy name :** `Users can delete their own CV`
   - **Allowed operation :** `DELETE`
   - **Target roles :** `authenticated`
   - **USING expression :**
     ```sql
     (storage.foldername(name))[1] = auth.uid()::text
     ```
4. Cliquez sur **Review** puis **Save policy**

### Politique 4 : Permettre aux utilisateurs de mettre à jour leur propre CV

1. Cliquez sur **New Policy**
2. Sélectionnez **For full customization**
3. Configurez :
   - **Policy name :** `Users can update their own CV`
   - **Allowed operation :** `UPDATE`
   - **Target roles :** `authenticated`
   - **USING expression :**
     ```sql
     (storage.foldername(name))[1] = auth.uid()::text
     ```
   - **WITH CHECK expression :**
     ```sql
     (storage.foldername(name))[1] = auth.uid()::text
     ```
5. Cliquez sur **Review** puis **Save policy**

---

## ✅ Étape 4 : Vérifier la Configuration

### Vérifier les Colonnes

Exécutez cette requête SQL dans le SQL Editor :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('cv_url', 'cv_uploaded_at');
```

**Résultat attendu :**
```
column_name      | data_type                   | is_nullable
-----------------+-----------------------------+-------------
cv_url           | text                        | YES
cv_uploaded_at   | timestamp with time zone    | YES
```

### Vérifier le Bucket

1. Allez dans **Storage**
2. Vérifiez que le bucket `cvs` existe
3. Cliquez dessus et vérifiez qu'il est **Private** (non public)

### Vérifier les Politiques RLS

1. Dans **Storage > cvs > Policies**
2. Vérifiez que les 4 politiques sont créées et activées :
   - ✅ Users can view their own CV (SELECT)
   - ✅ Users can upload their own CV (INSERT)
   - ✅ Users can delete their own CV (DELETE)
   - ✅ Users can update their own CV (UPDATE)

---

## 🧪 Test de la Configuration

### Test 1 : Upload de CV via l'Interface

1. Connectez-vous à https://app.bilancompetence.ai/login
2. Utilisez les identifiants : `test.fonctionnel@bilancompetence.ai` / `Test@123456789`
3. Allez sur `/profile`
4. Cliquez sur l'onglet **CV & Documents**
5. Cliquez sur **Choisir un fichier** et sélectionnez un PDF de test
6. Cliquez sur **Télécharger**
7. Vérifiez que le message "CV uploaded successfully!" s'affiche
8. Rafraîchissez la page et vérifiez que le CV apparaît dans la section "CV Téléchargé"

### Test 2 : Vérification dans Supabase

1. Dans le dashboard Supabase, allez dans **Table Editor > users**
2. Recherchez l'utilisateur `test.fonctionnel@bilancompetence.ai`
3. Vérifiez que les colonnes `cv_url` et `cv_uploaded_at` sont remplies
4. Copiez l'URL du `cv_url` et ouvrez-la dans un nouvel onglet pour vérifier que le fichier est accessible

### Test 3 : Suppression de CV

1. Sur la page `/profile`, cliquez sur **Supprimer** dans la section CV
2. Confirmez la suppression
3. Vérifiez que le message "CV deleted successfully!" s'affiche
4. Vérifiez que la section revient à "Aucun CV téléchargé"

---

## 🔧 Dépannage

### Erreur : "Failed to upload CV: Bucket not found"

**Solution :** Créez manuellement le bucket `cvs` via le dashboard Supabase (Étape 2).

### Erreur : "Failed to upload CV: new row violates row-level security policy"

**Solution :** Vérifiez que les politiques RLS sont correctement configurées (Étape 3).

### Erreur : "Failed to update user record"

**Solution :** Vérifiez que les colonnes `cv_url` et `cv_uploaded_at` existent dans la table `users` (Étape 1).

### Le fichier s'upload mais n'est pas accessible

**Solution :** Vérifiez que la politique RLS `Users can view their own CV` (SELECT) est activée.

---

## 📊 Architecture de Stockage

```
Supabase Storage
└── cvs/ (bucket privé)
    ├── {user_id_1}/
    │   ├── {uuid_1}.pdf
    │   └── {uuid_2}.docx
    ├── {user_id_2}/
    │   └── {uuid_3}.pdf
    └── ...
```

**Avantages de cette structure :**
- ✅ Isolation par utilisateur (chaque utilisateur a son propre dossier)
- ✅ Noms de fichiers uniques (UUID) pour éviter les conflits
- ✅ Facile à sécuriser avec RLS (vérification du `user_id` dans le chemin)
- ✅ Facile à nettoyer (suppression du dossier utilisateur lors de la suppression du compte)

---

## 📝 Endpoints Backend Créés

### POST /api/users/upload-cv

**Description :** Upload un CV (PDF/DOCX, max 5MB)

**Headers :**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Body :**
```
cv: File (PDF/DOCX)
```

**Response (200 OK) :**
```json
{
  "status": "success",
  "message": "CV uploaded successfully",
  "data": {
    "cv_url": "https://pesteyhjdfmyrkvpofud.supabase.co/storage/v1/object/public/cvs/user123/uuid.pdf",
    "cv_uploaded_at": "2025-10-25T12:42:00Z"
  }
}
```

### DELETE /api/users/delete-cv

**Description :** Supprime le CV de l'utilisateur

**Headers :**
```
Authorization: Bearer {access_token}
```

**Response (200 OK) :**
```json
{
  "status": "success",
  "message": "CV deleted successfully"
}
```

---

## ✅ Checklist Finale

Avant de tester en production, vérifiez que :

- [ ] La migration SQL a été appliquée (colonnes `cv_url` et `cv_uploaded_at` existent)
- [ ] Le bucket `cvs` existe et est configuré comme **Private**
- [ ] Les 4 politiques RLS sont créées et activées
- [ ] Le backend a été redéployé sur Railway avec le nouveau code
- [ ] Les variables d'environnement `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont configurées sur Railway
- [ ] Un test d'upload a été effectué avec succès
- [ ] Un test de suppression a été effectué avec succès

---

**Configuration terminée !** 🎉

La fonctionnalité d'upload de CV est maintenant opérationnelle.

