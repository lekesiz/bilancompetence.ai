# Sprint 5/6 - Task 4: France Travail Integration
## Plan Summary (Quick Reference)

**Status**: PLANNING - Ready for Implementation
**Estimated Duration**: 5.5-7 hours (4-6 hours target)
**Type**: Backend Service + API + Frontend UI
**Complexity**: High (External API Integration)

---

## Quick Overview

### What We're Building
A **Job Recommendation Engine** that matches user assessment competencies with real job postings from the France Travail (Pôle emploi) API.

### Key Flow
```
Assessment (with competencies)
    ↓
Extract Skills
    ↓
Map to ROME Codes*
    ↓
Query France Travail API
    ↓
Score & Rank Jobs
    ↓
Display with Match %
    ↓
User Saves/Applies

* ROME = French job classification system
```

---

## Implementation Breakdown

### PHASE 1: Backend Service (2-2.5 hours)
**File**: `apps/backend/src/services/franceTravailService.ts` (800-1000 lines)

**Core Functions**:
```
├─ Authentication
│  ├─ getValidAccessToken()
│  └─ refreshAccessToken()
├─ Job Search
│  ├─ searchJobsByRomeCode()
│  ├─ searchJobsByLocation()
│  └─ advancedJobSearch()
├─ ROME Code Management
│  ├─ getRomeCodeDetails()
│  ├─ searchRomeCodes()
│  └─ getRelatedRomeCodes()
├─ Competency Mapping
│  ├─ mapCompetenciesToRomeCodes()
│  ├─ findMatchingRomeCodes()
│  ├─ calculateSkillMatch()
│  └─ scoreJobMatches()
├─ Data Processing
│  ├─ enrichJobData()
│  ├─ formatJobForDisplay()
│  ├─ cacheJobResults()
│  └─ validateAndParseResponse()
└─ Error Handling
   ├─ handleApiError()
   ├─ validateCredentials()
   └─ retryWithBackoff()
```

**Key Technical Details**:
- ✅ OAuth 2.0 / API Key authentication with token caching
- ✅ Competency → ROME code mapping (fuzzy matching)
- ✅ Job scoring based on skill match percentage
- ✅ Response caching (TTL: 1 hour)
- ✅ Error handling with retry logic

### PHASE 2: Backend API Endpoints (1-1.5 hours)
**File**: `apps/backend/src/routes/recommendations.ts` (350-450 lines)

**New Endpoints**:
```
1. POST /api/recommendations/jobs
   → Get job recommendations for user based on assessment

2. POST /api/recommendations/:jobId/save
   → Save a job recommendation

3. GET /api/users/:userId/saved-jobs
   → Retrieve user's saved jobs

4. GET /api/rome-codes/:code
   → Get ROME code details and related information

5. GET /api/rome-codes/search
   → Search ROME codes by keyword
```

**Features**:
- ✅ JWT authentication required
- ✅ Input validation (filters, IDs)
- ✅ Rate limiting
- ✅ Comprehensive error responses
- ✅ JSON response formatting

### PHASE 3: Frontend Components (1-1.5 hours)
**Directory**: `apps/frontend/app/(protected)/`

**New Components** (5 components):
```
1. JobRecommendationCard.tsx
   └─ Single job card with match score badge

2. JobRecommendationsList.tsx
   └─ Filterable, sortable job list

3. JobCompetencyMatcher.tsx
   └─ Visual skill match comparison

4. JobDetailsModal.tsx
   └─ Detailed job view

5. SavedJobsList.tsx
   └─ User's saved recommendations
```

**Features**:
- ✅ Color-coded match scores (red/yellow/green)
- ✅ Competency visualization (matched ✓ / missing ✗)
- ✅ Responsive design (mobile + desktop)
- ✅ Loading & error states
- ✅ Accessibility (WCAG 2.1)

### PHASE 4: Frontend Pages (0.5-1 hour)
**New Pages**:
```
1. /recommendations
   └─ Main job recommendations dashboard

2. /saved-jobs
   └─ Retrieve and view saved recommendations

3. /assessments/[id] (modified)
   └─ Add "Recommended Jobs" section
```

