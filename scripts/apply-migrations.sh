#!/bin/bash

# Script pour appliquer les migrations Supabase
# Usage: ./scripts/apply-migrations.sh

set -e

echo "🔄 Application des migrations Supabase..."

# Vérifier que les variables d'environnement sont définies
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Erreur: SUPABASE_URL et SUPABASE_SERVICE_KEY doivent être définis"
  exit 1
fi

# Fichier de migration
MIGRATION_FILE="supabase/migrations/20251024_add_security_features.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Erreur: Fichier de migration non trouvé: $MIGRATION_FILE"
  exit 1
fi

echo "📄 Lecture du fichier de migration: $MIGRATION_FILE"

# Appliquer la migration via l'API Supabase
# Note: Supabase ne permet pas l'exécution directe de SQL via l'API REST
# Il faut utiliser le Dashboard ou le CLI

echo "⚠️  Pour appliquer les migrations, utilisez l'une des méthodes suivantes:"
echo ""
echo "1. Via Supabase Dashboard:"
echo "   - Allez sur https://supabase.com/dashboard"
echo "   - Sélectionnez votre projet"
echo "   - SQL Editor > New Query"
echo "   - Copiez le contenu de $MIGRATION_FILE"
echo "   - Exécutez la requête"
echo ""
echo "2. Via Supabase CLI:"
echo "   $ supabase db push"
echo ""
echo "3. Via psql (si vous avez les credentials):"
echo "   $ psql \$DATABASE_URL < $MIGRATION_FILE"
echo ""

# Afficher le contenu de la migration pour faciliter le copier-coller
echo "📋 Contenu de la migration à copier:"
echo "=================================="
cat "$MIGRATION_FILE"
echo "=================================="

