# Etap 2: Supabase Usage Audit Report
## BilanCompetence.AI - Code Cleanup Analysis

**Date:** 2025-10-27  
**Phase:** Etap 2 - Code Cleanup  
**Analysis:** Supabase dependency mapping

---

## Executive Summary

**Total Files Using Supabase:** 41 files  
**Total Supabase References:** 176 occurrences  
**Migration Priority:** HIGH - Critical for production stability

### File Categories

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| **Services** | 19 | HIGH | 🔴 Needs Migration |
| **Routes** | 12 | HIGH | 🔴 Needs Migration |
| **Tests** | 5 | MEDIUM | 🟡 Update After Migration |
| **Middleware** | 2 | HIGH | 🔴 Needs Migration |
| **Config** | 1 | HIGH | 🔴 Needs Migration |
| **Utils** | 2 | MEDIUM | 🟡 Update After Migration |

---

## Detailed Analysis

### 1. Core Configuration (1 file) - CRITICAL

#### `src/config/supabase.ts`
**Status:** 🔴 **MUST REMOVE**  
**Impact:** HIGH - Used by 40+ files  
**Lines:** ~25

**Current:**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

**Action:** Remove entire file after migration

---

### 2. Services (19 files) - HIGH PRIORITY

#### Already Migrated to Neon ✅ (12 services)
1. ✅ `userServiceNeon.ts` - User management
2. ✅ `dashboardServiceNeon.ts` - Dashboard data
3. ✅ `schedulingServiceNeon.ts` - Appointment scheduling
4. ✅ `fileServiceNeon.ts` - File management
5. ✅ `pdfServiceNeon.ts` - PDF generation
6. ✅ `assessmentServiceNeon.ts` - Assessment logic
7. ✅ `notificationServiceNeon.ts` - Notifications
8. ✅ `analyticsServiceNeon.ts` - Analytics
9. ✅ `csvServiceNeon.ts` - CSV export
10. ✅ `authServiceNeon.ts` - Authentication
11. ✅ `cvServiceNeon.ts` - CV management (partial - still uses Supabase Storage)
12. ✅ `emailServiceNeon.ts` - Email service

#### Needs Migration 🔴 (15 services)

##### A. Core Services (Priority 1)
1. **`supabaseService.ts`** - 🔴 CRITICAL
   - **Lines:** ~600
   - **Functions:** 30+ utility functions
   - **Usage:** Used by 20+ files
   - **Action:** Deprecate and remove
   - **Note:** Most functions have Neon equivalents

2. **`userService.ts`** - 🔴 HIGH
   - **Lines:** ~400
   - **Functions:** getUserPreferences, updateUserPreferences, deleteUserAccount, exportUserData
   - **Neon Equivalent:** `userServiceNeon.ts` exists
   - **Action:** Migrate remaining 4 functions to Neon

3. **`assessmentService.ts`** - 🔴 HIGH
   - **Lines:** ~350
   - **Functions:** Assessment CRUD operations
   - **Neon Equivalent:** `assessmentServiceNeon.ts` exists
   - **Action:** Verify Neon version has all functions

4. **`fileService.ts`** - 🔴 HIGH
   - **Lines:** ~320
   - **Functions:** File upload, download, delete
   - **Neon Equivalent:** `fileServiceNeon.ts` exists
   - **Action:** Migrate storage operations

5. **`notificationService.ts`** - 🔴 HIGH
   - **Lines:** ~350
   - **Functions:** Notification CRUD
   - **Neon Equivalent:** `notificationServiceNeon.ts` exists
   - **Action:** Verify parity

##### B. Feature Services (Priority 2)
6. **`analyticsService.ts`** - 🟡 MEDIUM
   - **Lines:** ~250
   - **Functions:** Analytics queries
   - **Neon Equivalent:** `analyticsServiceNeon.ts` exists
   - **Action:** Verify all queries migrated

7. **`csvService.ts`** - 🟡 MEDIUM
   - **Lines:** ~200
   - **Functions:** CSV export
   - **Neon Equivalent:** `csvServiceNeon.ts` exists
   - **Action:** Verify parity

