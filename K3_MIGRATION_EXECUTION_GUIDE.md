# 🚀 K3 - Database Schema Migration Execution Guide

**Status:** ✅ **READY FOR IMMEDIATE EXECUTION**
**Date:** 2025-10-23
**Priority:** 🔴 **CRITICAL BLOCKER**
**Project Reference:** ommidwwqqrhupmhaqghx

---

## 📊 Quick Status

| Component | Status | Details |
|-----------|--------|---------|
| **Supabase Project** | ✅ Configured | URL: https://ommidwwqqrhupmhaqghx.supabase.co |
| **API Credentials** | ✅ In .env.local | ANON_KEY + SERVICE_ROLE_KEY ready |
| **Migration Files** | ✅ All Present | 17 files (240KB total) in apps/backend/migrations/ |
| **Database Schema** | ❌ Not Applied | **ACTION REQUIRED:** Apply migrations to Supabase |
| **Current Blocker** | 🔴 Auth APIs | Returning 500 errors because tables don't exist |

---

## 🎯 Execution Options

### **Option A: Recommended - Manual via Supabase Dashboard (Safest)**

**Best for:** First-time setup, verification step-by-step, auditing changes
**Time:** 30-45 minutes
**Difficulty:** Easy - Copy & Paste only

#### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Log in to your account
   - Select the **BilanCompetence** project (ommidwwqqrhupmhaqghx)

2. **Access SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **+ New Query** to start first migration

3. **Run Migration 001 (Base Schema)**
   - Open: `/Users/mikail/Desktop/bilancompetence.ai/apps/backend/migrations/001_create_schema.sql`
   - Copy entire file contents
   - Paste into Supabase SQL Editor
   - Click **Run** button (top right)
   - Confirm: Green checkmark appears

4. **Run Migrations 002-017 in Order**

   Follow this **EXACT sequence**:

   | # | File | Expected Tables | Time |
   |---|------|-----------------|------|
   | 1 | `001_create_schema.sql` | users, organizations, bilans, competencies, recommendations, documents, messages, sessions, audit_logs | 2 min |
   | 2 | `002_expand_assessments_schema.sql` | Add columns to bilans | 1 min |
   | 3 | `003_expand_assessment_questions.sql` | assessment_questions | 1 min |
   | 4 | `004_expand_assessment_answers.sql` | assessment_answers | 1 min |
   | 5 | `005_create_assessment_competencies.sql` | assessment_competencies | 1 min |
   | 6 | `006_create_assessment_drafts.sql` | assessment_drafts | 1 min |
   | 7 | `007_seed_assessment_questions.sql` | Seed 16 template questions | 1 min |
   | 8 | `008_create_qualiopi_indicators.sql` | qualiopi_indicators, qualiopi_certification_levels | 2 min |
   | 9 | `009_create_organization_qualiopi_status.sql` | organization_qualiopi_status | 1 min |
   | 10 | `010_create_qualiopi_evidence.sql` | qualiopi_evidence | 1 min |
   | 11 | `011_create_satisfaction_surveys.sql` | satisfaction_surveys, survey_responses | 2 min |
   | 12 | `012_create_document_archive.sql` | document_archive | 1 min |
   | 13 | `013_create_qualiopi_audit_log.sql` | qualiopi_audit_log | 1 min |
   | 14 | `014_create_availability_slots.sql` | availability_slots | 2 min |
   | 15 | `015_create_session_bookings.sql` | session_bookings | 2 min |
   | 16 | `016_create_session_reminders.sql` | session_reminders | 1 min |
   | 17 | `017_create_session_analytics.sql` | session_analytics | 1 min |

   **For each migration:**
   ```
   a) Click "+ New Query"
   b) Open migration file
   c) Copy entire contents
   d) Paste into SQL Editor
   e) Click "Run"
   f) Confirm success (green checkmark)
   g) Repeat for next migration
   ```

---

### **Option B: Advanced - Supabase CLI (Fastest)**

**Best for:** Experienced developers, CI/CD pipelines, automated setup
**Time:** 15-20 minutes
**Difficulty:** Intermediate - Command line only

#### Prerequisites:

```bash
# Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase

# Or via npm (requires Node 16+)
npm install -g supabase
```

#### Steps:

1. **Navigate to Project Root**
   ```bash
   cd /Users/mikail/Desktop/bilancompetence.ai
   ```

2. **Initialize Supabase (if not done)**
   ```bash
   supabase init
   ```

3. **Link to Remote Project**
   ```bash
   supabase link --project-ref ommidwwqqrhupmhaqghx
   ```

   When prompted:
   - **Supabase password:** (ask DevOps/manager if needed - can be reset in dashboard)
   - Confirm project link successful

