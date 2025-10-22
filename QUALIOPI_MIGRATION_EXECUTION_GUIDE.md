# Qualiopi Module - Database Migration Execution Guide

**Phase**: Phase 1 - Database Schema & Migrations
**Date**: 2025-10-23
**Status**: ✅ CREATED - READY FOR EXECUTION

---

## 📋 Migration Files Created

### Phase 1: Database Migrations (5 files)

| Migration | File | Purpose | Tables | Rows |
|-----------|------|---------|--------|------|
| **008** | `008_create_qualiopi_indicators.sql` | Create Qualiopi indicators table with all 32 indicators | `qualiopi_indicators` | 32 |
| **009** | `009_create_organization_qualiopi_status.sql` | Track org compliance status per indicator | `organization_qualiopi_status` | - |
| **010** | `010_create_qualiopi_evidence.sql` | Store evidence files for indicators | `qualiopi_evidence` | - |
| **011** | `011_create_satisfaction_surveys.sql` | Survey instance & response tracking | `satisfaction_surveys`, `survey_responses` | - |
| **012** | `012_create_document_archive.sql` | Document archiving with audit trail | `document_archive`, `document_access_log` | - |
| **013** | `013_create_qualiopi_audit_log.sql` | Complete audit trail for all changes | `qualiopi_audit_log` | - |

**Total New Tables**: 8
**Total Indexes**: 45+
**Total Seed Data**: 32 Qualiopi indicators

---

## 🗄️ Database Schema Changes

### New Tables (8)

```
1. qualiopi_indicators (32 rows)
   ├─ id (INT PK)
   ├─ indicator_number (INT, 1-32)
   ├─ name (VARCHAR)
   ├─ description (TEXT)
   ├─ category (VARCHAR)
   ├─ focus_level (VARCHAR: CORE, SECONDARY, OPTIONAL)
   └─ timestamps (created_at, updated_at)

2. organization_qualiopi_status
   ├─ id (UUID PK)
   ├─ organization_id (UUID FK → organizations)
   ├─ indicator_id (INT FK → qualiopi_indicators)
   ├─ status (ENUM: COMPLIANT, MISSING, UNDER_REVIEW)
   ├─ notes (TEXT)
   ├─ reviewed_by (UUID FK → users)
   └─ timestamps (created_at, updated_at)
   └─ UNIQUE(organization_id, indicator_id)

3. qualiopi_evidence
   ├─ id (UUID PK)
   ├─ indicator_id (INT FK → qualiopi_indicators)
   ├─ organization_id (UUID FK → organizations)
   ├─ file_name (VARCHAR)
   ├─ file_url (VARCHAR)
   ├─ file_size (INT)
   ├─ file_type (VARCHAR)
   ├─ description (TEXT)
   ├─ uploaded_by (UUID FK → users)
   └─ timestamps (created_at, updated_at, deleted_at)

4. satisfaction_surveys
   ├─ id (UUID PK)
   ├─ bilan_id (UUID FK → bilans)
   ├─ beneficiary_id (UUID FK → users)
   ├─ organization_id (UUID FK → organizations)
   ├─ status (ENUM: PENDING, SENT, COMPLETED, EXPIRED)
   ├─ sent_at (TIMESTAMP)
   ├─ completed_at (TIMESTAMP)
   ├─ survey_token (VARCHAR, UNIQUE)
   ├─ expires_at (TIMESTAMP)
   └─ timestamps (created_at, updated_at, deleted_at)

5. survey_responses
   ├─ id (UUID PK)
   ├─ survey_id (UUID FK → satisfaction_surveys)
   ├─ question_number (INT, 1-15)
   ├─ answer_type (ENUM: SCORE, TEXT, BOOLEAN)
   ├─ score_value (INT, 1-10)
   ├─ text_value (TEXT)
   ├─ boolean_value (BOOLEAN)
   └─ timestamps (created_at, updated_at)

6. document_archive
   ├─ id (UUID PK)
   ├─ bilan_id (UUID FK → bilans)
   ├─ organization_id (UUID FK → organizations)
   ├─ document_type (ENUM: PRELIMINARY, INVESTIGATION, CONCLUSION, REPORT, EVIDENCE, OTHER)
   ├─ file_name (VARCHAR)
   ├─ file_url (VARCHAR)
   ├─ file_size (INT)
   ├─ file_hash (VARCHAR, SHA256)
   ├─ mime_type (VARCHAR)
   ├─ created_by (UUID FK → users)
   ├─ retention_until (TIMESTAMP)
   └─ timestamps (created_at, updated_at, deleted_at)

7. document_access_log
   ├─ id (UUID PK)
   ├─ document_id (UUID FK → document_archive)
   ├─ accessed_by (UUID FK → users)
   ├─ action (ENUM: VIEW, DOWNLOAD, SHARE, DELETE_REQUEST)
   ├─ accessed_at (TIMESTAMP)
   ├─ user_ip (VARCHAR)
   ├─ user_agent (TEXT)
   └─ notes (TEXT)

8. qualiopi_audit_log
   ├─ id (UUID PK)
   ├─ organization_id (UUID FK → organizations)
   ├─ action (VARCHAR)
   ├─ action_type (ENUM: INDICATOR_UPDATE, EVIDENCE_ADD, SURVEY_SEND, etc.)
   ├─ changed_by (UUID FK → users)
   ├─ changed_at (TIMESTAMP)
   ├─ details (JSONB)
   ├─ entity_type (VARCHAR)
   ├─ entity_id (UUID)
   └─ created_at (TIMESTAMP)
```