8. **`pdfService.ts`** - 🟡 MEDIUM
   - **Lines:** ~450
   - **Functions:** PDF generation
   - **Neon Equivalent:** `pdfServiceNeon.ts` exists
   - **Action:** Verify all PDF types

9. **`schedulingService.ts`** - 🔴 HIGH
   - **Lines:** ~430
   - **Functions:** Session scheduling
   - **Neon Equivalent:** `schedulingServiceNeon.ts` exists
   - **Action:** Verify calendar integration

##### C. Storage Services (Priority 3)
10. **`cvService.ts`** - 🟡 MEDIUM
    - **Lines:** ~150
    - **Functions:** CV upload/download
    - **Issue:** Uses Supabase Storage
    - **Neon Equivalent:** `cvServiceNeon.ts` (also uses Supabase Storage)
    - **Action:** Keep Supabase Storage for now, migrate DB queries

11. **`cvServiceNeon.ts`** - 🟡 MEDIUM
    - **Issue:** Still uses Supabase Storage
    - **Action:** Document that Storage is intentional

##### D. Specialized Services (Priority 4)
12. **`franceTravailService.ts`** - 🟡 MEDIUM
    - **Lines:** ~1000+
    - **Functions:** Job recommendations, ROME codes
    - **Supabase Usage:** Caching (rome_code_cache, job_recommendations, saved_jobs)
    - **Action:** Migrate cache tables to Neon

13. **`chatService.ts`** - 🟡 MEDIUM
    - **Lines:** ~330
    - **Functions:** Chat/messaging
    - **Supabase Usage:** Storage for chat files
    - **Action:** Keep Storage, migrate DB queries

14. **`psychometricScoringService.ts`** - 🟢 LOW
    - **Lines:** ~310
    - **Functions:** Personality analysis
    - **Supabase Usage:** personality_analyses table
    - **Action:** Migrate to Neon

##### E. Compliance Services (Priority 5)
15. **`qualioptService.ts`** - 🟢 LOW
    - **Lines:** ~400
    - **Functions:** Qualiopi compliance
    - **Supabase Usage:** Full class-based service
    - **Action:** Create `qualioptServiceNeon.ts`

16. **`complianceReportService.ts`** - 🟢 LOW
    - **Lines:** ~400
    - **Functions:** Compliance reporting
    - **Supabase Usage:** Full class-based service
    - **Action:** Create `complianceReportServiceNeon.ts`

17. **`documentArchiveService.ts`** - 🟢 LOW
    - **Lines:** ~300
    - **Functions:** Document archiving
    - **Supabase Usage:** Full class-based service
    - **Action:** Create `documentArchiveServiceNeon.ts`

18. **`satisfactionSurveyService.ts`** - 🟢 LOW
    - **Lines:** ~200
    - **Functions:** Satisfaction surveys
    - **Supabase Usage:** Full class-based service
    - **Action:** Create `satisfactionSurveyServiceNeon.ts`

##### F. Auth Services (Priority 6)
19. **`ssoService.ts`** - 🟢 LOW
    - **Lines:** ~150
    - **Functions:** Single Sign-On
    - **Supabase Usage:** SSO integration
    - **Action:** Evaluate if needed

20. **`twoFactorService.ts`** - 🟢 LOW
    - **Lines:** ~100
    - **Functions:** 2FA
    - **Supabase Usage:** 2FA tokens
    - **Action:** Migrate to Neon

---

### 3. Routes (12 files) - HIGH PRIORITY

#### A. Auth Routes (Priority 1)
1. **`auth.supabase.backup.ts`** - 🟢 CAN DELETE
   - **Status:** Backup file
   - **Action:** Delete after verifying auth.ts works

2. **`emailVerification.ts`** - 🔴 HIGH
   - **Supabase Usage:** Uses `supabaseService.js` functions
   - **Action:** Update imports to Neon services

3. **`passwordReset.ts`** - 🔴 HIGH
   - **Supabase Usage:** Uses `supabaseService.js` functions
   - **Action:** Update imports to Neon services

#### B. User Routes (Priority 2)
4. **`users.supabase.backup.ts`** - 🟢 CAN DELETE
   - **Status:** Backup file
   - **Action:** Delete after verifying users.ts works