4. **Apply All Migrations**
   ```bash
   cd apps/backend
   supabase db push
   ```

   **Output should show:**
   ```
   ✅ Migration 001_create_schema applied
   ✅ Migration 002_expand_assessments_schema applied
   ... (all 17 migrations)
   ✅ All migrations applied successfully
   ```

5. **Verify Success**
   ```bash
   supabase db push --dry-run  # Shows what would be applied (should be empty)
   ```

---

## ✅ Verification (Required After Either Option)

After completing migrations via either option, verify everything worked:

### Verification 1: Check All Tables Exist

**In Supabase SQL Editor**, run this query:

```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected Result:** `table_count: 30` (or similar - we expect 30+ tables)

### Verification 2: List All Created Tables

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Tables (30+):**
```
assessment_answers
assessment_competencies
assessment_drafts
assessment_questions
audit_logs
availability_slots
bilans
competencies
documents
document_archive
messages
organizations
qualiopi_audit_log
qualiopi_certification_levels
qualiopi_evidence
qualiopi_indicators
recommendations
satisfaction_surveys
session_analytics
session_bookings
session_reminders
sessions
survey_responses
users
```

### Verification 3: Check Key Table Structure

```sql
-- Check users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Should include:** id, email, password_hash, full_name, role, organization_id, etc.

### Verification 4: Check Indexes Created

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** 13+ indexes for performance optimization

### Verification 5: Check Triggers Created

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**Expected:** 10+ triggers for automatic timestamp management

### Verification 6: Check Seed Data

```sql
-- Check that template assessment questions were seeded
SELECT COUNT(*) as template_questions
FROM assessment_questions
WHERE assessment_id IS NULL;
```

**Expected Result:** `template_questions: 16` (16 template questions)

---

## 🔍 Complete Verification Checklist

After migrations, verify all items:

- [ ] **Tables Created:** 30+ tables exist in public schema
- [ ] **users table:** Has columns: id, email, password_hash, full_name, role, organization_id, avatar_url, bio, email_verified, last_login, created_at, updated_at
- [ ] **organizations table:** id, name, siret, description, subscription_plan, qualiopi_certified, etc.
- [ ] **bilans table:** id, beneficiary_id, consultant_id, organization_id, status, progress_percentage, etc.
- [ ] **assessment_questions table:** 16 template questions seeded
- [ ] **assessment_answers table:** Ready for user responses
- [ ] **assessment_competencies table:** Ready for competency tracking
- [ ] **qualiopi_indicators table:** 30+ compliance indicators
- [ ] **organization_qualiopi_status table:** Org certification status
- [ ] **availability_slots table:** Consultant availability slots
- [ ] **session_bookings table:** Appointment bookings
- [ ] **satisfaction_surveys table:** Survey instances
- [ ] **Indexes:** 13+ indexes created for query performance
- [ ] **Triggers:** 10+ triggers for timestamp automation
- [ ] **RLS Policies:** (if configured) Security policies in place
- [ ] **Foreign Keys:** Relationships between tables intact

---

## 🚨 Troubleshooting

### Problem: "Table already exists"
```
Error: relation "users" already exists
```
**Cause:** Migration was already partially applied
**Solution:** Safe to continue - scripts use `IF NOT EXISTS`, so re-running is harmless

### Problem: "Permission denied"
```
Error: permission denied for schema public
```
**Cause:** User doesn't have DDL permissions
**Solution:** Ask DevOps to run migrations as admin, or check role permissions in Supabase

### Problem: "Syntax error in SQL"
```
Error: syntax error at or near "CREATE"
```
**Cause:** Copy-paste issue or file encoding problem
**Solution:** Re-download migration file from GitHub, try again

### Problem: "Connection refused"
```
Error: could not connect to server
```
**Cause:** Supabase project URL incorrect or unavailable
**Solution:** Verify URL is `https://ommidwwqqrhupmhaqghx.supabase.co` and project is active

### Problem: After migrations, Auth APIs still return 500 errors
```
POST /api/auth/register → 500 Internal Server Error
```
**Cause:** Missing environment variables or tables created but not accessible
**Solution:**
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
- Check that all tables were created (run verification queries)
- Restart backend server: `npm run dev`
- Try registration again

### Problem: RLS policies blocking access
```
Error: new row violates row-level security policy
```
**Cause:** RLS policies too restrictive
**Solution:** Check RLS policies in Supabase → Authentication → Policies, adjust if needed

---

## 📋 Post-Migration Setup

### 1. Verify Environment Variables

**File:** `.env.local`

```bash
# These should already be set:
SUPABASE_URL=https://ommidwwqqrhupmhaqghx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Confirm these are set before testing APIs.

### 2. Restart Backend Server

```bash
cd /Users/mikail/Desktop/bilancompetence.ai
npm run dev
```

### 3. Test Auth Endpoint

Once backend is running:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User",
    "role": "BENEFICIARY"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "full_name": "Test User",
    "role": "BENEFICIARY"
  },
  "accessToken": "token-here",
  "refreshToken": "token-here"
}
```

