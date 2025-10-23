# Sprint 7 - Task 1: Qualiopi Uyumluluk Modülü - Comprehensive Implementation Plan

**Sprint**: Sprint 7 (Gelişmiş Özellikler & Lansman Hazırlığı)
**Task**: Task 1 - Qualiopi Uyumluluk Modülü Geliştir
**Date**: 2025-10-23
**Status**: PLANNING - Awaiting Approval

---

## 📋 Executive Summary

**Qualiopi Uyumluluk Modülü** (Qualiopi Compliance Module), BilanCompetence.AI platformunun Fransa'daki **Qualiopi sertifikasyon** (OPQF - Organisme de Formation sertifikası) gereksinimlerini karşılamasına yardımcı olacak kapsamlı bir sistem.

Modül şunları sağlar:
- ✅ 32 Qualiopi indikatörü takibi
- ✅ Otomatik uyumluluk kontrolleri  
- ✅ Kanıt (Evidence) toplama ve arşivleme
- ✅ Katılımcı memnuniyet anketleri
- ✅ Eğitim süreci takibi
- ✅ Dökümantasyon yönetimi
- ✅ Audit-hazır raporlar
- ✅ Uyumluluk kontrol paneli

**Hedef Kuruluşlar**: Qualiopi sertifikası istemeyen veya mevcut olan eğitim organizasyonları

---

## 🎯 Qualiopi Sertifikasyon Nedir?

### Tanım (Fransa'da)
QUALIOPI (Qualité Orientation Professionnelle et Insertion) sertifikası:
- Fransa'da **tüm organisme de formation** (eğitim organizasyonları) için **zorunlu**
- **Yenileme**: Her 3 yılda bir
- **Amaç**: Eğitim kalitesini standartlaştırma ve izleme
- **Düzenleme**: CNEFOP ve akreditasyon organları tarafından
- **32 indikatör** ile uyumluluk gerektirir

### 32 Qualiopi İndikatörü (Kategoriler)

```
KATEGORİ 1: İnsan Kaynakları & Yetkinlik
├─ 1. Hizmet hakkında bilgi ve açıklık
├─ 2. Öğrenenlerin seçimi ve adaptasyon
└─ 3. Eğitmen yetkinliği ve nitelikleri

KATEGORİ 2: Maliyetler & Fiyatlandırma
├─ 4. Hizmet maliyeti ve fiyatlandırma transparanlığı
└─ 5. Ön koşullar ve engelli kişilere erişim

KATEGORİ 3: İçerik & Pedagogik Yöntemler
├─ 6. Program tasarımı ve hedefler
├─ 7. Pedagojik yöntemler
├─ 8. Materyaller ve kaynaklar
└─ 9. Personalizasyon ve uyarlama

KATEGORİ 4: Değerlendirme & Sonuçlar
├─ 10. Başlangıç değerlendirmesi
├─ 11. Katılımcı memnuniyeti (SATISFACTION SURVEYS)
├─ 12. Öğrenme sonuçları değerlendirmesi
└─ 13. Bilan ve proje sonuçları

KATEGORİ 5: İmkanlar & Ulaşılabilirlik
├─ 14. Fiziksel ve dijital ulaşılabilirlik
├─ 15. Erişim ve rehberlik desteği
└─ 16. Cinsiyet eşitliği

KATEGORİ 6: Çıktılar & Etki
├─ 17. Mezun takibi
├─ 18. İş yerleşimi sonuçları
└─ 19. Sosyal etki

KATEGORİ 7: İç Kontrol & Yönetim
├─ 20. İç kontrol ve veri kalitesi
├─ 21. Finansal yönetim ve muhasebe
└─ 22. Belgeler ve arşivler (DOCUMENT ARCHIVE)

KATEGORİ 8: Gelişim & İyileştirme
├─ 23. Geri bildirim ve iyileştirme mekanizması
├─ 24. İş ortakları ile işbirliği
└─ 25-32. İlave indikatörler (kontekste bağlı)
```

---

## 📊 MVP İçin Odaklanılan İndikatörler

