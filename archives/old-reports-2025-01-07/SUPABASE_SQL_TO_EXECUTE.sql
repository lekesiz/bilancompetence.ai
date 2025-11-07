-- ========================================
-- MIGRATION SQL POUR CV UPLOAD
-- À exécuter dans le SQL Editor de Supabase
-- ========================================

-- Étape 1 : Ajouter les colonnes à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS cv_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Étape 2 : Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_users_cv_uploaded_at ON users(cv_uploaded_at);

-- Étape 3 : Activer RLS sur storage.objects (si pas déjà fait)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Étape 4 : Créer les politiques RLS pour le bucket 'cvs'

-- Politique 1 : Les utilisateurs peuvent voir leur propre CV
CREATE POLICY IF NOT EXISTS "Users can view their own CV" 
ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique 2 : Les utilisateurs peuvent uploader leur propre CV
CREATE POLICY IF NOT EXISTS "Users can upload their own CV" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique 3 : Les utilisateurs peuvent supprimer leur propre CV
CREATE POLICY IF NOT EXISTS "Users can delete their own CV" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique 4 : Les utilisateurs peuvent mettre à jour leur propre CV
CREATE POLICY IF NOT EXISTS "Users can update their own CV" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'cvs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- FIN DE LA MIGRATION
-- ========================================

-- Vérification : Afficher les colonnes de la table users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('cv_url', 'cv_uploaded_at');

