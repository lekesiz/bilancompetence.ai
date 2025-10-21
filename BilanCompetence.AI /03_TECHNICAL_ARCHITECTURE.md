# FAZA 2: Teknik Mimarı & Teknoloji Stack Tanımı

**Tarih**: 20 Ekim 2025
**Durum**: ARCHITECTURE DESIGN
**Amacı**: Ölçeklenebilir, güvenli ve uyumlu teknik altyapı tasarlamak

---

## I. SİSTEM MİMARİ AÇIKLAMASI

### A. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├──────────────────┬──────────────────┬──────────────────────┤
│  Web Browser     │  Mobile Browser  │  Admin Dashboard     │
│  (React/Next.js) │  (Responsive)    │  (React)             │
└────────┬─────────┴──────────┬───────┴──────────┬───────────┘
         │                    │                  │
         └────────┬───────────┴──────┬───────────┘
                  │                  │
         ┌────────▼──────────────────▼──────────┐
         │     API GATEWAY & LOAD BALANCER      │
         │     (Vercel Edge Functions)          │
         └────────┬──────────────────┬──────────┘
                  │                  │
    ┌─────────────▼─────────────┬────▼──────────────────┐
    │   BACKEND SERVICES LAYER   │  EXTERNAL SERVICES   │
    ├─────────────┬─────────────┤                       │
    │ Auth Service│ Bilan API   │  Gemini API (AI)      │
    │ (JWT + SSO) │ (CRUD ops)  │  France Travail API   │
    │             │             │  SendGrid (Email)     │
    │ User Service│ Document Gen│  AWS S3 (Storage)     │
    │             │             │  Algolia (Search)     │
    └─────────────┴─────────────┴───────────────────────┘
         │                                   │
    ┌────▼─────────────────────────────────▼───┐
    │        DATA LAYER                         │
    ├────────────────────────────────────────┤
    │  Supabase (PostgreSQL)                 │
    │  - Users, Bilans, Competencies         │
    │  - Documents, Communications           │
    │  - Audit Logs & Compliance             │
    │                                         │
    │  Redis Cache Layer                     │
    │  - Session management                  │
    │  - Real-time notifications             │
    └─────────────────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │  INFRASTRUCTURE (Cloud Native)   │
    ├─────────────────────────────────┤
    │  Vercel (Frontend Hosting)       │
    │  Supabase Cloud (Database)       │
    │  AWS Lambda (Microservices)      │
    │  CloudFlare (CDN + Security)     │
    └─────────────────────────────────┘