### Modified Tables (1)

```
organizations (new columns added)
├─ qualiopi_last_audit_date (DATE)
├─ qualiopi_compliance_percentage (INT, 0-100)
```

---

## 📊 Key Features

### 1. Qualiopi Indicators
- **32 indicators** fully seeded with official Qualiopi specs
- **3 focus levels**: CORE (1, 11, 22), SECONDARY, OPTIONAL
- **Categories**: Information, Access, Resources, Implementation, Results

### 2. Compliance Tracking
- **Per-organization status** for each indicator
- **Status values**: COMPLIANT, MISSING, UNDER_REVIEW
- **Audit trail**: Track who reviewed and when

### 3. Evidence Management
- **File upload support** with metadata
- **Multiple evidence per indicator**
- **Soft delete** for compliance

### 4. Satisfaction Surveys
- **Auto-generated surveys** after bilan completion
- **Configurable questions** (1-15 questions)
- **Response types**: SCORE (1-10), TEXT, BOOLEAN
- **Anonymous access** via survey_token
- **Expiry tracking** (typically 30 days)

### 5. Document Archive
- **Auto-archiving** of all bilan documents
- **SHA256 hash** for integrity verification
- **Retention policy** (auto-delete after 5 years)
- **Full audit trail** of all access

### 6. Audit Logging
- **10 action types** tracked
- **JSONB storage** for detailed changes
- **Entity linking** for traceability

---

## 🚀 Execution Steps

### Step 1: Verify Supabase Connection
```bash
# Check backend environment variables
cat /Users/mikail/Desktop/bilancompetence.ai/.env.local | grep SUPABASE

# Should output:
# SUPABASE_URL=...
# SUPABASE_KEY=...
```

### Step 2: Execute Migrations in Order
```bash
# Option A: Using psql (if available)
psql $SUPABASE_CONNECTION_STRING -f migrations/008_create_qualiopi_indicators.sql
psql $SUPABASE_CONNECTION_STRING -f migrations/009_create_organization_qualiopi_status.sql
psql $SUPABASE_CONNECTION_STRING -f migrations/010_create_qualiopi_evidence.sql
psql $SUPABASE_CONNECTION_STRING -f migrations/011_create_satisfaction_surveys.sql
psql $SUPABASE_CONNECTION_STRING -f migrations/012_create_document_archive.sql
psql $SUPABASE_CONNECTION_STRING -f migrations/013_create_qualiopi_audit_log.sql

# Option B: Using Supabase Dashboard
# 1. Go to: https://supabase.com/dashboard
# 2. Select project: netzfrance
# 3. Go to SQL Editor → New Query
# 4. Copy paste each migration file content
# 5. Execute each one sequentially
```

### Step 3: Verify Table Creation
```bash
# Run verification queries
psql $SUPABASE_CONNECTION_STRING << 'EOF'
-- Check all new tables
SELECT tablename FROM pg_tables
WHERE tablename LIKE 'qualiopi_%'
   OR tablename LIKE '%_archive%'
   OR tablename LIKE 'satisfaction_%'
   OR tablename LIKE 'document_%';

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('qualiopi_indicators', 'organization_qualiopi_status', 'qualiopi_evidence');

-- Check indicator count
SELECT COUNT(*) as indicator_count FROM qualiopi_indicators;
-- Should return: 32
EOF
```

