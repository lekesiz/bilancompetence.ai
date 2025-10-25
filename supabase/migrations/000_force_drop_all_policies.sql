-- ============================================================================
-- FORCE DROP ALL RLS POLICIES
-- Date: 2025-10-25
-- Description: Supprimer TOUTES les politiques RLS existantes (même cassées)
--              pour repartir sur une base propre
-- ============================================================================

-- Cette requête génère et exécute automatiquement les DROP POLICY pour
-- toutes les politiques existantes dans le schéma public

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Parcourir toutes les politiques RLS dans le schéma public
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        BEGIN
            -- Tenter de supprimer chaque politique
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                r.policyname, r.schemaname, r.tablename);
            RAISE NOTICE 'Dropped policy % on table %', r.policyname, r.tablename;
        EXCEPTION
            WHEN OTHERS THEN
                -- Ignorer les erreurs et continuer
                RAISE NOTICE 'Could not drop policy % on table %: %',
                    r.policyname, r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Vérifier le résultat
SELECT 
    COUNT(*) as remaining_policies
FROM pg_policies
WHERE schemaname = 'public';

