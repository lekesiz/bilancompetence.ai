# Sprint 5/6 - Task 4: France Travail Integration Plan
## Job Matching & Recommendations System

**Date**: 2025-10-22
**Status**: PLANNING
**Task**: Sprint 5/6 - Task 4: France Travail Entegrasyonunu Geliştir
**Estimated Duration**: 4-6 hours

---

## Executive Summary

Implement a comprehensive job matching system that leverages user assessment competencies to find relevant job postings from France Travail (eski adıyla Pôle emploi) API. The system will analyze user skills and interests to provide personalized job recommendations.

### Key Objectives
1. ✅ Develop franceTravailService backend service for API integration
2. ✅ Create backend API endpoints for job matching
3. ✅ Build frontend UI components for job recommendations
4. ✅ Implement competency-to-ROME code mapping
5. ✅ Add comprehensive error handling and caching

**Target**: Production-ready job matching system integrated with assessment workflow

---

## Part 1: France Travail API Integration Strategy

### 1.1 France Travail API Overview

**API Type**: RESTful HTTP API
**Base URL**: https://api.francetravail.io/v1 (or equivalent)
**Authentication**: OAuth 2.0 / API Key Bearer Token
**Rate Limiting**: Typically 100-1000 requests/hour (depends on tier)
**Response Format**: JSON

**Key Concepts**:
- **ROME Code**: Classification system for jobs (Répertoire Opérationnel des Métiers et des Emplois)
  - Example: E1101 = Ingénieur R&D
  - Example: C1503 = Vente de biens d'équipement
  - Hierarchical: Code1 → Code2 → Code3
- **Job Posting (Offre)**: Individual job listings with salary, location, skills required
- **Skills Mapping**: Linking competencies to required skills

### 1.2 Authentication Approach

**Method**: OAuth 2.0 or API Key (Bearer Token)

**Configuration**:
```
Environment Variables needed:
- FRANCE_TRAVAIL_API_BASE_URL=https://api.francetravail.io/v1
- FRANCE_TRAVAIL_CLIENT_ID=your_client_id
- FRANCE_TRAVAIL_CLIENT_SECRET=your_client_secret
- FRANCE_TRAVAIL_API_KEY=your_api_key (if using key-based auth)
- FRANCE_TRAVAIL_GRANT_TYPE=client_credentials
- FRANCE_TRAVAIL_SCOPE=api/readonly
```

**Implementation**:
```typescript
// franceTravailService.ts - Authentication section
class FranceTravailService {
  private accessToken: string | null = null;
  private tokenExpiryTime: number = 0;

  async getValidAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiryTime) {
      return this.accessToken;
    }

    // Refresh token if expired
    const newToken = await this.refreshAccessToken();
    this.accessToken = newToken.access_token;
    this.tokenExpiryTime = Date.now() + (newToken.expires_in * 1000);

    return this.accessToken;
  }

  private async refreshAccessToken() {
    const response = await fetch(
      `${this.baseUrl}/oauth/authorize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: process.env.FRANCE_TRAVAIL_GRANT_TYPE!,
          client_id: process.env.FRANCE_TRAVAIL_CLIENT_ID!,
          client_secret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET!,
          scope: process.env.FRANCE_TRAVAIL_SCOPE!,
        }).toString(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to authenticate with France Travail API');
    }

    return await response.json();
  }
}
```

### 1.3 Key API Endpoints to Use

#### 1. Search Job Postings (Offres d'emploi)
```
GET /offres/search
Query Parameters:
  - codeROME: string (required) - ROME code to search for
  - page: number (optional) - Pagination
  - range: string (optional) - Location code (ex: "75" for Paris)
  - minSalary: number (optional) - Minimum salary
  - contractType: string (optional) - CDI, CDD, Stage, etc.

