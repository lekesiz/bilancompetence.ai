#!/bin/bash

# Script to analyze problematic migrations

echo "🔍 Analyzing migrations for assessment_questions and assessment_answers references..."
echo ""

MIGRATIONS_DIR="./migrations"

# Migrations that failed according to logs
FAILED_MIGRATIONS=(
  "003_expand_assessment_questions.sql"
  "004_expand_assessment_answers.sql"
  "007_seed_assessment_questions.sql"
  "021_seed_mbti_questions.sql"
  "022_seed_riasec_questions.sql"
)

echo "❌ FAILED MIGRATIONS (referencing non-existent tables):"
echo "=================================================="
for migration in "${FAILED_MIGRATIONS[@]}"; do
  if [ -f "$MIGRATIONS_DIR/$migration" ]; then
    echo ""
    echo "📄 $migration"
    echo "   Size: $(wc -l < "$MIGRATIONS_DIR/$migration") lines"
    echo "   References:"
    grep -i "assessment_questions\|assessment_answers" "$MIGRATIONS_DIR/$migration" | head -3 | sed 's/^/     /'
  fi
done

echo ""
echo ""
echo "✅ MIGRATIONS TO KEEP (no issues):"
echo "=================================================="

KEEP_MIGRATIONS=(
  "001_create_schema.sql"
  "002_expand_assessments_schema.sql"
  "005_create_assessment_competencies.sql"
  "006_create_assessment_drafts.sql"
  "008_create_qualiopi_indicators.sql"
  "023_add_cv_columns_to_users.sql"
  "024_fix_assessments_rls.sql"
  "026_add_verification_token_to_users.sql"
  "027_create_auth_flow_tokens.sql"
  "029_create_migration_tracking.sql"
)

for migration in "${KEEP_MIGRATIONS[@]}"; do
  if [ -f "$MIGRATIONS_DIR/$migration" ]; then
    echo "  ✓ $migration"
  fi
done

echo ""
echo ""
echo "⚠️  MIGRATIONS WITH POTENTIAL ISSUES:"
echo "=================================================="

ISSUE_MIGRATIONS=(
  "002_security_and_standardization.sql"
  "014_create_availability_slots.sql"
  "015_create_session_bookings.sql"
  "016_create_session_reminders.sql"
  "017_create_session_analytics.sql"
  "018_create_assessments_table.sql"
  "019_update_foreign_keys_to_assessments.sql"
  "020_create_ai_tables.sql"
  "028_create_files_and_scheduling_tables.sql"
)

for migration in "${ISSUE_MIGRATIONS[@]}"; do
  if [ -f "$MIGRATIONS_DIR/$migration" ]; then
    echo "  ⚠  $migration"
  fi
done

echo ""
echo ""
echo "📊 SUMMARY:"
echo "=================================================="
echo "  Total migrations: $(ls -1 $MIGRATIONS_DIR/*.sql | wc -l)"
echo "  Failed (to delete): ${#FAILED_MIGRATIONS[@]}"
echo "  To keep: ${#KEEP_MIGRATIONS[@]}"
echo "  To review: ${#ISSUE_MIGRATIONS[@]}"