```

---

## II. TEKNOLOJİ STACK SEÇİMLERİ

### A. Frontend Stack

#### Framework Seçimi: **Next.js 14 (App Router)**

**Neden Next.js?**
- ✅ Server-side rendering (SEO için)
- ✅ API routes built-in
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Built-in middleware (auth, GDPR)
- ✅ Vercel ile doğrudan entegrasyon

**Alternatifler Değerlendirmesi**:
- React + Express: Çok kompleks kurulum
- Vue.js: Küçük ekip için daha az ekosistem
- Svelte: Yeni, az kütüphane
- **Seçim: Next.js ✅**

#### Styling: **Tailwind CSS + Shadcn/ui**

**Neden Tailwind?**
- ✅ Utility-first, hızlı geliştirme
- ✅ Responsive design built-in
- ✅ Accessibility helpers
- ✅ Dark mode support
- ✅ RGAA 4.1 compliance hazır

**Component Library: Shadcn/ui**
- ✅ Unstyled, accessible components
- ✅ Tree-shaking friendly
- ✅ Customizable
- ✅ Framer Motion entegrasyonu

#### State Management: **TanStack Query + Zustand**

**TanStack Query (data fetching)**:
- ✅ Automatic caching
- ✅ Background synchronization
- ✅ Pagination support
- ✅ Offline support

**Zustand (client state)**:
- ✅ Minimal, fast
- ✅ Dev tools integration
- ✅ Persisted state

#### UI/UX Enhancements

| Kütüphane | Kullanım | Neden |
|-----------|----------|-------|
| Framer Motion | Animations | Smooth, performant |
| React Hook Form | Form handling | DX, validation |
| Zod | Form validation | Type-safe, easy |
| Recharts | Data visualization | Responsive, accessible |
| Day.js | Date handling | Lightweight (8KB) |

---

### B. Backend Stack

#### Runtime: **Node.js 20 LTS + TypeScript**

**Neden?**
- ✅ İş akışı dilindeki backend
- ✅ Rapid development
- ✅ Rich ecosystem
- ✅ Serverless-friendly
- ✅ Type safety (TypeScript)

#### API Framework: **Express.js + Hapi (Microservices)**

**Express.js** (Main API):
- ✅ Lightweight, fast
- ✅ Vast middleware ecosystem
- ✅ Easy to learn

**Lambda Functions** (Async jobs):
- ✅ Document generation
- ✅ Email sending
- ✅ AI processing
- ✅ Scheduled tasks

#### Database: **Supabase (PostgreSQL + Auth)**

**Neden PostgreSQL?**
- ✅ ACID transactions
- ✅ JSON support
- ✅ Full-text search
- ✅ Row-level security (GDPR)
- ✅ Audit logging built-in

**Supabase Benefits**:
- ✅ Auth service included
- ✅ Real-time subscriptions
- ✅ Instant REST API
- ✅ Built-in migrations

#### Caching: **Redis (Upstash)**

**Use Cases**:
```
1. Session management (30 dakika TTL)
2. Rate limiting (API quota'ları)
3. Real-time notifications (WebSocket backing)
4. France Travail cache (24 saat TTL)
5. Gemini prompt cache (cost optimization)
```

**Configuration**:
- Upstash (serverless Redis)
- ~50€/ay baseline
- Auto-scaling included

---

### C. AI/ML Stack

#### AI Model: **Google Gemini 2.0 Flash**

**Seçim Nedenleri**:
- ✅ Multimodal (metin + görüntü)
- ✅ Hızlı inference (< 2 saniye)
- ✅ Native Türkçe + Fransızca
- ✅ Competitive pricing
- ✅ JSON output mode
- ✅ Prompt caching (cost reduction)

**Kullanım Alanları**:

| Use Case | Prompt Type | Token Est. | Cost |
|----------|-------------|-----------|------|
| Skill extraction (CV) | Long context | 2-5K | ~$0.10 |
| Competency analysis | Structured | 1-3K | ~$0.05 |
| Job matching | Real-time | 500-1K | ~$0.02 |
| Document generation | Template | 2-4K | ~$0.08 |
| Recommendation gen | Multi-turn | 3-6K | ~$0.12 |

**Monthly Estimate (10K bilans)**:
- 10,000 bilans × 5 AI calls = 50,000 calls
- Average 2K tokens/call = 100M tokens
- Gemini API: $0.075/1M tokens = **$7.50/month**

**Prompt Examples**:

```python
# Skill Extraction
prompt = """
Analyze this CV and extract:
1. Technical skills (with proficiency level)
2. Soft skills (inferred from experience)
3. Certifications
4. Languages
Format: JSON

CV:
{cv_text}
"""

# Job Matching
prompt = """
Given user competencies and France Travail ROME codes,
suggest top 5 matching occupations with:
- Match score (0-100)
- Required additional skills
- Training path

User Profile:
{user_competencies}

ROME Codes:
{rome_codes}
"""

# Document Generation
prompt = """
Generate a professional bilan de compétences summary for:
- Bénéficiaire: {name}
- Key competencies: {skills}
- Recommended path: {recommendations}

Format: Markdown, suitable for PDF export

(Include compliance notes for Qualiopi)
"""
```

---

### D. Integration Stack

#### API Integrations

##### 1. France Travail API
```
Endpoint: https://api.francetravail.io/v1/
Auth: OAuth 2.0
Rate Limit: 10 requests/sec
Data Sources:
- Job listings (100K+)
- ROME codes (700+ occupations)
- Market statistics
- Regional data

SDK: Custom wrapper (Node.js)
Cache: Redis 24h TTL
Fallback: Local ROME database
```

##### 2. SendGrid Email
```
Use Cases:
- Bilan reminders
- Consultant notifications
- Report delivery
- Legal notifications (GDPR)

Templates:
- Bilan start (fr, en, de)
- Report ready
- Reminder (low engagement)
- Support response

Pricing: 100 emails/day free, $9/month for 50K
```

##### 3. AWS S3 (Document Storage)
```
Use Cases:
- PDF reports storage
- User uploads (CVs, documents)
- Backup/archive

Folder Structure:
/users/{userId}/documents/
/bilans/{bilanId}/reports/
/organizations/{orgId}/exports/

Retention: 7 years (French law)
Encryption: AES-256
CDN: CloudFront
```

##### 4. Algolia (Search)
```
Use Case:
- Full-text search bilans
- Consultant search
- Document search

Indexes:
- bilans (title, description, tags)
- consultants (name, expertise, location)
- documents (content, metadata)

Pricing: ~$30-100/month (scalable)
```

---

## III. DATABASE SCHEMA (Supabase PostgreSQL)

### Core Tables

```sql
-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role ENUM ('BENEFICIARY', 'CONSULTANT', 'ADMIN', 'ORG_ADMIN'),
  organization_id UUID REFERENCES organizations(id),
  avatar_url TEXT,
  bio TEXT,
  certifications JSONB, -- Qualiopi, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete
  metadata JSONB -- Extensible
);