Response:
{
  "resultats": [
    {
      "id": "12345",
      "intitule": "Ingénieur Senior Java",
      "entreprise": "TechCorp",
      "salaireMois": 3500,
      "dateCreation": "2025-10-20",
      "lieuTravail": { "codePostal": "75001" },
      "description": "Nous recherchons...",
      "competences": ["Java", "Microservices", "Docker"],
      "typeContrat": "CDI",
      "typePublicCible": ["Demandeur d'emploi", "Salarié"]
    }
  ],
  "nbResultats": 142,
  "nbPages": 3
}
```

#### 2. Get ROME Code Details
```
GET /referentiel/codeROME/{code}
Response:
{
  "code": "E1101",
  "libelle": "Ingénieur R&D",
  "definition": "Definition de la profession...",
  "formations": ["Bac+5 Informatique", "Bac+5 Électronique"],
  "competences": ["Programmation", "Gestion de projet"],
  "alternativeCodes": ["E1102", "E1103"]
}
```

#### 3. Search ROME Codes by Keywords
```
GET /referentiel/codeROME/search
Query Parameters:
  - keyword: string - Search keyword
  - limit: number - Max results

Response:
{
  "resultats": [
    {
      "code": "E1101",
      "libelle": "Ingénieur R&D",
      "similarity": 0.95
    },
    {
      "code": "C1503",
      "libelle": "Vente de biens d'équipement",
      "similarity": 0.42
    }
  ]
}
```

---

## Part 2: Backend Service Design (franceTravailService.ts)

### 2.1 Service Architecture

**File Location**: `/apps/backend/src/services/franceTravailService.ts`
**Size Estimate**: 800-1000 lines
**Dependencies**:
- fetch API (native)
- Node.js crypto (for token management)
- Supabase client (for data fetching)
- Logger service
- Cache service (optional, for performance)

### 2.2 Core Functions

#### A. Authentication Functions
```typescript
// Token management
class FranceTravailService {

  // Get valid access token (refresh if expired)
  async getValidAccessToken(): Promise<string>

  // Refresh token from OAuth endpoint
  private async refreshAccessToken(): Promise<TokenResponse>

  // Cache token locally to reduce API calls
  private cacheToken(token: string, expiresIn: number): void
}
```

#### B. Job Search Functions
```typescript
// Search jobs by ROME code(s)
async searchJobsByRomeCode(
  romeCode: string,
  options?: {
    page?: number;
    range?: string;
    minSalary?: number;
    contractType?: string;
  }
): Promise<JobSearchResult>

// Search jobs by location
async searchJobsByLocation(
  location: string,
  options?: JobSearchOptions
): Promise<JobSearchResult>

// Advanced job search with filters
async advancedJobSearch(
  filters: JobSearchFilters
): Promise<JobSearchResult>
```

#### C. ROME Code Functions
```typescript
// Get ROME code details
async getRomeCodeDetails(code: string): Promise<RomeCodeDetails>

// Search ROME codes by keyword
async searchRomeCodes(
  keyword: string,
  limit?: number
): Promise<RomeCodeSearchResult[]>

// Get related ROME codes
async getRelatedRomeCodes(code: string): Promise<string[]>
```

#### D. Competency Mapping Functions
```typescript
// Map user competencies to ROME codes
async mapCompetenciesToRomeCodes(
  competencies: string[],
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): Promise<MappingResult>

// Find best matching ROME codes for user skills
async findMatchingRomeCodes(
  userCompetencies: CompetencyProfile[]
): Promise<RomeCodeMatch[]>

// Calculate skill match percentage
private calculateSkillMatch(
  userSkills: string[],
  jobRequiredSkills: string[]
): number

// Score jobs based on skill match
async scoreJobMatches(
  userId: string,
  jobs: JobPosting[]
): Promise<ScoredJob[]>
```

#### E. Data Processing Functions
```typescript
// Enrich job data with additional context
async enrichJobData(job: JobPosting): Promise<EnrichedJob>

// Format job data for frontend
formatJobForDisplay(job: JobPosting): FormattedJob

// Cache job data for performance
async cacheJobResults(
  cacheKey: string,
  data: JobPosting[],
  ttlSeconds?: number
): Promise<void>

// Get cached job data
async getCachedJobResults(cacheKey: string): Promise<JobPosting[] | null>