If you get 500 error, check:
- All 17 migrations applied successfully
- All tables exist (run verification query)
- Environment variables are correct
- Backend server is running on correct port

---

## ⏱️ Expected Timeline

| Step | Time | Status |
|------|------|--------|
| **Option A (Manual Dashboard)** | 30-45 min | ⏳ Ready |
| **Option B (CLI)** | 15-20 min | ⏳ Ready |
| **Verification Queries** | 5-10 min | ⏳ Ready |
| **API Testing** | 5 min | ⏳ Ready |
| **TOTAL** | **45-60 min** | ⏳ Ready |

---

## 🎯 Success Criteria

Migration is complete when:

- ✅ All 30+ tables exist in Supabase
- ✅ All columns present and correct types
- ✅ 16 template assessment questions seeded
- ✅ All 13+ indexes created
- ✅ All 10+ triggers active
- ✅ `POST /api/auth/register` returns 200 (not 500)
- ✅ New user can be created in database
- ✅ User data can be retrieved without errors

---

## 🔄 Rollback (If Needed)

If migrations fail or cause issues:

### Option 1: Reset Database (Destructive)

**In Supabase Dashboard:**
1. Settings → Database → Utilities
2. Click "Reset Database"
3. Confirm (loses all data)
4. Repeat migration process

### Option 2: Drop Specific Tables

**In SQL Editor:**
```sql
-- Drop tables in reverse order (example)
DROP TABLE IF EXISTS session_analytics CASCADE;
DROP TABLE IF EXISTS session_reminders CASCADE;
DROP TABLE IF EXISTS session_bookings CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;

-- Then reapply migrations starting from first failed migration
```

---

## 📞 Need Help?

If you encounter issues during migration:

1. **Check troubleshooting section above**
2. **Verify Supabase project is active** (check dashboard)
3. **Confirm credentials are correct** (SUPABASE_URL, API keys)
4. **Check migration file syntax** (re-download if corrupted)
5. **Contact DevOps** if permission issues occur

---

## 🎓 What Each Migration Does

### 001_create_schema.sql (10KB)
- ✅ Creates 9 core tables: users, organizations, bilans, competencies, recommendations, documents, messages, sessions, audit_logs
- ✅ Creates 17 indexes for performance
- ✅ Creates 10 triggers for automatic updated_at timestamps
- ✅ Sets up basic RLS policies

### 002-004_expand_assessments (4.4KB)
- ✅ Expands bilans table with assessment-specific columns
- ✅ Creates assessment_questions table with 3 types: initial, investigation, conclusion
- ✅ Creates assessment_answers table for storing user responses

### 005-007_assessment_competencies (19KB)
- ✅ Creates assessment_competencies for tracking skill assessments
- ✅ Creates assessment_drafts for saving assessment progress
- ✅ Seeds 16 template assessment questions (ready to use)

### 008-010_qualiopi (11KB)
- ✅ Creates qualiopi_indicators table (30+ compliance indicators)
- ✅ Creates organization_qualiopi_status for tracking org certification
- ✅ Creates qualiopi_evidence table for supporting documentation
- ✅ Sets up QUALIOPI compliance framework

### 011-013_surveys_documents_audit (9KB)
- ✅ Creates satisfaction_surveys for beneficiary feedback
- ✅ Creates survey_responses for storing responses
- ✅ Creates document_archive for archiving documents
- ✅ Creates qualiopi_audit_log for compliance auditing

### 014-017_scheduling (12KB)
- ✅ Creates availability_slots for consultant availability
- ✅ Creates session_bookings for appointment bookings
- ✅ Creates session_reminders for automated notifications
- ✅ Creates session_analytics for performance metrics

---

## 📊 Final Status

| Component | Before | After |
|-----------|--------|-------|
| **Database Tables** | ❌ None | ✅ 30+ |
| **Auth APIs** | ❌ 500 Error | ✅ Working |
| **User Registration** | ❌ Not Possible | ✅ Possible |
| **Data Persistence** | ❌ No Storage | ✅ Full Schema |
| **Blocker Status** | 🔴 Critical | 🟢 Resolved |

---

**Status:** ✅ **READY FOR EXECUTION**
**Next Step:** Choose Option A (Manual) or Option B (CLI) and execute migrations
**Estimated Time to Completion:** 45-60 minutes
**Blocker Resolution Impact:** CRITICAL - Unblocks all Auth and API development

---

*Guide Created: 2025-10-23*
*Supabase Project: ommidwwqqrhupmhaqghx*
*All 17 migration files verified and ready*