-- ORGANIZATIONS TABLE
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  siret VARCHAR(14), -- French SIRET number
  address TEXT,
  region VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(255),
  qualiopi_certified BOOLEAN DEFAULT FALSE,
  qualiopi_expiry DATE,
  subscription_plan ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE'),
  stripe_customer_id VARCHAR(255),
  consultant_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- BILANS TABLE (Main entity)
CREATE TABLE bilans (
  id UUID PRIMARY KEY,
  beneficiary_id UUID NOT NULL REFERENCES users(id),
  consultant_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status ENUM ('PRELIMINARY', 'INVESTIGATION', 'CONCLUSION', 'COMPLETED', 'ARCHIVED'),
  start_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  contract_signed BOOLEAN DEFAULT FALSE,
  signed_contract_url TEXT,
  duration_hours INT DEFAULT 24, -- Min 24h per French law
  satisfaction_score INT, -- 1-5, post-bilan
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Custom fields per org
);

-- COMPETENCIES TABLE
CREATE TABLE competencies (
  id UUID PRIMARY KEY,
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  rome_code VARCHAR(10), -- France Travail ROME
  occupation_name VARCHAR(255),
  self_assessment_level ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
  consultant_assessment_level ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'),
  frequency_of_use ENUM ('RARELY', 'SOMETIMES', 'OFTEN', 'DAILY'),
  interest_level INT, -- 1-10 scale
  ai_transferability_score FLOAT, -- 0-1 from Gemini analysis
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RECOMMENDATIONS TABLE
CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  type ENUM ('OCCUPATION', 'TRAINING', 'ACTION', 'RESOURCE'),
  title VARCHAR(255),
  description TEXT,
  rome_code VARCHAR(10),
  match_score FLOAT, -- 0-100, from Gemini
  required_skills JSONB, -- Array of skills needed
  training_path JSONB, -- Array of training courses
  action_plan JSONB, -- Steps to take
  ai_generated BOOLEAN DEFAULT TRUE,
  consultant_validated BOOLEAN DEFAULT FALSE,
  priority INT, -- 1-5
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTS TABLE
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  type ENUM ('PRELIMINARY_REPORT', 'INVESTIGATION_REPORT', 'FINAL_REPORT', 'ACTION_PLAN'),
  file_url TEXT NOT NULL, -- S3 URL
  file_size INT, -- bytes
  file_format ENUM ('PDF', 'DOCX', 'HTML'),
  generated_at TIMESTAMP DEFAULT NOW(),
  ai_generated BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- MESSAGES TABLE (Communication)
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  bilan_id UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  message_type ENUM ('TEXT', 'DOCUMENT', 'NOTE', 'TASK'),
  read_at TIMESTAMP, -- NULL = unread
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AUDIT_LOG TABLE (GDPR compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(100), -- 'BILAN', 'USER', etc.
  entity_id UUID,
  action VARCHAR(50), -- 'CREATE', 'UPDATE', 'DELETE', 'ACCESS'
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SESSIONS TABLE (Real-time & Qualiopi)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  bilan_id UUID NOT NULL REFERENCES bilans(id),
  consultant_id UUID NOT NULL REFERENCES users(id),
  beneficiary_id UUID NOT NULL REFERENCES users(id),
  session_type ENUM ('PRELIMINARY', 'INVESTIGATION', 'CONCLUSION', 'REMOTE', 'IN_PERSON'),
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INT,
  notes TEXT,
  attendance ENUM ('PRESENT', 'ABSENT', 'RESCHEDULED'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- QUALIOPI_INDICATORS TABLE
CREATE TABLE qualiopi_indicators (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  indicator_number INT, -- 1-32
  indicator_name VARCHAR(255),
  compliance_status ENUM ('COMPLIANT', 'PARTIAL', 'NON_COMPLIANT', 'NA'),
  evidence JSONB, -- Links to supporting documents
  audit_notes TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  next_review DATE
);
```

### Indexes (Performance)

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_bilans_beneficiary ON bilans(beneficiary_id);
CREATE INDEX idx_bilans_consultant ON bilans(consultant_id);
CREATE INDEX idx_bilans_status ON bilans(status);
CREATE INDEX idx_bilans_org ON bilans(organization_id);
CREATE INDEX idx_competencies_bilan ON competencies(bilan_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, read_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_at, consultant_id);
```

### Row-Level Security (RLS) Policies

```sql
-- Beneficiaries can only see their own bilans
ALTER TABLE bilans ENABLE ROW LEVEL SECURITY;
CREATE POLICY bilan_beneficiary_select
  ON bilans FOR SELECT
  USING (auth.uid() = beneficiary_id);

-- Consultants can see their assigned bilans
CREATE POLICY bilan_consultant_select
  ON bilans FOR SELECT
  USING (auth.uid() = consultant_id);

-- Org admins can see all bilans in their org
CREATE POLICY bilan_org_admin_select
  ON bilans FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE organization_id = bilans.organization_id
    AND role = 'ORG_ADMIN'
  ));

-- Audit logs are append-only (no updates/deletes)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_append_only
  ON audit_logs FOR DELETE
  USING (false);
```

---

## IV. API ENDPOINTS SPECIFICATION

### Authentication Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/password-reset
POST   /api/auth/mfa-setup
GET    /api/auth/verify-email/{token}
POST   /api/auth/sso/google
POST   /api/auth/sso/microsoft
```

### Bilan Management Endpoints

```
GET    /api/bilans
POST   /api/bilans
GET    /api/bilans/{bilanId}
PUT    /api/bilans/{bilanId}
DELETE /api/bilans/{bilanId}
POST   /api/bilans/{bilanId}/start
POST   /api/bilans/{bilanId}/complete
POST   /api/bilans/{bilanId}/archive
```

### Competencies Assessment

```
GET    /api/bilans/{bilanId}/competencies
POST   /api/bilans/{bilanId}/competencies
PUT    /api/bilans/{bilanId}/competencies/{compId}
POST   /api/bilans/{bilanId}/competencies/ai-analysis
GET    /api/bilans/{bilanId}/competencies/rome-mapping
```

### Recommendations & AI

```
GET    /api/bilans/{bilanId}/recommendations
POST   /api/bilans/{bilanId}/recommendations/generate
GET    /api/bilans/{bilanId}/recommendations/{recId}
POST   /api/bilans/{bilanId}/recommendations/{recId}/validate
GET    /api/recommendations/france-travail-jobs
POST   /api/recommendations/training-search
```

### Document Generation

```
POST   /api/bilans/{bilanId}/documents/generate
GET    /api/bilans/{bilanId}/documents
GET    /api/bilans/{bilanId}/documents/{docId}
POST   /api/bilans/{bilanId}/documents/{docId}/download
POST   /api/bilans/{bilanId}/documents/{docId}/email
```

### Communications

```
GET    /api/bilans/{bilanId}/messages
POST   /api/bilans/{bilanId}/messages
GET    /api/bilans/{bilanId}/messages/{msgId}
DELETE /api/bilans/{bilanId}/messages/{msgId}
POST   /api/messages/mark-read
```

### Organization Management

```
GET    /api/organizations/{orgId}
PUT    /api/organizations/{orgId}
GET    /api/organizations/{orgId}/consultants
POST   /api/organizations/{orgId}/consultants
DELETE /api/organizations/{orgId}/consultants/{userId}
GET    /api/organizations/{orgId}/qualiopi-status
```

### Reporting & Analytics

```
GET    /api/organizations/{orgId}/analytics/dashboard
GET    /api/organizations/{orgId}/analytics/bilans-completed
GET    /api/organizations/{orgId}/analytics/satisfaction
GET    /api/organizations/{orgId}/analytics/qualiopi-indicators
POST   /api/organizations/{orgId}/exports/bilans
POST   /api/organizations/{orgId}/exports/reports
```

---

## V. SECURITY & COMPLIANCE

### A. Authentication & Authorization

```
- JWT tokens (secure httpOnly cookies)
- Refresh token rotation
- MFA support (TOTP, SMS optional)
- SSO integration (Google, Microsoft)
- Rate limiting (API: 100 req/min, Auth: 5 req/min)
```

### B. Data Encryption

```
Transit:
- HTTPS/TLS 1.3 enforced
- Certificate pinning (optional)

At Rest:
- Database: Encrypted at Supabase level
- Documents (S3): AES-256 encryption
- Sensitive fields: Application-level encryption
```

### C. GDPR Compliance

```
- User data portability: API endpoint
- Right to be forgotten: Soft delete → Hard delete after 90 days
- Consent management: Cookies + email preferences
- Data access logs: Audit trail
- DPO communication: privacy@bilancompetence.ai
```

### D. Audit & Logging

```
- All data access logged (audit_logs table)
- Retention: 7 years (French law requirement)
- Log immutability: Row-level security
- Export: Regular audit reports
```

---

## VI. DEPLOYMENT & DEVOPS

### A. Infrastructure Diagram

```
                ┌─────────────────┐
                │   CloudFlare    │ ← DDoS, CDN
                │     (Global)    │
                └────────┬────────┘
                         │
            ┌────────────┼────────────┐
            │                         │
    ┌───────▼─────────┐     ┌───────▼─────────┐
    │  Vercel (Global)│     │ Backup Region   │
    │  Frontend + API │     │ (EU Failover)   │
    └────────┬────────┘     └─────────────────┘
             │
    ┌────────▼──────────────────┐
    │  Supabase (PostgreSQL)    │
    │  - Primary: EU-Frankfurt  │
    │  - Backup: EU-Dublin      │
    │  - Read Replicas: 2       │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────┐
    │  AWS S3 (Document Storage)│
    │  - Region: eu-west-1      │
    │  - Replication: Enabled   │
    │  - Versioning: Enabled    │
    └───────────────────────────┘
```

### B. CI/CD Pipeline

```
Git Push
  ↓
GitHub Actions
  ├─ Lint & Format Check
  ├─ Unit Tests (Jest)
  ├─ Integration Tests (E2E with Playwright)
  ├─ Security Scan (OWASP)
  ├─ Build Artifact
  └─ Deploy to Vercel (staging)
       ↓
  Manual Approval
       ↓
  Vercel Production Deploy
       ↓
  Database Migrations (if needed)
       ↓
  Smoke Tests
       ↓
  Monitoring Alert Setup
```

### C. Monitoring & Observability

```
- Application: Sentry (error tracking)
- Performance: Vercel Analytics
- Database: Supabase Dashboards
- API: Datadog (optional, cost: $200/mo)
- Uptime: StatusPage.io
- Logs: ELK Stack (optional) or Supabase logs
```

---

## VII. TEKNOLOJI STACK ÖZETI

| Katman | Teknoloji | Maliyet | Notlar |
|--------|-----------|---------|--------|
| **Frontend** | Next.js 14, Tailwind, Shadcn | Free | OSS |
| **Backend** | Node.js, Express, TypeScript | Free | OSS |
| **Database** | Supabase (PostgreSQL) | 25€/ay | Generous free tier |
| **Hosting** | Vercel | 20€/ay | Edge functions included |
| **AI** | Gemini API | ~10€/ay | 10K bilans capacity |
| **APIs** | France Travail, SendGrid | ~15€/ay | Free for most |
| **Storage** | AWS S3 | ~10€/ay | Low usage |
| **Cache** | Upstash Redis | 10€/ay | Serverless |
| **Search** | Algolia | 30€/ay | Full-text optional |
| **CDN** | CloudFlare | 20€/ay | DDoS + performance |
| **Monitoring** | Sentry | Free tier | 5000 errors/mo |
| **Email** | SendGrid | 10€/ay | Transactional |
| **SSL** | Let's Encrypt | Free | Auto via Vercel |
| **DNS** | CloudFlare | Free | Via Vercel |
| **Total Monthly** | | **~150€/mo** | **Scalable** |

---

## VIII. NEXT STEPS - FAZA 3

- [ ] Database schema migration scripts hazırla
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Development environment setup guide
- [ ] Security testing checklist
- [ ] Performance benchmarks

---

**HAZIRLAYANLAR**: Teknik Mimarı Ekibi
**TARİH**: 20 Ekim 2025
**SONRAKI FAZA**: FAZA 3 - Detaylı Ürün Spesifikasyonları & MVP Tanımı