// Parse and validate France Travail API response
validateAndParseResponse(response: unknown): JobSearchResult
```

#### F. Error Handling Functions
```typescript
// Handle specific API errors
private handleApiError(error: any): Error

// Validate API credentials
private async validateCredentials(): Promise<boolean>

// Retry failed API requests with exponential backoff
private async retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries?: number
): Promise<T>
```

### 2.3 Data Types/Interfaces

```typescript
// Token types
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// ROME Code types
interface RomeCodeDetails {
  code: string;
  libelle: string;
  definition: string;
  formations: string[];
  competences: string[];
  alternativeCodes: string[];
}

interface RomeCodeSearchResult {
  code: string;
  libelle: string;
  similarity: number; // 0-1
}

// Job posting types
interface JobPosting {
  id: string;
  intitule: string;
  entreprise: string;
  salaireMois: number;
  dateCreation: string;
  lieuTravail: { codePostal: string; ville: string };
  description: string;
  competences: string[];
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Apprentissage';
  typePublicCible: string[];
  source: 'france_travail';
}

interface JobSearchResult {
  resultats: JobPosting[];
  nbResultats: number;
  nbPages: number;
  page: number;
}

// Skill matching types
interface CompetencyProfile {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  matchingRomeCodes?: string[];
  importance?: number; // 0-1
}

interface RomeCodeMatch {
  code: string;
  libelle: string;
  matchScore: number; // 0-100
  reasonsToMatch: string[];
  gap?: string[]; // Missing competencies
}

interface ScoredJob extends JobPosting {
  matchScore: number; // 0-100
  matchedCompetencies: string[];
  missingCompetencies: string[];
  salaryMatch: 'low' | 'medium' | 'high';
  locationMatch: 'far' | 'medium' | 'close';
  recommendationReason: string;
}

// User matching types
interface UserJobMatch {
  jobId: string;
  job: ScoredJob;
  userId: string;
  matchedAt: Date;
  viewed: boolean;
  saved: boolean;
  applied: boolean;
}

interface JobRecommendationRequest {
  userId?: string;
  assessmentId?: string;
  limit?: number; // Default: 10
  filters?: {
    minSalary?: number;
    maxSalary?: number;
    contractTypes?: string[];
    locations?: string[];
    maxDistance?: number; // km from user location
  };
}
```

### 2.4 Competency-to-ROME Mapping Strategy

**Approach**: Multi-level mapping with fuzzy matching

```typescript
// Static mapping table (database or constant)
COMPETENCY_TO_ROME_MAP = {
  'Java': ['E1101', 'E1102', 'C1501'],
  'Python': ['E1101', 'E1102', 'E1103'],
  'Project Management': ['E1106', 'M1101', 'M1102'],
  'Leadership': ['M1101', 'M1102', 'E1108'],
  'Sales': ['C1503', 'C1504', 'C1505'],
  'Marketing': ['M1507', 'M1402'],
  'French Language': ['K1202', 'K2406'],
  'English Language': ['K1202', 'K2406'],
  'Data Analysis': ['E1101', 'E1104', 'M1501'],
  'Machine Learning': ['E1101', 'E1104', 'E1103'],
};

// Algorithm:
// 1. Extract user competencies from assessment
// 2. Match each competency to ROME codes using:
//    a. Exact match (if exists in map)
//    b. Fuzzy string match (similarity > 0.7)
//    c. Semantic similarity (using embeddings if available)
// 3. Weight matches by:
//    a. User proficiency level
//    b. Competency importance to user
//    c. ROME code relevance score
// 4. Aggregate and rank ROME codes by match score
// 5. Get job postings for top ROME codes
```

---

## Part 3: Backend API Endpoint Design

### 3.1 New Endpoints to Create

#### Endpoint 1: Get Job Recommendations for User
```
POST /api/recommendations/jobs
or
GET /api/users/:userId/job-recommendations

Authentication: Required (JWT token)

