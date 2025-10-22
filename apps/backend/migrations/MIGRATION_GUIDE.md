# Database Migration Guide - Assessment Wizard Schema

**Date**: 22 Ekim 2025
**Purpose**: Implement Assessment Creation Wizard database schema
**Status**: READY FOR EXECUTION

---

## 📋 Migration Overview

This migration implements the complete database schema for the Assessment Creation Wizard feature, including:

- ✅ 5 new migration scripts
- ✅ 1 seed data script with 12+ assessment questions
- ✅ Type definitions for 5 tables (3 new, 2 expanded)
- ✅ Indexes and constraints for performance
- ✅ Triggers for automatic timestamp updates

### Migration Files

```
001_create_schema.sql (EXISTING - Base schema)
002_expand_assessments_schema.sql (NEW)
003_expand_assessment_questions.sql (NEW)
004_expand_assessment_answers.sql (NEW)
005_create_assessment_competencies.sql (NEW)
006_create_assessment_drafts.sql (NEW)
007_seed_assessment_questions.sql (NEW)
```

---

## 🔧 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended for Simple Migrations)

**Step-by-Step**:

1. **Login to Supabase** at https://supabase.com
2. **Select your project** (BilanCompetence.AI)
3. **Go to SQL Editor** (in left sidebar)
4. **Create new query** for each migration:
   - Click "New query"
   - Copy-paste content from each .sql file
   - Click "Run"
   - Confirm success (green checkmark)

5. **Apply in order**:
   - 002_expand_assessments_schema.sql
   - 003_expand_assessment_questions.sql
   - 004_expand_assessment_answers.sql
   - 005_create_assessment_competencies.sql
   - 006_create_assessment_drafts.sql
   - 007_seed_assessment_questions.sql

**⏱️ Estimated Time**: 10-15 minutes

### Option 2: Using psql Command Line (Advanced)

If you have PostgreSQL client installed:

```bash
# Set your Supabase connection details
SUPABASE_HOST="your-project.supabase.co"
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"

# Connect and run migrations
psql -h $SUPABASE_HOST \
     -U $SUPABASE_USER \
     -d $SUPABASE_DB \
     -f 002_expand_assessments_schema.sql

# Repeat for each migration file
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -f 003_expand_assessment_questions.sql
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -f 004_expand_assessment_answers.sql
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -f 005_create_assessment_competencies.sql
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -f 006_create_assessment_drafts.sql
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -f 007_seed_assessment_questions.sql
```

**⏱️ Estimated Time**: 5-10 minutes

---

## 🔍 What Each Migration Does

### 002_expand_assessments_schema.sql

**Adds to `assessments` table**:
- `current_step` (INTEGER) - Current wizard step (0-5)
- `progress_percentage` (INTEGER) - Completion % (0-100)
- `submitted_at` (TIMESTAMP) - When submitted for review
- `completed_at` (TIMESTAMP) - When fully completed

**Indexes Created**:
- idx_assessments_status_beneficiary
- idx_assessments_current_step
- idx_assessments_progress

**Impact**: ✅ Non-breaking, adds new columns with sensible defaults

---

### 003_expand_assessment_questions.sql

**Adds to `assessment_questions` table**:
- `step_number` (INTEGER 1-5) - Wizard step
- `section` (TEXT) - work_history | education | skills | motivations | constraints
- `question_type` (TEXT) - text, textarea, select, multiselect, rating, checkbox_array, etc.
- `options` (JSONB) - For select/multiselect questions
- `order` (INTEGER) - Display order
- `required` (BOOLEAN) - Is mandatory
- `help_text` (TEXT) - Contextual help
- `placeholder` (TEXT) - Input placeholder

**Indexes Created**:
- idx_assessment_questions_step
- idx_assessment_questions_section
- idx_assessment_questions_assessment_step

**Impact**: ✅ Non-breaking, adds new columns with defaults

---

### 004_expand_assessment_answers.sql

**Adds to `assessment_answers` table**:
- `step_number` (INTEGER 1-5) - Wizard step
- `section` (TEXT) - work_history | education | skills | motivations | constraints
- `answer_type` (TEXT) - Type of answer value

