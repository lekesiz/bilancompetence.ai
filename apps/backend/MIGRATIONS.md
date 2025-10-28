# Database Migrations Guide

## BilanCompetence.AI - PostgreSQL Schema Migrations

**Last Updated:** 2025-10-27  
**Database:** Neon PostgreSQL  
**Total Migrations:** 29

---

## Table of Contents

1. [Overview](#overview)
2. [Migration Files](#migration-files)
3. [How to Run Migrations](#how-to-run-migrations)
4. [Migration Tracking](#migration-tracking)
5. [Rollback Strategy](#rollback-strategy)
6. [Best Practices](#best-practices)

---

## Overview

This directory contains all database schema migrations for BilanCompetence.AI. Migrations are numbered sequentially (001, 002, 003, etc.) and should be run in order.

**Database Schema Includes:**

- 43 tables
- 100+ indexes
- Row Level Security (RLS) policies
- Triggers and functions
- Seed data for tests and questions

---

## Migration Files

### Core Schema (001-007)

| Migration | Description                | Tables Created                                                                                         | Status     |
| --------- | -------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| **001**   | Initial schema             | users, organizations, bilans, competencies, recommendations, documents, messages, sessions, audit_logs | ✅ Applied |
| **002**   | Security & standardization | - (indexes, RLS, constraints)                                                                          | ✅ Applied |
| **003**   | Add cv_url to users        | - (column addition)                                                                                    | ✅ Applied |
| **004**   | Add cv_uploaded_at         | - (column addition)                                                                                    | ✅ Applied |
| **005**   | Assessment competencies    | assessment_competencies                                                                                | ✅ Applied |
| **006**   | Assessment drafts          | assessment_drafts                                                                                      | ✅ Applied |
| **007**   | Seed assessment questions  | - (seed data)                                                                                          | ✅ Applied |

### Qualiopi Compliance (008-013)

| Migration | Description                  | Tables Created                         | Status     |
| --------- | ---------------------------- | -------------------------------------- | ---------- |
| **008**   | Qualiopi indicators          | qualiopi_indicators                    | ✅ Applied |
| **009**   | Organization Qualiopi status | organization_qualiopi_status           | ✅ Applied |
| **010**   | Qualiopi evidence            | qualiopi_evidence                      | ✅ Applied |
| **011**   | Satisfaction surveys         | satisfaction_surveys, survey_responses | ✅ Applied |
| **012**   | Document archive             | document_archive, document_access_log  | ✅ Applied |
| **013**   | Qualiopi audit log           | qualiopi_audit_log                     | ✅ Applied |

### Scheduling System (014-017)

| Migration | Description        | Tables Created     | Status     |
| --------- | ------------------ | ------------------ | ---------- |
| **014**   | Availability slots | availability_slots | ✅ Applied |
| **015**   | Session bookings   | session_bookings   | ✅ Applied |
| **016**   | Session reminders  | session_reminders  | ✅ Applied |
| **017**   | Session analytics  | session_analytics  | ✅ Applied |

### Assessments & AI (018-022)

| Migration | Description           | Tables Created                                                                                    | Status     |
| --------- | --------------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| **018**   | Assessments table     | assessments, assessment_questions, assessment_answers                                             | ✅ Applied |
| **019**   | Update foreign keys   | - (FK updates)                                                                                    | ✅ Applied |
| **020**   | AI tables             | cv_analyses, job_recommendations, personality_analyses, action_plans, files, consultant_analytics | ✅ Applied |
| **021**   | Seed MBTI questions   | mbti_questions (seed data)                                                                        | ✅ Applied |
| **022**   | Seed RIASEC questions | riasec_questions (seed data)                                                                      | ✅ Applied |

### Fixes & Enhancements (023-028)

| Migration | Description             | Tables Created                                                                    | Status     |
| --------- | ----------------------- | --------------------------------------------------------------------------------- | ---------- |
| **023**   | Add CV columns to users | - (column additions)                                                              | ✅ Applied |
| **024**   | Fix assessments RLS     | - (RLS policies)                                                                  | ✅ Applied |
| **025**   | Fix cv_analyses trigger | - (trigger fix)                                                                   | ✅ Applied |
| **026**   | Add verification token  | - (column addition)                                                               | ✅ Applied |
| **027**   | Auth flow tokens        | email_verification_tokens, password_reset_tokens, auth_sessions, user_preferences | ✅ Applied |
| **028**   | Files & scheduling      | conversations (+ updates to existing tables)                                      | ✅ Applied |

### Migration Tracking (029)

| Migration | Description               | Tables Created    | Status     |
| --------- | ------------------------- | ----------------- | ---------- |
| **029**   | Migration tracking system | schema_migrations | ✅ Applied |

---

## How to Run Migrations

### Prerequisites

1. **Database Connection:**

   ```bash
   export DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

2. **PostgreSQL Client:**
   ```bash
   # Install psql (if not already installed)
   sudo apt-get install postgresql-client
   ```

### Running Migrations

#### Option 1: Manual Execution (Recommended for Production)

```bash
# Navigate to migrations directory
cd /home/ubuntu/bilancompetence.ai/apps/backend/migrations

# Run migrations in order
psql $DATABASE_URL -f 001_create_schema.sql
psql $DATABASE_URL -f 002_expand_assessments_schema.sql
# ... continue with all migrations
```

#### Option 2: Batch Execution (Development Only)

```bash
# Run all migrations at once (CAUTION: Use only on fresh database)
cd /home/ubuntu/bilancompetence.ai/apps/backend/migrations
for file in *.sql; do
  echo "Running $file..."
  psql $DATABASE_URL -f "$file"
done
```

#### Option 3: Using Node.js Script

```javascript
// migrations/run-migrations.js
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration(version, filename) {
  const sql = readFileSync(join(__dirname, filename), 'utf8');

  try {
    const start = Date.now();
    await pool.query(sql);
    const executionTime = Date.now() - start;

    // Record migration
    await pool.query(`SELECT record_migration($1, $2, NULL, $3, $4)`, [
      version,
      filename,
      'system',
      executionTime,
    ]);

    console.log(`✅ Migration ${version} applied (${executionTime}ms)`);
  } catch (error) {
    // Record failure
    await pool.query(`SELECT record_migration_failure($1, $2, $3)`, [
      version,
      filename,
      error.message,
    ]);

    console.error(`❌ Migration ${version} failed:`, error.message);
    throw error;
  }
}

// Run migrations
const migrations = [
  ['001', '001_create_schema.sql'],
  ['002', '002_expand_assessments_schema.sql'],
  // ... add all migrations
];

for (const [version, filename] of migrations) {
  await runMigration(version, filename);
}

await pool.end();
```

---

## Migration Tracking

### Check Migration Status

```sql
-- View all applied migrations
SELECT * FROM schema_migrations ORDER BY version;

-- Check if specific migration has been applied
SELECT migration_applied('001');

-- Get migration status summary
SELECT * FROM get_migration_status();
```

### Record New Migration

```sql
-- After manually running a migration
SELECT record_migration('030', 'Add new feature', NULL, CURRENT_USER, 1500);
```

### View Failed Migrations

```sql
SELECT * FROM schema_migrations WHERE success = FALSE;
```

---

## Rollback Strategy

### General Rollback Approach

1. **Backup First:**

   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Create Rollback Migration:**
   - Each migration should have a corresponding rollback script
   - Example: `001_create_schema_rollback.sql`

3. **Rollback Template:**

   ```sql
   -- Rollback for Migration 001
   DROP TABLE IF EXISTS users CASCADE;
   DROP TABLE IF EXISTS organizations CASCADE;
   -- ... drop all tables created in 001

   -- Remove from migration tracking
   DELETE FROM schema_migrations WHERE version = '001';
   ```

### Rollback Examples

#### Rollback Column Addition (003, 004, 023, 026)

```sql
-- Rollback 003: Remove cv_url column
ALTER TABLE users DROP COLUMN IF EXISTS cv_url;
DELETE FROM schema_migrations WHERE version = '003';
```

#### Rollback Table Creation (005, 006, 008-020, 027-029)

```sql
-- Rollback 029: Remove migration tracking
DROP TABLE IF EXISTS schema_migrations CASCADE;
DROP FUNCTION IF EXISTS migration_applied CASCADE;
DROP FUNCTION IF EXISTS record_migration CASCADE;
DROP FUNCTION IF EXISTS record_migration_failure CASCADE;
DROP FUNCTION IF EXISTS get_migration_status CASCADE;
```

---

## Best Practices

### 1. Always Backup Before Migration

```bash
# Full database backup
pg_dump $DATABASE_URL > backup_before_migration.sql

# Schema-only backup
pg_dump --schema-only $DATABASE_URL > schema_backup.sql
```

### 2. Test Migrations Locally First

```bash
# Create local test database
createdb bilancompetence_test

# Run migrations on test database
export DATABASE_URL="postgresql://localhost/bilancompetence_test"
psql $DATABASE_URL -f 001_create_schema.sql
```

### 3. Use Transactions

```sql
BEGIN;

-- Your migration SQL here
CREATE TABLE new_table (...);

-- If everything looks good
COMMIT;

-- If something went wrong
-- ROLLBACK;
```

### 4. Verify After Migration

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'new_table';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'new_table';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'new_table';
```

### 5. Document Breaking Changes

If a migration contains breaking changes:

- Update this document
- Notify team members
- Update application code before deploying migration

---

## Migration Dependencies

Some migrations depend on others. Run in order:

```
001 → 002 → 003 → 004 → 005 → 006 → 007
                    ↓
                   018 → 019 → 020 → 021 → 022
                    ↓
                   027 → 028
                    ↓
                   029
```

**Qualiopi chain:** 008 → 009 → 010 → 011 → 012 → 013  
**Scheduling chain:** 014 → 015 → 016 → 017  
**Fixes chain:** 023 → 024 → 025 → 026

---

## Troubleshooting

### Migration Fails with "relation already exists"

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'your_table';

-- If exists, migration may have already been applied
SELECT * FROM schema_migrations WHERE version = 'XXX';
```

### Migration Fails with "column already exists"

```sql
-- Use IF NOT EXISTS in migrations
ALTER TABLE users ADD COLUMN IF NOT EXISTS cv_url TEXT;
```

### RLS Policy Conflicts

```sql
-- Drop existing policy before creating new one
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ON table_name ...;
```

---

## Database Schema Overview

**Total Tables:** 43  
**Total Indexes:** 100+  
**RLS Enabled:** 15 tables  
**Triggers:** 20+  
**Functions:** 15+

### Table Categories

1. **Core (9 tables):** users, organizations, bilans, competencies, recommendations, documents, messages, sessions, audit_logs
2. **Assessments (6 tables):** assessments, assessment_questions, assessment_answers, assessment_competencies, assessment_drafts, assessment_documents
3. **Auth (4 tables):** email_verification_tokens, password_reset_tokens, auth_sessions, user_preferences
4. **AI/ML (6 tables):** cv_analyses, job_recommendations, personality_analyses, action_plans, files, consultant_analytics
5. **Tests (5 tables):** mbti_questions, riasec_questions, test_results, values_questions, interests_questions
6. **Chat (1 table):** conversations
7. **Scheduling (4 tables):** availability_slots, session_bookings, session_reminders, session_analytics
8. **Qualiopi (6 tables):** qualiopi_indicators, organization_qualiopi_status, qualiopi_evidence, satisfaction_surveys, survey_responses, qualiopi_audit_log
9. **Documents (2 tables):** document_archive, document_access_log
10. **Tracking (1 table):** schema_migrations

---

## Support

For migration issues or questions:

- Check migration tracking: `SELECT * FROM schema_migrations;`
- Review error logs: `SELECT * FROM schema_migrations WHERE success = FALSE;`
- Consult database audit report: `/MANUS/REPORTS/etap3-database-schema-audit.md`

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-27  
**Maintained By:** BilanCompetence.AI Team
