-- ============================================================================
-- MIGRATION 025: ADD ADMIN ROLE TO DATABASE
-- Date: 2025-10-25
-- Description: Ajouter le rôle ADMIN (super administrateur) au système
-- Priority: HIGH - Required for Qualiopi admin access
-- ============================================================================

-- 1. Ajouter ADMIN au type enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ADMIN';

-- 2. Créer un utilisateur ADMIN de test (si nécessaire)
-- Note: Le mot de passe sera hashé par Supabase Auth
-- Email: admin@bilancompetence.ai
-- Password: Admin2025!SecurePass

-- Vérifier si l'utilisateur admin existe déjà
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Chercher l'utilisateur admin
  SELECT id INTO admin_user_id
  FROM users
  WHERE email = 'admin@bilancompetence.ai';

  -- Si l'utilisateur n'existe pas, le créer
  IF admin_user_id IS NULL THEN
    -- Générer un UUID pour le nouvel admin
    admin_user_id := gen_random_uuid();
    
    -- Insérer l'utilisateur admin
    INSERT INTO users (
      id,
      email,
      full_name,
      role,
      email_verified_at,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@bilancompetence.ai',
      'System Administrator',
      'ADMIN',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
  ELSE
    -- Mettre à jour le rôle si l'utilisateur existe déjà
    UPDATE users
    SET role = 'ADMIN',
        full_name = 'System Administrator',
        updated_at = NOW()
    WHERE id = admin_user_id;

    RAISE NOTICE 'Existing user updated to ADMIN role: %', admin_user_id;
  END IF;
END $$;

-- 3. Vérifier que le rôle ADMIN a été ajouté
SELECT 
    enumlabel as role_name
FROM pg_enum
WHERE enumtypid = 'user_role'::regtype
ORDER BY enumlabel;

-- 4. Afficher l'utilisateur admin créé
SELECT 
    id,
    email,
    full_name,
    role,
    email_verified_at,
    created_at
FROM users
WHERE role = 'ADMIN';

-- ============================================================================
-- FIN DE LA MIGRATION 025
-- ============================================================================