### PHASE 5: Testing & Integration (0.5-1 hour)
```
✅ Unit tests (60+ test cases)
✅ Integration tests (20+ test cases)
✅ E2E workflow tests
✅ Performance optimization
✅ Cache validation
```

---

## France Travail API Integration

### Authentication
```
Credentials needed (in .env):
- FRANCE_TRAVAIL_API_BASE_URL
- FRANCE_TRAVAIL_CLIENT_ID
- FRANCE_TRAVAIL_CLIENT_SECRET
- FRANCE_TRAVAIL_API_KEY
- FRANCE_TRAVAIL_GRANT_TYPE (client_credentials)
```

### Key APIs Used
```
1. GET /offres/search (Search jobs by ROME code)
   Query: codeROME, range, salary, contractType

2. GET /referentiel/codeROME/{code} (ROME code details)

3. GET /referentiel/codeROME/search (Search ROME codes)
```

### Example Flow
```
User: Java, Python, Docker (Expert, Advanced, Intermediate)
              ↓
Map to ROME: E1101 (Ingénieur R&D), E1102, C1501
              ↓
API Call: Search jobs for E1101 + location filter
              ↓
Results: 142 jobs found
              ↓
Score each job:
- Java (Expert) = high match
- Python (Advanced) = high match
- Docker (Intermediate) = medium match
              ↓
Final Score: 92%
```

---

## Database Schema Updates

### New Tables
```sql
CREATE TABLE job_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID,
  assessment_id UUID,
  job_id STRING,
  france_travail_job_data JSONB,
  match_score INTEGER,
  matched_competencies TEXT[],
  created_at TIMESTAMP
);

CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY,
  user_id UUID,
  job_recommendation_id UUID,
  france_travail_job_id STRING,
  job_data JSONB,
  created_at TIMESTAMP
);

CREATE TABLE rome_code_cache (
  code STRING PRIMARY KEY,
  libelle STRING,
  definition TEXT,
  competences TEXT[],
  cached_at TIMESTAMP
);
```

---

## Environment Variables to Add

```bash
# .env.example additions
FRANCE_TRAVAIL_API_BASE_URL=https://api.francetravail.io/v1
FRANCE_TRAVAIL_CLIENT_ID=your_client_id
FRANCE_TRAVAIL_CLIENT_SECRET=your_client_secret
FRANCE_TRAVAIL_API_KEY=your_api_key
FRANCE_TRAVAIL_GRANT_TYPE=client_credentials
FRANCE_TRAVAIL_SCOPE=api/readonly

# Caching
JOB_RECOMMENDATION_CACHE_TTL=3600
ROME_CODE_CACHE_TTL=86400

# Rate limiting
FRANCE_TRAVAIL_RATE_LIMIT=100
```

---

## Success Criteria

### ✅ Functional
- [ ] Service authenticates with France Travail API
- [ ] Jobs retrieved based on competencies
- [ ] Match scores calculated accurately (0-100%)
- [ ] Users can save recommendations
- [ ] Results cached (TTL: 1 hour)
- [ ] All error scenarios handled

### ✅ Performance
- [ ] Recommendation fetch < 2 seconds
- [ ] List render < 500ms
- [ ] Cache hit rate > 80%
- [ ] No N+1 queries

### ✅ Quality
- [ ] TypeScript: Zero errors
- [ ] Test coverage: 70%+
- [ ] All endpoints documented
- [ ] User-friendly errors

### ✅ UX
- [ ] Clear match score display
- [ ] Smooth loading states
- [ ] Mobile responsive
- [ ] Intuitive filtering

---

## File Structure Overview