Request Body:
{
  "assessmentId": "uuid" (optional),
  "limit": 10,
  "filters": {
    "minSalary": 2000,
    "maxSalary": 5000,
    "contractTypes": ["CDI", "CDD"],
    "locations": ["75", "92"],
    "maxDistance": 50
  }
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "jobs": [
      {
        "jobId": "12345",
        "intitule": "Ingénieur Senior Java",
        "entreprise": "TechCorp",
        "salaireMois": 3500,
        "matchScore": 92,
        "matchedCompetencies": ["Java", "Microservices"],
        "missingCompetencies": ["Kubernetes"],
        "recommendationReason": "92% match based on your Java expertise",
        "lieuTravail": { "codePostal": "75001", "ville": "Paris" },
        "typeContrat": "CDI"
      }
    ],
    "totalCount": 42,
    "processingTime": 245,
    "competenciesAnalyzed": ["Java", "Spring Boot", "Docker"]
  },
  "timestamp": "2025-10-22T10:30:00Z"
}

Error Responses:
- 401: Unauthorized
- 403: Assessment access forbidden
- 404: Assessment not found
- 422: Invalid filters
- 429: Rate limit exceeded
- 500: France Travail API error
- 503: Service temporarily unavailable
```

#### Endpoint 2: Save Job Recommendation
```
POST /api/recommendations/:jobId/save
or
POST /api/users/:userId/saved-jobs

Authentication: Required

Request Body:
{
  "jobId": "12345",
  "assessmentId": "uuid" (optional),
  "notes": "Intéressant pour mon évolution" (optional)
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "id": "saved-job-id",
    "jobId": "12345",
    "userId": "user-id",
    "savedAt": "2025-10-22T10:30:00Z",
    "job": { /* job details */ }
  }
}
```

#### Endpoint 3: Get Saved Jobs
```
GET /api/users/:userId/saved-jobs

Authentication: Required

Query Parameters:
- page: number (default 1)
- limit: number (default 10)
- sort: 'recent' | 'score' (default: recent)

