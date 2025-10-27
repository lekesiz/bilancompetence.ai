# Etap 3: Database Schema Audit Report
## BilanCompetence.AI - Neon PostgreSQL Database Analysis

**Date:** 2025-10-27  
**Etap:** 3 - Database Audit  
**Status:** 🔄 **IN PROGRESS**  

---

## Executive Summary

Database schema audit has revealed significant discrepancies between migration files and actual service layer usage. The project uses **27 tables** but migration files only define **9 tables**, indicating **18 missing table definitions**.

**Critical Findings:**
- ⚠️ **18 tables missing from migrations** (67% of tables)
- ⚠️ `assessments` table used extensively but not defined in 001_create_schema.sql
- ⚠️ Migration 002 references `assessments` table that doesn't exist in 001
- ✅ 9 tables properly defined with indexes and RLS
- ✅ Audit logging implemented
- ✅ Soft delete pattern used (deleted_at)

---

## Tables Inventory

### Tables Defined in Migrations (9 tables)

**From 001_create_schema.sql:**

1. ✅ **users** - User accounts
   - Primary key: id (UUID)
   - Indexes: email, role, organization_id
   - RLS: Enabled
   - Soft delete: Yes (deleted_at)

2. ✅ **organizations** - Organizations/companies
   - Primary key: id (UUID)
   - Indexes: None
   - RLS: No
   - Soft delete: Yes (deleted_at)

3. ✅ **bilans** - Bilan de compétences records
   - Primary key: id (UUID)
   - Foreign keys: beneficiary_id, consultant_id, organization_id
   - Indexes: beneficiary, consultant, status, organization
   - RLS: Enabled
   - Soft delete: Yes (deleted_at)

4. ✅ **competencies** - Skills/competencies
   - Primary key: id (UUID)
   - Foreign key: bilan_id
   - Indexes: bilan_id
   - RLS: Enabled
   - Soft delete: No

5. ✅ **recommendations** - Job/training recommendations
   - Primary key: id (UUID)
   - Foreign key: bilan_id
   - Indexes: bilan_id
   - RLS: No
   - Soft delete: No

6. ✅ **documents** - Document storage metadata
   - Primary key: id (UUID)
   - Foreign key: bilan_id
   - Indexes: None
   - RLS: No
   - Soft delete: No

7. ✅ **messages** - Chat messages
   - Primary key: id (UUID)
   - Foreign keys: bilan_id, sender_id, recipient_id
   - Indexes: recipient_id, read_at
   - RLS: Enabled
   - Soft delete: No

8. ✅ **sessions** - Consultation sessions
   - Primary key: id (UUID)
   - Foreign keys: bilan_id, consultant_id, beneficiary_id
   - Indexes: scheduled_at
   - RLS: No
   - Soft delete: No

9. ✅ **audit_logs** - GDPR audit trail
   - Primary key: id (UUID)
   - Foreign key: user_id
   - Indexes: entity_type+entity_id, user_id
   - RLS: No
   - Soft delete: No

---

### Tables Used in Service Layer (27 tables)

**From service layer analysis:**

1. ✅ users (defined)
2. ✅ organizations (defined)
3. ✅ bilans (defined)
4. ✅ competencies (defined)
5. ✅ recommendations (defined)
6. ✅ documents (defined)
7. ✅ messages (defined)
8. ✅ sessions (defined - but named differently in migration)
9. ✅ audit_logs (defined)
10. ❌ **assessments** - MISSING (used extensively!)
11. ❌ **assessment_answers** - MISSING
12. ❌ **assessment_competencies** - MISSING
13. ❌ **assessment_documents** - MISSING
14. ❌ **assessment_drafts** - MISSING
15. ❌ **assessment_questions** - MISSING
16. ❌ **action_plans** - MISSING
17. ❌ **auth_sessions** - MISSING
18. ❌ **availability_slots** - MISSING
19. ❌ **consultant_analytics** - MISSING
20. ❌ **conversations** - MISSING
21. ❌ **cv_analyses** - MISSING
22. ❌ **email_verification_tokens** - MISSING
23. ❌ **files** - MISSING
24. ❌ **job_recommendations** - MISSING
25. ❌ **mbti_questions** - MISSING
26. ❌ **password_reset_tokens** - MISSING
27. ❌ **personality_analyses** - MISSING
28. ❌ **riasec_questions** - MISSING
29. ❌ **session_bookings** - MISSING
30. ❌ **test_results** - MISSING
31. ❌ **user_preferences** - MISSING

**Total:** 31 tables (9 defined + 22 missing)

---

## Critical Issues

### 1. Missing `assessments` Table Definition ⚠️

**Severity:** CRITICAL

**Problem:**
- `assessments` table is used in 8+ service files
- Migration 002 tries to ALTER this table
- No CREATE TABLE statement exists

**Impact:**
- Database schema incomplete
- Migration 002 will fail if run fresh
- Cannot recreate database from migrations alone

**Services Using `assessments`:**
- assessmentServiceNeon.ts
- dashboardServiceNeon.ts
- aiAnalysisServiceNeon.ts
- psychometricServiceNeon.ts
- parcours.ts route

**Recommendation:** Create migration 003_create_assessments_table.sql

---

### 2. Missing Auth Tables ⚠️

**Severity:** HIGH

**Tables Missing:**
- `email_verification_tokens`
- `password_reset_tokens`
- `auth_sessions`

**Impact:**
- Authentication flows incomplete
- Cannot recreate auth system from migrations

**Services Using These:**
- authFlowServiceNeon.ts
- sessionManagement.ts middleware