```
apps/backend/
├── src/
│   ├── services/
│   │   └── franceTravailService.ts (NEW - 800+ lines)
│   ├── routes/
│   │   └── recommendations.ts (NEW - 350+ lines)
│   ├── __tests__/
│   │   ├── services/
│   │   │   └── franceTravailService.test.ts (NEW - 600+ lines)
│   │   └── routes/
│   │       └── recommendations.integration.test.ts (NEW - 500+ lines)
│   └── index.ts (MODIFY - add route import)
│
apps/frontend/
├── app/(protected)/
│   ├── recommendations/
│   │   └── page.tsx (NEW)
│   ├── saved-jobs/
│   │   └── page.tsx (NEW)
│   └── assessments/[id]/
│       └── page.tsx (MODIFY - add jobs section)
├── components/
│   ├── JobRecommendationCard.tsx (NEW)
│   ├── JobRecommendationsList.tsx (NEW)
│   ├── JobCompetencyMatcher.tsx (NEW)
│   ├── JobDetailsModal.tsx (NEW)
│   └── SavedJobsList.tsx (NEW)
└── hooks/
    └── useJobRecommendations.ts (NEW)

Root/
├── SPRINT5_TASK4_FRANCE_TRAVAIL_INTEGRATION_PLAN.md
├── SPRINT5_TASK4_PLAN_SUMMARY.md (this file)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| API downtime | Fallback to cached data, graceful degradation |
| Rate limit exceeded | Queue system, caching, intelligent batching |
| Inaccurate matching | Curated mapping, continuous improvement |
| Performance issues | Caching, pagination, lazy loading |
| Auth failures | Comprehensive error handling, monitoring |

---

## Timeline

```
Phase 1 (Backend Service): 2-2.5 hrs ████████░░
Phase 2 (API Endpoints):   1-1.5 hrs ██████░░░░
Phase 3 (Components):      1-1.5 hrs ██████░░░░
Phase 4 (Pages):           0.5-1 hr  ███░░░░░░░
Phase 5 (Testing):         0.5-1 hr  ███░░░░░░░
                          ───────────────────────
TOTAL:                     5.5-7 hrs

Target: 4-6 hours (with focused execution)
```

---

## Key Implementation Details

### Competency Mapping Algorithm
```
1. Extract user competencies from assessment
   Example: ["Java", "Spring Boot", "Docker"]

2. Match each to ROME codes:
   - Exact match (lookup table)
   - Fuzzy match (string similarity > 0.7)
   - Semantic match (optional: embeddings)

3. Weight by user proficiency:
   - Expert → 1.0x weight
   - Advanced → 0.9x weight
   - Intermediate → 0.7x weight
   - Beginner → 0.5x weight

4. Score each ROME code:
   - Sum all matching competency weights
   - Normalize to 0-100 scale

5. Search jobs for top ROME codes
   - Limit API calls (max 3-5 ROME codes)
   - Combine results
   - Score each job against user competencies

6. Calculate final job match score:
   - Count matched vs required skills
   - Bonus points for "nice-to-have" matches
   - Penalty for missing critical skills
   - Final: (matched / required) × 100
```

### Caching Strategy
```
Cache Layer 1: Token Cache (Memory)
- Store: Access token + expiry time
- TTL: Until token expires
- Hit rate: ~99%

Cache Layer 2: Job Recommendations Cache
- Key: {userId}_{assessmentId}_{filters_hash}
- TTL: 1 hour
- Storage: Redis or in-memory
- Hit rate target: > 80%

Cache Layer 3: ROME Code Cache
- Key: {romeCode}
- TTL: 24 hours
- Storage: Database + memory
- Hit rate target: > 90%
```

---

## Approval Checklist

Before proceeding with implementation, please verify:

- [ ] Plan addresses all requirements
- [ ] Architecture is sound
- [ ] Timeline is realistic
- [ ] Risk mitigation is adequate
- [ ] Frontend/backend approaches are correct
- [ ] Environment variables are identified
- [ ] Success criteria are clear
- [ ] Testing strategy is comprehensive

---

**Plan Status**: ✅ Ready for Implementation
**Next Step**: User approval → Begin Phase 1 (Backend Service)
**Prepared by**: Claude (claude@anthropic.com)
**Date**: 2025-10-22