Response (200 OK):
{
  "status": "success",
  "data": {
    "jobs": [ /* array of saved jobs */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

#### Endpoint 4: Get ROME Code Details
```
GET /api/rome-codes/:code

Authentication: Optional

Response (200 OK):
{
  "status": "success",
  "data": {
    "code": "E1101",
    "libelle": "Ingénieur R&D",
    "definition": "...",
    "formations": ["Bac+5"],
    "competences": ["Java", "Python"],
    "relatedCodes": ["E1102", "E1103"]
  }
}
```

#### Endpoint 5: Search ROME Codes
```
GET /api/rome-codes/search?keyword=ingenieur

Authentication: Optional

Query Parameters:
- keyword: string (required)
- limit: number (optional, default 10)

Response (200 OK):
{
  "status": "success",
  "data": {
    "results": [
      {
        "code": "E1101",
        "libelle": "Ingénieur R&D",
        "similarity": 0.95
      }
    ]
  }
}
```

### 3.2 Error Handling Strategy

```typescript
// Specific error codes for frontend handling
{
  "FRANCE_TRAVAIL_API_ERROR": "France Travail API is temporarily unavailable",
  "INVALID_ROME_CODE": "Invalid ROME code provided",
  "NO_JOBS_FOUND": "No jobs found matching your criteria",
  "ASSESSMENT_NOT_FOUND": "Assessment not found or access denied",
  "RATE_LIMIT_EXCEEDED": "Too many requests. Please try again later",
  "COMPETENCY_MAPPING_FAILED": "Could not map competencies to jobs",
  "AUTHENTICATION_REQUIRED": "Authentication token is required",
}
```

---

## Part 4: Frontend Components & Pages

### 4.1 New Components to Create

#### Component 1: JobRecommendationCard.tsx
```typescript
// Displays single job recommendation with match score
Props:
- job: ScoredJob
- onSave: (jobId: string) => void
- onApply: (jobId: string) => void
- showDetailedMatch?: boolean

Features:
- Job title, company, location
- Match score badge (color-coded: red <50%, yellow 50-80%, green >80%)
- Matched competencies (pills with checkmarks)
- Missing competencies (pills with warning icons)
- Salary range
- Contract type badge
- Save button
- "View details" link
```

#### Component 2: JobRecommendationsList.tsx
```typescript
// List of job recommendations with filtering & sorting
Props:
- jobs: ScoredJob[]
- loading: boolean
- error?: string
- onLoadMore: () => void
- onSaveJob: (jobId: string) => void

Features:
- Grid or list view toggle
- Sort options: match score, salary, date posted
- Filter options: contract type, salary range, location
- Pagination or infinite scroll
- Empty state messaging
- Error handling with retry button
```

#### Component 3: JobCompetencyMatcher.tsx
```typescript
// Visual representation of skill match
Props:
- userCompetencies: string[]
- jobRequiredSkills: string[]
- matchPercentage: number

Features:
- Venn diagram or comparison table
- Visual skill match percentage
- Gap analysis (missing skills)
- Learning path suggestions (future)
```

#### Component 4: JobDetailsModal.tsx
```typescript
// Detailed view of job posting
Props:
- job: JobPosting
- matchScore?: number
- onClose: () => void
- onApply: () => void
- onSave: () => void

Features:
- Full job description
- Company details
- Salary breakdown
- Skills required
- Location map
- Contract type details
- Quick apply button
- Share button
```

#### Component 5: SavedJobsList.tsx
```typescript
// Display user's saved job recommendations
Props:
- userId: string

Features:
- List of saved jobs
- Remove from saved
- Apply directly
- Sort and filter
- Export as PDF
```

### 4.2 New Pages/Sections to Create

#### Page 1: Job Recommendations Dashboard
**Location**: `/apps/frontend/app/(protected)/recommendations/page.tsx`

```
Layout:
┌──────────────────────────────────────┐
│  Job Recommendations for You         │
├──────────────────────────────────────┤
│ 📊 Matching your competencies:      │
│   Java (Advanced) ✓                 │
│   Spring Boot (Intermediate) ✓      │
│   Docker (Beginner) ✗               │
├──────────────────────────────────────┤
│ 🔍 Top 10 Matching Jobs:            │
│ ┌─ Job Card 1 (92% match)           │
│ ├─ Job Card 2 (87% match)           │
│ ├─ Job Card 3 (85% match)           │
│ └─ ...                              │
├──────────────────────────────────────┤
│ [Load More]  [Save All] [Export]    │
└──────────────────────────────────────┘
```

Features:
- Loading state while fetching jobs
- Error state with retry
- Competency analysis display
- Job cards with match scores
- Filter/sort options
- Save and apply buttons

#### Page 2: Saved Jobs
**Location**: `/apps/frontend/app/(protected)/saved-jobs/page.tsx`

```
Layout:
┌──────────────────────────────────────┐
│ Saved Job Recommendations (12)       │
├──────────────────────────────────────┤
│ Sort: [Most Recent ▼]  Filter: [▼]  │
├──────────────────────────────────────┤
│ ✓ Ingénieur Senior Java - TechCorp  │
│   92% match • CDI • Paris           │
│ ✓ Développeur Python - StartupXY   │
│   87% match • CDI • Île-de-France   │
│ ...                                 │
└──────────────────────────────────────┘
```

Features:
- View all saved jobs
- Remove from saved
- Apply to job
- View job details
- Pagination

#### Page 3: Assessment Results with Recommendations
**Location**: Modify `/apps/frontend/app/(protected)/assessments/[id]/page.tsx`

Add section:
```
┌─────────────────────────────────────┐
│ 💼 Recommended Jobs Based on This   │
│    Assessment                       │
├─────────────────────────────────────┤
│ Based on your competencies:         │
│ • Java (Advanced)                   │
│ • Spring Boot (Intermediate)        │
│ • Agile/Scrum (Advanced)            │
│                                     │
│ [View Matching Jobs] →              │
└─────────────────────────────────────┘
```

---

## Part 5: Data Flow & Integration Points

### 5.1 Complete User Flow

```
User completes assessment
    ↓
Assessment saved with competencies
    ↓
User navigates to "Job Recommendations"
    ↓
Frontend fetches: GET /api/recommendations/jobs?assessmentId=X
    ↓
Backend:
  1. Load assessment from DB
  2. Extract user competencies
  3. Map competencies to ROME codes
  4. Call France Travail API: search jobs for ROME codes
  5. Score & rank results by match
  6. Cache results (1 hour TTL)
  7. Return top 10 jobs
    ↓
Frontend displays job cards with match scores
    ↓
User can:
  - View job details
  - Save job (POST /api/recommendations/:jobId/save)
  - Apply to job (future)
  - View more jobs [Load More]
```

### 5.2 Database Schema Updates

**New Tables Needed**:

```sql
-- Save user's job matches
CREATE TABLE job_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  assessment_id UUID REFERENCES assessments(id),
  job_id STRING NOT NULL,
  france_travail_job_data JSONB,
  match_score INTEGER,
  matched_competencies TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track saved jobs
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  job_recommendation_id UUID REFERENCES job_recommendations(id),
  france_travail_job_id STRING NOT NULL,
  job_data JSONB,
  notes TEXT,
  applied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cache ROME code details
CREATE TABLE rome_code_cache (
  code STRING PRIMARY KEY,
  libelle STRING,
  definition TEXT,
  formations TEXT[],
  competences TEXT[],
  cached_at TIMESTAMP DEFAULT NOW()
);

-- Track competency to ROME mappings
CREATE TABLE competency_rome_mappings (
  id UUID PRIMARY KEY,
  competency_name STRING,
  rome_code STRING,
  confidence_score FLOAT,
  created_by STRING,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Part 6: Implementation Timeline & Phases

### Phase 1: Backend Service (Est. 2-2.5 hours)
- [x] Plan created
- [ ] franceTravailService.ts implementation
- [ ] Authentication/token management
- [ ] Job search and ROME code functions
- [ ] Competency mapping logic
- [ ] Error handling
- [ ] Type definitions
- [ ] Service testing (Jest unit tests)

### Phase 2: Backend API Endpoints (Est. 1-1.5 hours)
- [ ] Create routes file: `/apps/backend/src/routes/recommendations.ts`
- [ ] Implement all 5 endpoints
- [ ] Authorization checks
- [ ] Input validation
- [ ] Error handling
- [ ] Response formatting

### Phase 3: Frontend Components (Est. 1-1.5 hours)
- [ ] JobRecommendationCard component
- [ ] JobRecommendationsList component
- [ ] JobDetailsModal component
- [ ] SavedJobsList component
- [ ] Styling with Tailwind
- [ ] Loading & error states

### Phase 4: Frontend Pages (Est. 0.5-1 hour)
- [ ] Create recommendations page
- [ ] Create saved-jobs page
- [ ] Integrate with assessment detail page
- [ ] Update navigation

### Phase 5: Integration & Testing (Est. 0.5-1 hour)
- [ ] End-to-end workflow testing
- [ ] France Travail API testing
- [ ] Performance optimization
- [ ] Caching setup
- [ ] Error scenario testing

**Total Estimated Time**: 5.5-7 hours

---

## Part 7: Environment Variables & Configuration

### 7.1 Required Environment Variables (add to .env.example)

```bash
# France Travail API Configuration
FRANCE_TRAVAIL_API_BASE_URL=https://api.francetravail.io/v1
FRANCE_TRAVAIL_CLIENT_ID=your_client_id
FRANCE_TRAVAIL_CLIENT_SECRET=your_client_secret
FRANCE_TRAVAIL_API_KEY=your_api_key
FRANCE_TRAVAIL_GRANT_TYPE=client_credentials
FRANCE_TRAVAIL_SCOPE=api/readonly

# Caching Configuration
JOB_RECOMMENDATION_CACHE_TTL=3600  # 1 hour
ROME_CODE_CACHE_TTL=86400  # 24 hours

# API Rate Limiting
FRANCE_TRAVAIL_RATE_LIMIT=100  # requests per hour
```

### 7.2 Configuration Management

```typescript
// config/franceTravailConfig.ts
export const franceTravailConfig = {
  baseUrl: process.env.FRANCE_TRAVAIL_API_BASE_URL,
  clientId: process.env.FRANCE_TRAVAIL_CLIENT_ID,
  clientSecret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET,
  apiKey: process.env.FRANCE_TRAVAIL_API_KEY,
  grantType: process.env.FRANCE_TRAVAIL_GRANT_TYPE || 'client_credentials',
  scope: process.env.FRANCE_TRAVAIL_SCOPE || 'api/readonly',
  cacheTTL: parseInt(process.env.JOB_RECOMMENDATION_CACHE_TTL || '3600'),
  romeCodeCacheTTL: parseInt(process.env.ROME_CODE_CACHE_TTL || '86400'),
  rateLimit: parseInt(process.env.FRANCE_TRAVAIL_RATE_LIMIT || '100'),
};
```

---

## Part 8: Testing Strategy

### 8.1 Backend Testing

**Unit Tests** (40+ test cases):
- Token refresh logic
- Job search with various filters
- ROME code mapping
- Competency matching
- Error handling
- Response validation

**Integration Tests** (20+ test cases):
- End-to-end job recommendation flow
- France Travail API interaction
- Database operations
- Caching behavior

### 8.2 Frontend Testing

**Component Tests** (30+ test cases):
- JobRecommendationCard rendering
- Job list filtering/sorting
- User interactions (save, apply)
- Loading and error states

**E2E Tests**:
- Complete recommendation flow
- Job details view
- Save and retrieve saved jobs

---

## Part 9: Success Criteria

### ✅ Functional Requirements
- [ ] Service authenticates with France Travail API
- [ ] Jobs are retrieved based on user competencies
- [ ] Match scores are calculated and displayed
- [ ] Users can save recommendations
- [ ] Recommendations are cached for performance
- [ ] Error handling works for all error scenarios

### ✅ Performance Requirements
- [ ] Job recommendation fetch < 2 seconds
- [ ] List rendering < 500ms
- [ ] No N+1 database queries
- [ ] Cache hit rate > 80% for repeated searches

### ✅ Code Quality
- [ ] TypeScript: Zero type errors
- [ ] Test coverage: 70%+ for critical paths
- [ ] All endpoints documented
- [ ] Error messages are user-friendly

### ✅ User Experience
- [ ] Clear match score visualization
- [ ] Smooth loading states
- [ ] Intuitive filtering/sorting
- [ ] Mobile responsive

---

## Part 10: Deployment & Monitoring

### 10.1 Pre-Deployment Checklist
- [ ] All tests passing (unit & integration)
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] API rate limits understood
- [ ] Cache strategy validated
- [ ] Error handling comprehensive

### 10.2 Post-Deployment Monitoring
- [ ] France Travail API availability
- [ ] Cache hit/miss ratios
- [ ] Response time metrics
- [ ] Error rate tracking
- [ ] User engagement metrics

---

## Part 11: Risk & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| France Travail API down | No job recommendations | Medium | Fallback to cached data, graceful degradation |
| API rate limit exceeded | Recommendations fail | Low | Implement queue, caching, rate limit handling |
| Competency mapping inaccurate | Poor matches | Medium | Start with curated mapping, improve over time |
| Performance issues | Slow load times | Low | Caching, pagination, optimization |
| Authentication failure | Service unusable | Low | Comprehensive error handling, monitoring |

---

## Part 12: Future Enhancements

- [ ] Machine learning for improved skill matching
- [ ] Salary negotiation insights
- [ ] Learning path recommendations
- [ ] Job application tracking
- [ ] Interview preparation guides
- [ ] Multi-language support (FR/EN/DE)
- [ ] Resume/CV analysis integration
- [ ] Skill gap analysis

---

## Conclusion

This comprehensive plan provides a structured approach to implementing the France Travail integration feature. The system will:

1. ✅ Authenticate securely with France Travail API
2. ✅ Map user competencies to job ROME codes
3. ✅ Search and score relevant job postings
4. ✅ Display recommendations with clear matching metrics
5. ✅ Allow users to save and track recommendations
6. ✅ Provide excellent UX with loading states and error handling

**Status**: Ready for implementation upon approval

---

**Prepared by**: Claude
**Date**: 2025-10-22
**Next Step**: User approval → Implementation Phase 1

