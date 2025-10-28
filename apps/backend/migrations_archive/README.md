# Archived Migrations

This folder contains SQL migrations that have been archived because they are obsolete or incompatible with the current database architecture.

## Archived on: 2025-10-28

### Reason: Tables `assessment_questions` and `assessment_answers` do not exist

The application now uses a JSONB-based approach with `assessment_drafts` table instead of separate questions/answers tables.

**Archived migrations:**

1. **003_expand_assessment_questions.sql** - Adds columns to non-existent `assessment_questions` table
2. **004_expand_assessment_answers.sql** - Adds columns to non-existent `assessment_answers` table
3. **007_seed_assessment_questions.sql** - Seeds questions into non-existent table
4. **021_seed_mbti_questions.sql** - Seeds MBTI questions into non-existent table
5. **022_seed_riasec_questions.sql** - Seeds RIASEC questions into non-existent table

### Reason: Supabase-specific (auth schema)

6. **002_security_and_standardization.sql** - Uses `auth.uid()` which requires Supabase auth schema

---

## Current Architecture

The application now uses:

- **`assessments`** table - Main assessment metadata
- **`assessment_drafts`** table - JSONB-based draft data for wizard steps
- **`assessment_competencies`** table - Structured competencies extracted from drafts

No separate questions/answers tables are needed.

---

## Migration Strategy

If you need to recreate the database from scratch:

1. Run remaining migrations in `migrations/` folder
2. These archived migrations should NOT be run
3. Use the new JSONB-based API endpoints for draft management

---

**Note:** These migrations are kept for historical reference only. Do not apply them to the database.