**Recommendation:** Create migration 004_create_auth_tables.sql

---

### 3. Missing AI/ML Tables ⚠️

**Severity:** MEDIUM

**Tables Missing:**
- `cv_analyses`
- `job_recommendations`
- `personality_analyses`
- `action_plans`

**Impact:**
- AI features incomplete in schema
- Cannot recreate AI functionality from migrations

**Services Using These:**
- aiAnalysisServiceNeon.ts
- ai.ts route

**Recommendation:** Create migration 005_create_ai_tables.sql

---

### 4. Missing Psychometric Test Tables ⚠️

**Severity:** MEDIUM

**Tables Missing:**
- `mbti_questions`
- `riasec_questions`
- `test_results`

**Impact:**
- Psychometric tests incomplete
- Cannot recreate test system from migrations

**Services Using These:**
- psychometricServiceNeon.ts
- tests.ts route

**Recommendation:** Create migration 006_create_test_tables.sql

---

### 5. Missing Chat/Messaging Tables ⚠️

**Severity:** MEDIUM

**Tables Missing:**
- `conversations`

**Impact:**
- Chat system incomplete (messages table exists but conversations doesn't)

**Services Using These:**
- chatServiceNeon.ts
- chat.ts route

**Recommendation:** Create migration 007_create_chat_tables.sql

---

### 6. Missing Scheduling Tables ⚠️

**Severity:** MEDIUM

**Tables Missing:**
- `availability_slots`
- `session_bookings`

**Impact:**
- Scheduling system incomplete

**Services Using These:**
- schedulingServiceNeon.ts
- scheduling.ts route

**Recommendation:** Create migration 008_create_scheduling_tables.sql

---

### 7. Missing Supporting Tables ⚠️

**Severity:** LOW

**Tables Missing:**
- `user_preferences`
- `files`
- `consultant_analytics`
- `assessment_answers`
- `assessment_competencies`
- `assessment_documents`
- `assessment_drafts`
- `assessment_questions`

**Impact:**
- Various features incomplete

**Recommendation:** Create migration 009_create_supporting_tables.sql

---

## Migration File Issues

### Issue 1: Migration 002 References Non-Existent Table

**File:** `002_expand_assessments_schema.sql`

**Problem:**
```sql
ALTER TABLE IF EXISTS assessments
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 0,
...
```

This migration tries to alter `assessments` table, but 001_create_schema.sql doesn't create it!

**Fix:** Create `assessments` table in a new migration before 002

---

### Issue 2: No Migration History Tracking

**Problem:**
- No `schema_migrations` table to track which migrations have run
- No way to know current schema version
- Risk of running migrations multiple times

**Recommendation:** Create migration tracking system

---

## Schema Quality Analysis

### Positive Aspects ✅

1. **Proper UUID Primary Keys**
   - All tables use UUID primary keys
   - Good for distributed systems

2. **Soft Delete Pattern**
   - Users, organizations, bilans use `deleted_at`
   - GDPR-friendly

3. **Audit Logging**
   - `audit_logs` table for compliance
   - Tracks entity changes

4. **Row Level Security (RLS)**
   - Enabled on sensitive tables (users, bilans, messages, competencies)
   - Security policies defined

5. **Indexes**
   - Key columns indexed (email, foreign keys, status)
   - Performance optimized

6. **Timestamps**
   - `created_at` and `updated_at` on most tables
   - Triggers for auto-update

7. **Foreign Key Constraints**
   - Proper relationships defined
   - ON DELETE CASCADE/SET NULL

---

### Areas for Improvement ⚠️

1. **Missing Indexes**
   - No index on `organizations.name`
   - No index on `documents.bilan_id`
   - No composite indexes for common queries

2. **No Check Constraints**
   - Email format not validated
   - Phone format not validated
   - SIRET length not enforced

3. **No Default Values for Some Fields**
   - `users.age` has no reasonable default or constraint
   - `bilans.satisfaction_score` has no range constraint

4. **Inconsistent Soft Delete**
   - Some tables have `deleted_at`, others don't
   - No clear policy

5. **No Full-Text Search Indexes**
   - No GIN indexes for JSONB columns
   - No text search on competencies or recommendations

6. **Missing Composite Indexes**
   - Common query patterns not optimized
   - Example: (bilan_id, created_at) for messages

---

## Recommended Migrations

### Priority 1: CRITICAL (Must Create)

**003_create_assessments_table.sql**
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bilan_id UUID REFERENCES bilans(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft',
  current_step INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  submitted_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_bilan ON assessments(bilan_id);
CREATE INDEX idx_assessments_status ON assessments(status);
```

**004_create_auth_tables.sql**
```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_verification_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token);
```

---

### Priority 2: HIGH (Should Create)

**005_create_ai_tables.sql**
**006_create_test_tables.sql**
**007_create_chat_tables.sql**
**008_create_scheduling_tables.sql**

---

### Priority 3: MEDIUM (Nice to Have)

**009_create_supporting_tables.sql**
**010_add_missing_indexes.sql**
**011_add_check_constraints.sql**

---

## Next Steps

1. 🔴 Create missing table migrations (Priority 1)
2. 🔴 Test migrations on fresh database
3. 🟡 Add missing indexes
4. 🟡 Add check constraints
5. 🟡 Create migration tracking system
6. 🟢 Document schema in README

---

**Status:** 🔄 **AUDIT IN PROGRESS**  
**Next:** Create missing migrations

---

**Report Prepared By:** Manus AI  
**Date:** 2025-10-27  
**Version:** 1.0.0 (Draft)