### Step 4: Seed Initial Data
```bash
# Verify 32 indicators are seeded
SELECT indicator_number, name, focus_level FROM qualiopi_indicators ORDER BY indicator_number;

# Check key indicators are present
SELECT * FROM qualiopi_indicators WHERE indicator_number IN (1, 11, 22);
```

### Step 5: Create Indexes on Organization Table
```bash
-- Already done in migration 009, but verify:
SELECT indexname FROM pg_indexes WHERE tablename = 'organizations' AND indexname LIKE '%qualiopi%';
```

---

## ✅ Success Criteria

- [ ] All 5 migration files executed without errors
- [ ] All 8 new tables created successfully
- [ ] 45+ indexes created
- [ ] 32 Qualiopi indicators seeded
- [ ] 4 new columns added to organizations table
- [ ] All foreign key relationships validated
- [ ] Column constraints validated (CHECK, UNIQUE, NOT NULL)

---

## 📝 Migration Validation Checklist

### Table Existence
```sql
-- Run this query to verify all tables
SELECT
  'qualiopi_indicators' as table_name,
  (SELECT COUNT(*) FROM qualiopi_indicators) as row_count
UNION ALL
SELECT 'organization_qualiopi_status', (SELECT COUNT(*) FROM organization_qualiopi_status)
UNION ALL
SELECT 'qualiopi_evidence', (SELECT COUNT(*) FROM qualiopi_evidence)
UNION ALL
SELECT 'satisfaction_surveys', (SELECT COUNT(*) FROM satisfaction_surveys)
UNION ALL
SELECT 'survey_responses', (SELECT COUNT(*) FROM survey_responses)
UNION ALL
SELECT 'document_archive', (SELECT COUNT(*) FROM document_archive)
UNION ALL
SELECT 'document_access_log', (SELECT COUNT(*) FROM document_access_log)
UNION ALL
SELECT 'qualiopi_audit_log', (SELECT COUNT(*) FROM qualiopi_audit_log);
```

### Indicator Seeding
```sql
-- Verify all 32 indicators
SELECT
  COUNT(*) as total_indicators,
  SUM(CASE WHEN focus_level = 'CORE' THEN 1 ELSE 0 END) as core_indicators,
  SUM(CASE WHEN focus_level = 'SECONDARY' THEN 1 ELSE 0 END) as secondary_indicators
FROM qualiopi_indicators;

-- Expected output:
-- total_indicators: 32
-- core_indicators: 3
-- secondary_indicators: 29
```

### Index Creation
```sql
-- Verify indexes
SELECT COUNT(*) as total_indexes
FROM pg_indexes
WHERE tablename IN ('qualiopi_indicators', 'organization_qualiopi_status', 'qualiopi_evidence',
                    'satisfaction_surveys', 'survey_responses', 'document_archive',
                    'document_access_log', 'qualiopi_audit_log');
```

---

## 🔄 Next Steps (Phase 2)

Once migrations are verified:

1. **Backend Services** (2 days)
   - QualioptService (indicator management)
   - SatisfactionSurveyService (survey handling)
   - DocumentArchiveService (archiving)
   - ComplianceReportService (reporting)

2. **API Endpoints** (1.5 days)
   - POST /api/admin/qualiopi/indicators/:id/evidence
   - PUT /api/admin/qualiopi/indicators/:id
   - POST /api/bilans/:bilanId/satisfaction-survey
   - GET /api/admin/qualiopi/surveys/analytics

3. **Frontend** (Phases 4-5)
   - Admin pages for indicators, surveys, archive
   - 15+ React components

---

## ⚠️ Important Notes

1. **Backup Recommendation**: Create a backup before running migrations on production
2. **Order Matters**: Execute migrations in order (008 → 013)
3. **Foreign Keys**: All FK relationships are validated - migrations will fail if parent tables don't exist
4. **Soft Deletes**: Use `deleted_at IS NULL` for active records
5. **Indexes**: All indexes are created for optimal query performance
6. **Comments**: Every table and column has documentation comments for clarity

---

## 📞 Troubleshooting

### Issue: "qualiopi_indicators table already exists"
**Solution**: Check if migration was already run. If so, running again won't cause harm (uses `IF NOT EXISTS`)

### Issue: "Foreign key constraint failed"
**Solution**: Ensure parent tables (organizations, users, bilans) exist with correct data

### Issue: "Permission denied" during migration
**Solution**: Verify Supabase credentials and user role has DDL permissions

### Issue: Indexes not created
**Solution**: Run index creation separately if migrations fail partially

---

**Migration Status**: ✅ READY FOR EXECUTION
**Created by**: Claude Code AI
**Date**: 2025-10-23