**Focus (Task 1'de)**: 3 Temel İndikatör

### 1️⃣ **Indicator 1: Information About Services** (Hizmet Bilgisi)
- Bilan nedir? Kimler için?
- Maliyet, süre, program bilgileri
- Eğitmenlerin profilleri
- Erişim koşulları

**Platform Desteği**:
- Landing page bilgileri
- Consultant profilleri
- Bilan süreci açıklaması
- Fiyatlandırma sayfası

### 2️⃣ **Indicator 11: Beneficiary Satisfaction** (Katılımcı Memnuniyeti)
- Post-bilan memnuniyet anketleri
- NPS (Net Promoter Score) takibi
- Feedback ve öneriler
- Action items oluşturma

**Platform Desteği**:
- Otomatik anket gönderimi (bilan tamamlanma sonra)
- Memnuniyet puanları ve trend analizi
- Kategorik feedback (memnun/kısmen/değil)
- İyileştirme önerileri

### 3️⃣ **Indicator 22: Documentation Archive** (Dokümantasyon Arşivi)
- Bilan dosyaları arşivlenmesi
- Kanıt belgeleri saklama
- 5 yıllık saklama süresi (Fransa hukuku)
- Erişim denetimi ve audit trail

**Platform Desteği**:
- Otomatik dokümantasyon arşivlemesi
- SHA256 integrity verification
- Soft delete (7 yıl tutma)
- Access logs (kim, ne zaman, neden)

---

## 💡 Qualiopi Modülünün İş Mantığı

### Akış 1: Uyumluluk Takibi (Compliance Tracking)

```
Administrator → Qualiopi Dashboard
    ├─ Current Status: 15/32 indikatör (47%)
    ├─ Tamamlananlar (Green):
    │  ├─ Indicator 1: ✅ Service Information
    │  ├─ Indicator 11: ✅ Satisfaction Surveys
    │  └─ Indicator 22: ✅ Documentation
    │
    └─ Eksikler (Red):
       ├─ Indicator 2: Employee Qualifications
       ├─ Indicator 5: Accessibility
       └─ ... (29 diğer)

Actions:
    ├─ Each indicator için kanıt yükleme
    ├─ Self-assessment form
    ├─ Action plan oluşturma
    └─ Audit trail viewing
```

### Akış 2: Kanıt Toplama (Evidence Collection)

```
For Indicator 1 (Service Information):
    ├─ Upload: Website landing page PDF
    ├─ Upload: Service brochure
    ├─ Upload: Pricing document
    ├─ Upload: Bilan process explanation
    └─ Status: ✅ VERIFIED (Automatically checked)

For Indicator 11 (Satisfaction):
    ├─ Auto-generate: Post-bilan surveys
    ├─ Auto-collect: Responses (Google Forms, SurveyMonkey)
    ├─ Auto-analyze: Results and trends
    ├─ Upload: Survey templates
    └─ Status: ✅ VERIFIED (Historical data)

For Indicator 22 (Documentation):
    ├─ Auto-archive: Bilan documents
    ├─ Auto-archive: Evidence files
    ├─ Auto-generate: Access logs
    ├─ Calculate: Retention compliance
    └─ Status: ✅ VERIFIED (System-level)
```

### Akış 3: Audit Rapor Hazırlama (Audit Reporting)

```
Before External Audit (Q1 2026):
    
1. Self-Assessment:
   ├─ All 32 indicators review
   ├─ Compliance percentage calculate
   ├─ Gaps identify
   └─ Action items create

2. Evidence Compilation:
   ├─ Gather all documents
   ├─ Organize by indicator
   ├─ Verify completeness
   └─ Generate index

3. Generate Audit Report:
   ├─ Summary (Compliance %)
   ├─ Indicator-by-indicator breakdown
   ├─ Evidence checklist
   ├─ Action plan for gaps
   └─ Timeline for remediation

4. Internal Review:
   ├─ Management sign-off
   ├─ Staff sign-off
   ├─ Stakeholder approval
   └─ Submit to audit firm
```

---

## 🏗️ Technical Architecture

### 1. Database Schema

#### Table 1: qualiopi_indicators
```sql
CREATE TABLE qualiopi_indicators (
  id SERIAL PRIMARY KEY,
  indicator_number INT NOT NULL UNIQUE, -- 1-32
  indicator_name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- Category 1-8
  description TEXT,
  required BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT now()
);

-- Seed 32 indicators
INSERT INTO qualiopi_indicators VALUES
  (1, 'Information About Services', 'Category 1', '...'),
  (11, 'Beneficiary Satisfaction', 'Category 4', '...'),
  (22, 'Documentation Archive', 'Category 7', '...'),
  ... (29 more)
```

#### Table 2: qualiopi_compliance_status
```sql
CREATE TABLE qualiopi_compliance_status (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  indicator_id INT NOT NULL REFERENCES qualiopi_indicators(id),
  
  status VARCHAR(50), -- NOT_STARTED, IN_PROGRESS, COMPLETED, VERIFIED
  completion_percentage INT (0-100),
  
  -- Evidence tracking
  evidence_count INT DEFAULT 0,
  last_evidence_upload TIMESTAMP,
  
  -- Audit trail
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  
  -- Auto-verification (for system indicators)
  auto_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(100), -- DATABASE_COUNT, API_CHECK, etc.
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Table 3: qualiopi_evidence
```sql
CREATE TABLE qualiopi_evidence (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  indicator_id INT NOT NULL REFERENCES qualiopi_indicators(id),
  
  -- File info
  file_name VARCHAR(255),
  file_path VARCHAR(500), -- S3 path
  file_size INT,
  file_type VARCHAR(50), -- PDF, JPG, etc.
  
  -- Integrity
  file_hash VARCHAR(64), -- SHA256
  uploaded_at TIMESTAMP,
  uploaded_by UUID REFERENCES users(id),
  
  -- Metadata
  description TEXT,
  relevance_score INT (0-100), -- How relevant is this evidence?
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  
  deleted_at TIMESTAMP -- Soft delete (keep for 7 years)
);
```

#### Table 4: qualiopi_satisfaction_surveys
```sql
CREATE TABLE qualiopi_satisfaction_surveys (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  bilan_id UUID NOT NULL REFERENCES bilans(id),
  beneficiary_id UUID NOT NULL REFERENCES users(id),
  
  -- Survey instance
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  response_deadline TIMESTAMP,
  
  -- Responses
  overall_satisfaction INT (1-5), -- 1=Very Unsatisfied, 5=Very Satisfied
  would_recommend BOOLEAN, -- Yes/No (for NPS)
  
  -- Categorized responses
  consultant_helpfulness INT (1-5),
  process_clarity INT (1-5),
  documentation_quality INT (1-5),
  recommendations TEXT, -- Free text
  
  -- Calculation
  nps_category VARCHAR(50), -- Promoter/Passive/Detractor
  
  -- Audit
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Table 5: qualiopi_audit_log
```sql
CREATE TABLE qualiopi_audit_log (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  
  -- Action tracking
  action VARCHAR(100), -- INDICATOR_UPDATED, EVIDENCE_UPLOADED, SURVEY_SENT, etc.
  entity_type VARCHAR(50), -- indicator, evidence, survey
  entity_id INT/UUID,
  
  -- Changes
  old_value JSONB,
  new_value JSONB,
  
  -- Who and when
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP DEFAULT now(),
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  -- Retention (immutable, 7 years)
  deleted_at TIMESTAMP -- Soft delete after 7 years
);
```

#### Table 6: qualiopi_action_plans
```sql
CREATE TABLE qualiopi_action_plans (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  indicator_id INT NOT NULL REFERENCES qualiopi_indicators(id),
  
  -- Gap identification
  gap_description TEXT,
  root_cause TEXT,
  
  -- Action items
  action_title VARCHAR(255),
  action_description TEXT,
  responsible_person UUID REFERENCES users(id),
  target_date DATE,
  
  -- Progress
  status VARCHAR(50), -- NOT_STARTED, IN_PROGRESS, COMPLETED
  progress_percentage INT (0-100),
  
  -- Tracking
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### 2. Backend API Endpoints

#### A. Indicators Management

```
GET /api/qualiopi/indicators
  Response: All 32 indicators with descriptions

GET /api/qualiopi/indicators/:id
  Response: Single indicator details

GET /api/qualiopi/compliance-status
  Query: organization_id
  Response: Current compliance status for all indicators
  ```{
    overall_percentage: 47,
    indicators: [
      { id: 1, name: "Service Info", status: "COMPLETED", % 100 },
      { id: 2, name: "Qualifications", status: "IN_PROGRESS", % 60 },
      ...
    ]
  }```

PUT /api/qualiopi/indicators/:id/status
  Body: { status: "IN_PROGRESS", notes: "..." }
  Response: Updated status
```

#### B. Evidence Management

```
POST /api/qualiopi/evidence
  Body: {
    indicator_id: 1,
    file: <binary>,
    description: "Landing page proof",
    relevance_score: 95
  }
  Response: { id: UUID, file_path: "s3://...", status: "UPLOADED" }

GET /api/qualiopi/evidence/:indicator_id
  Response: All evidence for indicator
  ```[
    {
      id: UUID,
      file_name: "landing-page.pdf",
      uploaded_at: "2025-10-23",
      verified: true,
      relevance_score: 95
    }
  ]```

DELETE /api/qualiopi/evidence/:id
  Response: { soft_deleted: true, accessible_until: "2032-10-23" }

POST /api/qualiopi/evidence/:id/verify
  Body: { verified: true, verified_by: UUID }
  Response: { verified_at: TIMESTAMP }
```

#### C. Satisfaction Surveys

```
POST /api/qualiopi/surveys/send
  Body: {
    bilan_id: UUID,
    beneficiary_email: "email@example.com"
  }
  Response: { survey_id: UUID, sent: true }

GET /api/qualiopi/surveys/:bilan_id
  Response: Survey response (or pending status)

POST /api/qualiopi/surveys/:survey_id/submit
  Body: {
    overall_satisfaction: 5,
    would_recommend: true,
    consultant_helpfulness: 5,
    process_clarity: 4,
    recommendations: "Everything was perfect!"
  }
  Response: { submitted: true, nps_category: "Promoter" }

GET /api/qualiopi/surveys/analytics/nps
  Response: {
    nps_score: 45, // (Promoters % - Detractors %)
    total_responses: 100,
    promoters: 60,
    passives: 25,
    detractors: 15,
    average_satisfaction: 4.3
  }
```

#### D. Audit & Reporting

```
GET /api/qualiopi/audit-log
  Query: organization_id, from_date, to_date, action
  Response: Immutable audit log entries

POST /api/qualiopi/action-plans
  Body: {
    indicator_id: 2,
    gap_description: "No evidence of staff qualifications",
    action_title: "Document all consultant certifications",
    target_date: "2025-12-31"
  }
  Response: { id: UUID, status: "NOT_STARTED" }

GET /api/qualiopi/reports/compliance
  Response: Comprehensive audit report
  ```{
    organization_name: "...",
    audit_date: "2025-10-23",
    compliance_percentage: 47,
    by_category: [
      { category: 1, completed: 2/3, percentage: 67 },
      ...
    ],
    action_plans: [...],
    next_steps: "Submit evidence for indicators 2, 5, ...",
    signed_by: "Manager Name",
    signature_date: "2025-10-23"
  }```

GET /api/qualiopi/reports/satisfaction
  Response: NPS and satisfaction trends

GET /api/qualiopi/reports/documentation
  Response: Archive inventory and retention status
```

#### E. System Auto-Verification

```
POST /api/qualiopi/auto-verify/indicator-11
  Trigger: After bilan completion + 30 days (when surveys sent)
  Logic: Check satisfaction survey completion
  Update: qualiopi_compliance_status.auto_verified = true

POST /api/qualiopi/auto-verify/indicator-22
  Trigger: Daily (system maintenance)
  Logic: Check document archive integrity
  Count: Documents archived, retention status
  Update: evidence table statistics
```

### 3. Service Layer

#### QualiopsService (Backend Service Class)

```typescript
class QualiopsService {
  
  // Indicator management
  async getIndicators(): Promise<Indicator[]>
  async getComplianceStatus(orgId: UUID): Promise<ComplianceStatus[]>
  async updateIndicatorStatus(indicatorId: int, status: string): Promise<void>
  
  // Evidence handling
  async uploadEvidence(
    indicatorId: int, 
    file: File, 
    description: string
  ): Promise<Evidence>
  
  async getEvidenceForIndicator(indicatorId: int): Promise<Evidence[]>
  async deleteEvidence(evidenceId: UUID): Promise<void>
  async verifyEvidence(evidenceId: UUID, verifiedBy: UUID): Promise<void>
  
  // Calculate file hash for integrity
  private async calculateFileHash(file: File): Promise<string> {
    // SHA256 hash
  }
  
  // Satisfaction surveys
  async sendSurvey(bilanId: UUID): Promise<Survey>
  async submitSurvey(surveyId: UUID, responses: any): Promise<void>
  async calculateNPS(): Promise<NPSMetrics>
  
  // Auto-verification
  async autoVerifyIndicator11(orgId: UUID): Promise<void>
  async autoVerifyIndicator22(orgId: UUID): Promise<void>
  
  // Reporting
  async generateComplianceReport(orgId: UUID): Promise<AuditReport>
  async generateSatisfactionReport(orgId: UUID): Promise<SatisfactionReport>
  async generateDocumentationReport(orgId: UUID): Promise<DocumentationReport>
  
  // Action plans
  async createActionPlan(indicatorId: int, gap: string): Promise<ActionPlan>
  async updateActionPlan(planId: UUID, progress: int): Promise<void>
}
```

---

## 📱 Frontend Implementation

### 1. Admin UI for Qualiopi

#### Page Structure
```
/admin/qualiopi/
├── dashboard/
│   ├── page.tsx (Main compliance dashboard)
│   ├── ComplianceStatusCard.tsx
│   ├── IndicatorGrid.tsx
│   ├── ActionPlansList.tsx
│   └── QuickStats.tsx
│
├── indicators/
│   ├── page.tsx (All 32 indicators list)
│   ├── [indicator_id]/
│   │   ├── page.tsx (Indicator details)
│   │   ├── EvidenceUpload.tsx
│   │   ├── EvidenceList.tsx
│   │   ├── StatusForm.tsx
│   │   └── RelatedDocuments.tsx
│   └── IndicatorCard.tsx
│
├── evidence/
│   ├── page.tsx (Evidence archive)
│   ├── EvidenceUploadModal.tsx
│   ├── EvidenceTable.tsx
│   ├── FilePreview.tsx
│   └── IntegrityVerification.tsx
│
├── surveys/
│   ├── page.tsx (Satisfaction surveys overview)
│   ├── [survey_id]/
│   │   ├── page.tsx (Survey details)
│   │   ├── SurveyTemplate.tsx
│   │   ├── NPSChart.tsx
│   │   ├── TrendAnalysis.tsx
│   │   └── FeedbackThemes.tsx
│   └── SurveyCard.tsx
│
├── action-plans/
│   ├── page.tsx (Action items)
│   ├── CreatePlanForm.tsx
│   ├── PlanProgressTracker.tsx
│   └── PlanList.tsx
│
└── reports/
    ├── compliance/page.tsx (Audit report)
    ├── satisfaction/page.tsx (NPS report)
    ├── documentation/page.tsx (Archive report)
    └── ReportGenerator.tsx
```

#### Key Admin Components

```typescript
// ComplianceStatusCard.tsx
- Display: Overall compliance %
- Show: Green/yellow/red status
- Progress bar: visual representation
- Quick actions: View details, Upload evidence, Update status

// IndicatorGrid.tsx
- 32 indicator cards (grid layout)
- Color: Green (complete), Yellow (in-progress), Red (not started)
- Click: Navigate to indicator details
- Show: % complete per indicator

// EvidenceUpload.tsx
- File upload interface
- Preview PDF/JPG
- Auto-calculate SHA256 hash
- Description field
- Relevance score (1-100)
- Submit button

// NPSChart.tsx
- NPS score prominently displayed
- Promoters/Passives/Detractors breakdown
- Satisfaction rating distribution (pie/bar)
- Trend over time (line chart)
- Comment themes (word cloud or list)

// ActionPlans.tsx
- Create/edit action items
- Set responsible person
- Set target date
- Progress tracking
- Status: Not Started → In Progress → Completed
```

### 2. Beneficiary Survey UI

#### Post-Bilan Survey Flow

```
Email → "Your Feedback is Important"
   ↓
Click link → Opens survey form (no login required, token-based)
   ↓
Step 1: Overall Satisfaction (1-5 stars or NPS: "Would you recommend?")
Step 2: Consultant Helpfulness (1-5)
Step 3: Process Clarity (1-5)
Step 4: Documentation Quality (1-5)
Step 5: Open Comments (textarea)
   ↓
Submit → "Thank you! Your feedback helps us improve"
```

---

## 🔄 User Workflows

### Workflow 1: Compliance Preparation (Q4 2025)

```
Step 1: Initial Assessment (Week 1)
├─ Review 32 indicators
├─ Complete self-assessment form
├─ Rate current compliance (0-100 per indicator)
└─ Identify gaps

Step 2: Evidence Collection (Weeks 2-4)
├─ Indicator 1: Upload service documentation
│  ├─ Landing page
│  ├─ Service brochure
│  ├─ Pricing info
│  └─ Process flowchart
│
├─ Indicator 11: Activate surveys (automatic)
│  ├─ Configure survey template
│  ├─ Send post-bilan surveys
│  ├─ Collect 20+ responses
│  └─ Generate NPS report
│
└─ Indicator 22: Verify documentation (automatic)
   ├─ Check archive completeness
   ├─ Verify retention dates
   ├─ Generate inventory report
   └─ Calculate compliance %

Step 3: Gap Remediation (Weeks 5-8)
├─ Create action plans for gaps
├─ Assign responsibilities
├─ Set target dates
├─ Monitor progress
└─ Update evidence as completed

Step 4: Audit Preparation (Week 9)
├─ Generate compliance report
├─ Organize evidence by indicator
├─ Create executive summary
├─ Management sign-off
└─ Submit to audit firm

Step 5: External Audit (Q1 2026)
├─ Audit firm reviews
├─ Site visit (if needed)
├─ Remediation period (if needed)
└─ Certification or feedback
```

### Workflow 2: Ongoing Compliance (Quarterly)

```
Every Quarter:
├─ Review compliance dashboard
├─ Check auto-verified indicators
├─ Review new evidence uploads
├─ Monitor satisfaction scores
├─ Track action plan progress
└─ Generate quarterly report

Every 3 Years:
└─ Re-certification audit
```

---

## 📊 Frontend Features Detail

### 1. Compliance Dashboard
```
┌─────────────────────────────────────────┐
│  QUALIOPI COMPLIANCE DASHBOARD          │
├─────────────────────────────────────────┤
│                                          │
│  Overall Compliance: ███████░░░ 47%     │
│                                          │
│  By Category:                            │
│  Category 1: ████░░░░ 50%               │
│  Category 2: █░░░░░░░ 10%               │
│  Category 3: ██████░░ 60%               │
│  Category 4: ████████░ 87%  (Good!)     │
│  ...                                    │
│                                          │
│  Quick Stats:                            │
│  • Indicators Completed: 15/32 (47%)    │
│  • Evidence Items: 42                   │
│  • Average Relevance: 88/100            │
│  • NPS Score: 45 (Excellent!)           │
│                                          │
│  Next Actions:                           │
│  □ Upload staff qualifications          │
│  □ Document accessibility measures      │
│  □ Create action plans (5 pending)      │
│                                          │
└─────────────────────────────────────────┘
```

### 2. Indicator Detail Page

```
┌─────────────────────────────────────────┐
│ INDICATOR 1: Service Information  100%  │
├─────────────────────────────────────────┤
│                                          │
│ Description:                             │
│ Information about services must be       │
│ clear, accessible, and up-to-date       │
│                                          │
│ Status: ✅ COMPLETED                    │
│                                          │
│ Evidence Items: (3)                      │
│ ✅ landing-page.pdf (95%) - Oct 23      │
│ ✅ service-brochure.pdf (90%) - Oct 20  │
│ ✅ pricing-info.pdf (85%) - Oct 15      │
│                                          │
│ [+ Add Evidence] [Update Status]        │
│                                          │
│ Related Indicators:                      │
│ • Indicator 4: Pricing transparency     │
│ • Indicator 5: Accessibility            │
│                                          │
│ Action Plans: None                       │
│                                          │
└─────────────────────────────────────────┘
```

### 3. NPS Dashboard

```
┌─────────────────────────────────────────┐
│ INDICATOR 11: Satisfaction Tracking 87% │
├─────────────────────────────────────────┤
│                                          │
│ NPS Score: 45 (Excellent)               │
│ Total Responses: 127                     │
│                                          │
│        Promoters (60%) | Passives (25%) │
│            |     |           |          │
│ Detractors |     |           | Good!    │
│    (15%)   v     v           v          │
│ ┌─────────────────────────────────────┐ │
│ │ Promoters          ███████ 60%      │ │
│ │ Passives           ███ 25%          │ │
│ │ Detractors         ██ 15%           │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Satisfaction by Dimension:               │
│ Overall:           ★★★★★ 4.8/5         │
│ Consultant:        ★★★★☆ 4.5/5         │
│ Process:           ★★★★★ 4.7/5         │
│ Documentation:     ★★★★☆ 4.4/5         │
│                                          │
│ Trend (Last 3 months):                   │
│ ↑ NPS up 8 points                       │
│ ↑ Satisfaction up 0.2 points            │
│                                          │
│ Top Comments:                            │
│ • "Very helpful consultant" (23 votes)  │
│ • "Clear process" (19 votes)            │
│ • "Good documentation" (17 votes)       │
│                                          │
└─────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### For Indicators Management
- [ ] Display all 32 Qualiopi indicators
- [ ] Show current compliance status per indicator
- [ ] Allow status updates (not started → in progress → completed)
- [ ] Generate compliance % overview (all + by category)
- [ ] Color-coded status (green/yellow/red)

### For Evidence Management
- [ ] Upload files (PDF, JPG, DOC, XLSX)
- [ ] Auto-calculate SHA256 hash
- [ ] Set relevance score (0-100)
- [ ] Display evidence list per indicator
- [ ] Mark evidence as verified
- [ ] Soft delete with 7-year retention
- [ ] File preview in browser
- [ ] Generate evidence inventory report

### For Satisfaction Surveys
- [ ] Auto-send survey email after bilan completion
- [ ] Capture overall satisfaction (1-5 or NPS)
- [ ] Capture detailed feedback (consultant, process, documentation)
- [ ] Calculate NPS score automatically
- [ ] Display satisfaction trends (chart)
- [ ] Show comment themes/analysis
- [ ] Export survey data to CSV/Excel

### For Audit Reporting
- [ ] Generate compliance report (PDF)
- [ ] Show indicator-by-indicator breakdown
- [ ] List all evidence per indicator
- [ ] Include action plans and timelines
- [ ] Add management sign-off section
- [ ] Export to PDF/Excel

### For Action Planning
- [ ] Create action items for gaps
- [ ] Assign to responsible person
- [ ] Set target dates
- [ ] Track progress (%)
- [ ] Update status (not started → in progress → completed)
- [ ] Generate progress reports

### For Auto-Verification
- [ ] Auto-verify Indicator 1 (service info) based on website/docs
- [ ] Auto-verify Indicator 11 based on survey sending + responses
- [ ] Auto-verify Indicator 22 based on document archive status
- [ ] Log all auto-verification events

### For Audit Trail
- [ ] Log all actions (indicator updates, evidence uploads, etc.)
- [ ] Show who did what, when, from where
- [ ] Immutable audit log (cannot be edited)
- [ ] Searchable by date/action/user
- [ ] Export audit log to CSV for auditor

---

## 📅 Implementation Timeline (Estimated)

### Phase 1: Database & Backend API (5-6 days)
- [ ] Design and create 6 database tables
- [ ] Write migration scripts
- [ ] Implement QualiopsService class
- [ ] Create 15+ API endpoints
- [ ] Add input validation (Zod)
- [ ] Setup RLS (Row Level Security) for multi-tenancy
- [ ] Unit tests (services, validation)

### Phase 2: Admin Frontend - Indicators & Evidence (4-5 days)
- [ ] Compliance dashboard (overview)
- [ ] Indicator list view (32 indicators)
- [ ] Indicator detail page
- [ ] Evidence upload form
- [ ] Evidence list + preview
- [ ] Status update workflow
- [ ] Integration tests

### Phase 3: Admin Frontend - Surveys & Reports (4-5 days)
- [ ] Satisfaction survey module
- [ ] NPS dashboard with charts
- [ ] Action plans management
- [ ] Audit trail viewer
- [ ] Generate compliance report
- [ ] Generate satisfaction report
- [ ] Export functionality (PDF/Excel)

### Phase 4: Beneficiary Survey UI (2-3 days)
- [ ] Post-bilan survey email template
- [ ] Survey form (5 steps, clean UX)
- [ ] Thank you page
- [ ] Response confirmation email

### Phase 5: Testing & Optimization (3-4 days)
- [ ] Unit tests (all services)
- [ ] Integration tests (APIs)
- [ ] E2E tests (5+ scenarios)
- [ ] Performance testing (large file uploads)
- [ ] Security audit (RLS, file upload validation)
- [ ] Accessibility audit (WCAG)

### Phase 6: Documentation & Deployment (2-3 days)
- [ ] API documentation
- [ ] Admin user guide
- [ ] Audit preparation guide
- [ ] Deploy to Vercel
- [ ] Monitoring setup (Sentry, Vercel Analytics)

**Total Estimated Time**: **20-26 days** (~4-5 weeks)

---

## 🎯 Success Metrics

### Functionality Metrics
- ✅ 100% of API endpoints working
- ✅ All 32 indicators displayed and manageable
- ✅ File upload + hash verification working
- ✅ Survey system fully operational
- ✅ Reports generating correctly

### Data Integrity Metrics
- ✅ SHA256 hashes match (evidence integrity)
- ✅ Audit log immutable (cannot be modified)
- ✅ RLS enforced (org isolation)
- ✅ 7-year retention enforced

### User Experience Metrics
- ✅ Compliance dashboard loads < 2 seconds
- ✅ File upload < 10 seconds (100MB)
- ✅ Report generation < 30 seconds
- ✅ Survey completion rate > 50%
- ✅ User satisfaction > 4/5 stars

### Compliance Metrics
- ✅ Evidence count per indicator > 3 on average
- ✅ NPS score > 40 (acceptable for bilan)
- ✅ Document retention 100% compliant
- ✅ Audit trail 100% complete

---

## 🔐 Security & Privacy

### Authentication & Authorization
- ✅ Only authenticated org admins can access Qualiopi module
- ✅ Only org's own data visible (RLS enforced)
- ✅ Role-based: Admin > Consultant > Beneficiary

### Data Privacy
- ✅ No personal data in audit logs (only UUIDs)
- ✅ File uploads scanned for malware (optional)
- ✅ Soft delete for evidence (7-year retention)
- ✅ GDPR compliant (right to deletion after retention)

### File Security
- ✅ Only PDF/JPG/DOC/XLSX allowed
- ✅ File size limit: 100MB
- ✅ Virus scan on upload (optional: VirusTotal API)
- ✅ SHA256 hash for integrity verification
- ✅ S3 versioning enabled

---

## 📚 Related Documentation

- **Product Specs**: PRODUCT_SPECIFICATIONS_AND_MVP.md (Indicator 11, Line 107)
- **Operational Setup**: OPERATIONAL_SETUP.md (Qualiopi Compliance Statement, Line 128)
- **Strategic Brief**: Cahier des Charges Stratégique (Qualiopi requirements)

---

## 🎬 Next Steps

1. **Review & Approve Plan** (You)
2. **Phase 1: Backend Development** (3-6 days)
   - Database schema + migrations
   - API endpoints
   - Service layer
   - Unit tests
3. **Phase 2-3: Frontend Development** (8-10 days)
   - Admin dashboard
   - Evidence management
   - Survey module
   - Reports
4. **Phase 4-5: Polish & Testing** (5-7 days)
   - E2E tests
   - Security audit
   - Performance optimization
5. **Phase 6: Deployment** (2-3 days)
   - Production deployment
   - Monitoring setup
   - Documentation

---

**Created**: 2025-10-23
**Status**: PLANNING - Awaiting User Approval
**Ready to proceed?**: Yes, upon approval