**Indexes Created**:
- idx_assessment_answers_step
- idx_assessment_answers_section
- idx_assessment_answers_assessment_section
- idx_assessment_answers_question

**Impact**: ✅ Non-breaking, adds new columns

---

### 005_create_assessment_competencies.sql (NEW TABLE)

**Creates `assessment_competencies` table** with:
- `id` (UUID PRIMARY KEY)
- `assessment_id` (UUID FK → assessments.id)
- `skill_name` (TEXT) - Name of skill/competency
- `category` (TEXT) - technical | soft | language | other
- `self_assessment_level` (INTEGER 1-4) - Beginner to Expert
- `self_interest_level` (INTEGER 1-10)
- `context` (TEXT) - How/where learned
- `consultant_assessment_level` (INTEGER 1-4)
- `consultant_notes` (TEXT)
- `validated_at` (TIMESTAMP)
- Timestamps (created_at, updated_at)

**Indexes Created**:
- idx_assessment_competencies_assessment_id
- idx_assessment_competencies_category
- idx_assessment_competencies_skill_name
- idx_assessment_competencies_assessment_category

**Triggers**: Auto-update `updated_at` on every update

**Impact**: ✅ New table, no conflicts

---

### 006_create_assessment_drafts.sql (NEW TABLE)

**Creates `assessment_drafts` table** with:
- `id` (UUID PRIMARY KEY)
- `assessment_id` (UUID UNIQUE FK)
- `current_step_number` (INTEGER 0-5)
- `draft_data` (JSONB) - Complete form data
- `auto_save_enabled` (BOOLEAN)
- `last_saved_at` (TIMESTAMP)
- Timestamps

**Indexes Created**:
- idx_assessment_drafts_assessment_id
- idx_assessment_drafts_last_saved
- idx_assessment_drafts_current_step

**Triggers**: Auto-update timestamps on save

**Impact**: ✅ New table, one-to-one with assessments

---

### 007_seed_assessment_questions.sql

**Inserts template questions** for the 5-step wizard:

1. **Step 1 - Work History** (3 questions):
   - Recent job description
   - Previous positions list
   - Important aspects

2. **Step 2 - Education** (4 questions):
   - Highest education level
   - Field of study
   - Certifications
   - Current education

3. **Step 3 - Skills** (2 questions):
   - Competencies checklist (42+ predefined skills)
   - Additional custom skills

4. **Step 4 - Motivations** (3 questions):
   - Top 3 values
   - Top 3 career goals
   - Ideal work environment

5. **Step 5 - Constraints** (4 questions):
   - Geographic preferences (French regions)
   - Employment contract types
   - Salary range
   - Other constraints

**Total Questions**: 16 template questions with 100+ predefined options

**Impact**: ✅ Inserts seed data, no impacts

---

## ✅ Verification Checklist

After applying migrations, verify everything was applied correctly:

### Using Supabase Dashboard

1. **Check Tables Exist**:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('assessments', 'assessment_questions', 'assessment_answers', 'assessment_competencies', 'assessment_drafts');
   ```
   ✅ Should return 5 tables

2. **Check Columns Added to assessments**:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'assessments'
   AND column_name IN ('current_step', 'progress_percentage', 'submitted_at', 'completed_at');
   ```
   ✅ Should return 4 columns

3. **Check Seed Data Inserted**:
   ```sql
   SELECT COUNT(*)
   FROM assessment_questions
   WHERE assessment_id IS NULL;
   ```
   ✅ Should return 16 (16 template questions)

4. **Check Indexes Created**:
   ```sql
   SELECT indexname
   FROM pg_indexes
   WHERE tablename IN ('assessments', 'assessment_questions', 'assessment_answers', 'assessment_competencies', 'assessment_drafts');
   ```
   ✅ Should return 13+ indexes

---

## 📊 Schema Diagram (Text)