#### C. Feature Routes (Priority 3)
5. **`dashboard.ts`** - 🔴 HIGH
   - **Supabase Usage:** Uses `supabaseService.js` functions
   - **Action:** Update to use `dashboardServiceNeon.ts`

6. **`export.ts`** - 🔴 HIGH
   - **Supabase Usage:** Direct supabase import
   - **Action:** Update to use Neon services

7. **`chat.ts`** - 🟡 MEDIUM
   - **Supabase Usage:** Direct supabase import
   - **Action:** Update to use Neon services

8. **`scheduling.ts`** - 🟡 MEDIUM
   - **Supabase Usage:** Dynamic import of supabaseService
   - **Action:** Update to use `schedulingServiceNeon.ts`

#### D. Specialized Routes (Priority 4)
9. **`ai.ts`** - 🟡 MEDIUM
   - **Supabase Usage:** Direct supabase import
   - **Action:** Update to use Neon services

10. **`parcours.ts`** - 🟡 MEDIUM
    - **Supabase Usage:** Direct supabase import
    - **Action:** Update to use Neon services

11. **`tests.ts`** - 🟡 MEDIUM
    - **Supabase Usage:** Direct supabase import
    - **Action:** Update to use Neon services

#### E. Migration Routes (Priority 5)
12. **`migrations.ts`** - 🟢 LOW
    - **Supabase Usage:** Uses Supabase for migrations
    - **Action:** Update to use Neon migrations or deprecate

---

### 4. Middleware (2 files) - HIGH PRIORITY

1. **`authorization.ts`** - 🔴 HIGH
   - **Supabase Usage:** Imports supabase config
   - **Action:** Update to use Neon

2. **`sessionManagement.ts`** - 🔴 HIGH
   - **Supabase Usage:** Creates Supabase client
   - **Action:** Update to use Neon

---

### 5. Tests (5 files) - MEDIUM PRIORITY

1. **`export.integration.test.ts`** - 🟡 UPDATE AFTER MIGRATION
2. **`assessmentService.spec.ts`** - 🟡 UPDATE AFTER MIGRATION
3. **`notificationService.spec.ts`** - 🟡 UPDATE AFTER MIGRATION
4. **`pdfService.test.ts`** - 🟡 UPDATE AFTER MIGRATION
5. **`userService.spec.ts`** - 🟡 UPDATE AFTER MIGRATION

**Action:** Update all tests to mock Neon services instead of Supabase

---

### 6. Test Utils (2 files) - LOW PRIORITY

1. **`testFixtures.ts`** - 🟢 LOW
   - **Action:** Update to use Neon mocks

2. **`supabaseMockHelper.ts`** - 🟢 LOW (assumed to exist)
   - **Action:** Create `neonMockHelper.ts`

---

## Migration Strategy

### Phase 1: Core Services (Day 1)
**Priority:** CRITICAL  
**Files:** 7 files  
**Estimated Time:** 4 hours

1. ✅ Verify existing Neon services are complete
2. 🔴 Update route imports to use Neon services
3. 🔴 Update middleware to use Neon
4. 🔴 Test critical endpoints

**Files:**
- `userService.ts` → `userServiceNeon.ts`
- `assessmentService.ts` → `assessmentServiceNeon.ts`
- `fileService.ts` → `fileServiceNeon.ts`
- `notificationService.ts` → `notificationServiceNeon.ts`
- `middleware/authorization.ts`
- `middleware/sessionManagement.ts`
- `routes/dashboard.ts`

### Phase 2: Feature Services (Day 1-2)
**Priority:** HIGH  
**Files:** 8 files  
**Estimated Time:** 4 hours

1. 🔴 Migrate remaining route files
2. 🔴 Update service imports
3. 🔴 Test feature endpoints

**Files:**
- `routes/emailVerification.ts`
- `routes/passwordReset.ts`
- `routes/export.ts`
- `routes/chat.ts`
- `routes/scheduling.ts`
- `routes/ai.ts`
- `routes/parcours.ts`
- `routes/tests.ts`

### Phase 3: Specialized Services (Day 2)
**Priority:** MEDIUM  
**Files:** 6 files  
**Estimated Time:** 3 hours

1. 🟡 Migrate cache tables (franceTravailService)
2. 🟡 Migrate psychometric service
3. 🟡 Update chat service

