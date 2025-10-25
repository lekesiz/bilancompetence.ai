-- ============================================================================
-- MIGRATION 025 (FIXED): ADD ADMIN ROLE TO DATABASE
-- Date: 2025-10-25
-- Description: Ajouter le rôle ADMIN (super administrateur) au système
-- Note: La colonne role est VARCHAR(50), pas un ENUM
-- Priority: HIGH - Required for Qualiopi admin access
-- ============================================================================

-- 1. Supprimer l'ancienne contrainte de rôle si elle existe
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Ajouter une nouvelle contrainte incluant ADMIN
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN', 'ADMIN'));

-- 3. Créer un utilisateur ADMIN de test
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
      is_active,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@bilancompetence.ai',
      'System Administrator',
      'ADMIN',
      NOW(),
      true,
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
  ELSE
    -- Mettre à jour le rôle si l'utilisateur existe déjà
    UPDATE users
    SET role = 'ADMIN',
        full_name = 'System Administrator',
        is_active = true,
        updated_at = NOW()
    WHERE id = admin_user_id;

    RAISE NOTICE 'Existing user updated to ADMIN role: %', admin_user_id;
  END IF;
END $$;

-- 4. Afficher l'utilisateur admin créé
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    email_verified_at,
    created_at
FROM users
WHERE role = 'ADMIN';

-- 5. Vérifier la contrainte
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'users_role_check';

-- ============================================================================
-- FIN DE LA MIGRATION 025 (FIXED)
-- ============================================================================