```
assessments (expanded)
├── id (PK)
├── beneficiary_id (FK → users)
├── consultant_id (FK → users)
├── organization_id (FK → organizations)
├── title
├── description
├── assessment_type
├── status
├── current_step ✨ NEW
├── progress_percentage ✨ NEW
├── started_at
├── submitted_at ✨ NEW
├── completed_at ✨ NEW
└── timestamps

assessment_questions (expanded)
├── id (PK)
├── assessment_id (FK → assessments)
├── step_number ✨ NEW
├── section ✨ NEW
├── question_text
├── question_type ✨ NEW
├── options ✨ NEW (JSONB)
├── order ✨ NEW
├── required ✨ NEW
├── help_text ✨ NEW
├── placeholder ✨ NEW
└── timestamps

assessment_answers (expanded)
├── id (PK)
├── assessment_id (FK → assessments)
├── question_id (FK → assessment_questions)
├── step_number ✨ NEW
├── section ✨ NEW
├── answer_value
├── answer_type ✨ NEW
└── timestamps

assessment_competencies ✨ NEW TABLE
├── id (PK)
├── assessment_id (FK → assessments)
├── skill_name
├── category
├── self_assessment_level
├── self_interest_level
├── context
├── consultant_assessment_level
├── consultant_notes
├── validated_at
└── timestamps

assessment_drafts ✨ NEW TABLE
├── id (PK)
├── assessment_id (FK → assessments)
├── current_step_number
├── draft_data (JSONB)
├── auto_save_enabled
├── last_saved_at
└── timestamps
```

---

## 🔐 Security & RLS (Row Level Security)

**⚠️ IMPORTANT**: If your Supabase project has Row Level Security enabled:

1. **Create RLS Policies** for new tables:

```sql
-- assessment_competencies - Only beneficiary can see their own
CREATE POLICY "Users can view own assessment competencies"
ON assessment_competencies FOR SELECT
USING (
  assessment_id IN (
    SELECT id FROM assessments
    WHERE beneficiary_id = auth.uid()
  )
);

-- assessment_drafts - Only beneficiary can access own draft
CREATE POLICY "Users can access own assessment drafts"
ON assessment_drafts FOR ALL
USING (
  assessment_id IN (
    SELECT id FROM assessments
    WHERE beneficiary_id = auth.uid()
  )
);
```

2. **Update existing table policies** if needed

---

## ⚡ Performance Considerations

### Indexes Created
- **13 new indexes** for faster queries
- **Covers common query patterns**: step, section, status, assessment_id

### Triggers
- **2 automatic timestamp triggers** for audit trail
- **No performance impact** (background)

### JSONB Storage
- `draft_data` and `options` stored as JSONB
- Allows flexible, schema-less data
- Indexes can be created if needed later

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```sql
-- Drop new tables
DROP TABLE IF EXISTS assessment_drafts CASCADE;
DROP TABLE IF EXISTS assessment_competencies CASCADE;

-- Drop new columns from existing tables
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS step_number CASCADE;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS section CASCADE;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS question_type CASCADE;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS options CASCADE;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS "order" CASCADE;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS required CASCADE;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS help_text CASCADE;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS placeholder CASCADE;

-- Repeat for assessment_answers and assessments tables
```

**⚠️ WARNING**: Rollback will lose any new data entered. Only use for emergency!

---

## 📝 Notes

- ✅ All migrations are **idempotent** (safe to run multiple times)
- ✅ Use `IF NOT EXISTS` / `IF EXISTS` clauses
- ✅ Non-breaking changes (backward compatible)
- ✅ Indexes created for common queries
- ✅ Triggers for automatic timestamp management
- ✅ Comprehensive seed data for testing

---

## 🚀 Next Steps

After migrations are applied:

1. ✅ Verify using checklist above
2. ✅ Update TypeScript types (done in database.types.ts)
3. ✅ Create service layer functions (Phase 2)
4. ✅ Build backend API endpoints (Phase 2)
5. ✅ Develop frontend components (Phase 3)

---

## ❓ Troubleshooting

### Error: "table already exists"
- Some tables might exist from previous versions
- Migration scripts use `IF NOT EXISTS`, so they're safe to rerun
- Just continue with next migration

### Error: "column already exists"
- Column was previously added
- Script has `IF NOT EXISTS` protection
- Continue with next migration

### Error: "permission denied"
- You need Admin/Owner permissions in Supabase
- Ask project admin to run migrations

### Queries seem slow
- Indexes are created automatically
- Queries should speed up after migration
- Run analyze: `ANALYZE assessment_competencies;`

---

**Status**: ✅ Migration scripts READY
**Awaiting**: User approval to apply migrations to production Supabase instance