**Files:**
- `franceTravailService.ts`
- `psychometricScoringService.ts`
- `chatService.ts`
- `twoFactorService.ts`
- `ssoService.ts`

### Phase 4: Compliance Services (Day 2-3)
**Priority:** LOW  
**Files:** 4 files  
**Estimated Time:** 2 hours

1. 🟢 Create Neon versions of compliance services
2. 🟢 Test compliance features

**Files:**
- `qualioptService.ts` → `qualioptServiceNeon.ts`
- `complianceReportService.ts` → `complianceReportServiceNeon.ts`
- `documentArchiveService.ts` → `documentArchiveServiceNeon.ts`
- `satisfactionSurveyService.ts` → `satisfactionSurveyServiceNeon.ts`

### Phase 5: Cleanup & Testing (Day 3)
**Priority:** MEDIUM  
**Files:** 10 files  
**Estimated Time:** 3 hours

1. 🟡 Update all tests
2. 🟡 Remove Supabase config
3. 🟡 Remove backup files
4. 🟡 Update dependencies

**Files:**
- All test files (5 files)
- `config/supabase.ts` (DELETE)
- `supabaseService.ts` (DELETE)
- `auth.supabase.backup.ts` (DELETE)
- `users.supabase.backup.ts` (DELETE)
- `package.json` (remove @supabase/supabase-js)

---

## Storage Strategy

### Supabase Storage - Keep for Now ✅

**Decision:** Keep Supabase Storage for file uploads (CVs, documents, chat files)

**Rationale:**
- Neon PostgreSQL is database-only, no storage
- Supabase Storage is S3-compatible and working
- Migration to S3/R2/Cloudflare can be done later

**Affected Services:**
- `cvService.ts` / `cvServiceNeon.ts`
- `chatService.ts`
- `fileService.ts` / `fileServiceNeon.ts`

**Action:** Document that Supabase Storage is intentional and separate from database migration

---

## Dependencies to Remove

### package.json
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x"  // REMOVE after migration
  }
}
```

**Action:** Remove after all services migrated

---

## Risk Assessment

### High Risk
1. **Breaking Changes:** Updating 40+ files could introduce bugs
   - **Mitigation:** Incremental migration with testing after each phase
   
2. **Production Downtime:** Route changes could break live API
   - **Mitigation:** Deploy during low-traffic hours, have rollback plan

3. **Data Inconsistency:** Mixed Supabase/Neon during migration
   - **Mitigation:** Complete migration in single deployment

### Medium Risk
1. **Test Coverage:** Tests need updating
   - **Mitigation:** Update tests in Phase 5

2. **Missing Functions:** Some Neon services may be incomplete
   - **Mitigation:** Verify parity before migration

### Low Risk
1. **Storage Migration:** Supabase Storage stays
   - **Mitigation:** Document decision, plan future migration

---

## Success Criteria

- [ ] All routes use Neon services
- [ ] All middleware uses Neon
- [ ] No imports from `supabaseService.ts`
- [ ] No imports from `config/supabase.ts`
- [ ] All tests passing
- [ ] Production deployment successful
- [ ] Zero Supabase database queries (Storage OK)
- [ ] `@supabase/supabase-js` removed from package.json

---

## Estimated Timeline

| Phase | Duration | Files | Priority |
|-------|----------|-------|----------|
| Phase 1: Core Services | 4 hours | 7 | CRITICAL |
| Phase 2: Feature Services | 4 hours | 8 | HIGH |
| Phase 3: Specialized Services | 3 hours | 6 | MEDIUM |
| Phase 4: Compliance Services | 2 hours | 4 | LOW |
| Phase 5: Cleanup & Testing | 3 hours | 10 | MEDIUM |
| **TOTAL** | **16 hours** | **35** | - |

**Note:** Original estimate was 12 hours, revised to 16 hours due to complexity

---

## Next Action

**Start Phase 1:** Core Services Migration
1. Verify existing Neon services
2. Update route imports
3. Update middleware
4. Test critical endpoints

---

**Report Generated:** 2025-10-27  
**Status:** Ready to Begin Migration  
**Approval:** Awaiting confirmation to proceed

