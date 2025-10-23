# Sprint 7 - Task 1: Qualiopi Uyumluluk Modülünü Geliştir

**Durum**: 📋 PLAN TASARIMI
**Tarih**: 2025-10-22
**Durum**: Planlanıyor

---

## 🎯 HEDEF

BilanCompetence.AI platformunu Qualiopi sertifikasyon gereksinimlerini karşılayacak şekilde geliştirmek. Bu modül, organizasyonların 32 Qualiopi göstergesine karşı uyumluluğunu takip etmesine, kanıt toplamasına ve audit-hazır raporlar oluşturmasına yardımcı olacak.

---

## 📊 QUALIOPI UYUMLULUK GEREKSINIMLERI ANALIZI

### Qualiopi Sertifikasyon Nedir?
- Fransa'da eğitim kurumlarının kalitesini sertifiye eden resmi program
- 32 göstergesi vardır
- Organizasyonlara sunulan her hizmetin belgelendirilmesi gerekir
- MVP için: 3 ana göstergeyi takip et:
  - **Gösterge 1**: Hizmetler hakkında bilgilendirme
  - **Gösterge 11**: Katılımcı memnuniyet anketleri
  - **Gösterge 22**: Döküman arşivi

### Hedef Audit Takvimi
- **Kendi değerlendirme**: Aralık 2025
- **Kanıt toplama**: Aralık 2025
- **Harici audit**: Q1 2026
- **Sertifikasyon**: Onaylanırsa Q1 2026

---

## 📋 ÖZELLIKLER BÖLÜMLESİ

### 1. QUALIOPI GÖSTERGE TAKIBI (Backend + Admin Panel)

#### Gerekli Özellikler
- [ ] 32 göstergeden 3'ünün detaylı takibi
  - Gösterge 1: Hizmet bilgileri
  - Gösterge 11: Memnuniyet anketleri
  - Gösterge 22: Döküman arşivi
- [ ] Her gösterge için:
  - Status (Uyumlu / Eksik / İnceleme Altında)
  - Son güncellenme tarihi
  - İlişkili kanıtlar (belge linki)
  - Notlar / Açıklamalar

#### Örnek Gösterge Takibi
```
Gösterge 1: Hizmetler Hakkında Bilgilendirme
├─ Status: ✅ Uyumlu
├─ Açıklama: Bilan de compétences hizmetinin detaylı açıklaması web sitesinde
├─ Kanıt: landing-page-screenshot.pdf, terms-of-service.pdf
└─ Güncellenme: 2025-10-22

Gösterge 11: Katılımcı Memnuniyeti
├─ Status: 🟡 Eksik Kanıt
├─ Açıklama: Bilans tamamlanandaki katılımcılara anket gönderilme
├─ Kanıt Sayısı: 5 / 10 (50% tamamlanmış)
└─ Hedef: 2025-12-01

Gösterge 22: Döküman Arşivi
├─ Status: 🟢 Uyumlu
├─ Açıklama: Tüm bilans dökümanları düzenli arşivleniyor
├─ Kanıt: archive-process-doc.pdf, storage-policy.pdf
└─ Güncellenme: 2025-10-22
```

---

### 2. KATILIMCİ MemnUNİYET ANKETI SİSTEMİ

#### Gerekli Özellikler
- [ ] Bilans tamamlandığında otomatik anket gönderme
- [ ] Anket şablonu (10-15 soru)
- [ ] Yanıt toplama ve analytics
- [ ] NPS (Net Promoter Score) hesaplama
- [ ] Rapor oluşturma

#### Anket Sorularının Örneği
```
1. Bilans deneyiminizden ne kadar memnun oldunuz? (1-10)
2. Danışman ne kadar profesyonel davrandı? (1-10)
3. Önerilen iş önerileri ne kadar ilginçti? (1-10)
4. Yetenek analizi ne kadar doğru buldum? (1-10)
5. Genel deneyiminizi başkalarına önerir misiniz? (Evet/Hayır)
6. Ek yorumlar / İyileştirme önerileri (Açık metin)
```

#### Metrikleri
- Ortalama puan (1-10 ölçeğinde)
- NPS skoru (Promoters - Detractors)
- Kategoriye göre analiz
- Zaman içindeki trend
- Danışman bazında karşılaştırma

---

### 3. DÖKÜMAN YÖNETİMİ & ARŞİV SİSTEMİ

#### Gerekli Özellikler
- [ ] Bilans dökümanlarının otomatik arşivlemesi
- [ ] Döküman versiyon kontrolü
- [ ] Audit trail (kim, ne, ne zaman)
- [ ] Döküman erişim günlüğü
- [ ] Otomasyon: PDF rapor oluşturulduğunda otomatik arşivle
- [ ] Retention policy (dokuman ne kadar süre saklanacak)

#### Arşiv Metadatası
```
- Döküman ID
- Bilans ID
- Döküman türü (Preliminary PDF, Investigation PDF, etc.)
- Tarafından oluşturuldu (Sistem / Danışman / Beneficiary)
- Oluşturma tarihi
- Dosya boyutu
- Hash (Integriteyi doğrula)
- Erişim günlüğü (kim baktı, ne zaman)
- Silme tarihi (soft delete)
```

---

### 4. QUALIOPI UYUMLULUK KONTROL PANELİ (Admin/OrgAdmin)

#### Gerekli Sayfalar

##### 4.1 Uyumluluk Gösterge Panosu
- [ ] 32 göstergenin tümünün status özeti
- [ ] Filtreleme: Status (Uyumlu/Eksik/İnceleme)
- [ ] Her gösterge için detay modal
- [ ] Tamamlanma yüzdesi (Overall compliance %)
- [ ] Audit readiness raporu

**UI Layout**:
```
┌─ QUALIOPI UYUMLULUK KONTROL PANELİ ─────────────────┐
│                                                        │
│  Genel İlerleme: ████████░░ 76% (24/32 gösterge)    │
│                                                        │
│  Filtreleme: [Tümü] [Uyumlu] [Eksik] [İnceleme]     │
│                                                        │
│  ┌─ Gösterge 1: Hizmet Bilgileri ──────────────────┐ │
│  │ Status: ✅ Uyumlu      Kanıt: 3 dosya           │ │
│  │ Açıklama: Bilan hizmetinin web sitede açıklaması│ │
│  │ [Detayları Gör] [Kanıt Ekle] [Düzenle]          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─ Gösterge 11: Memnuniyet ──────────────────────┐  │
│  │ Status: 🟡 Eksik      Kanıt: 1/10 tamamlandı   │  │
│  │ Açıklama: Katılımcı memnuniyet anketleri       │  │
│  │ [Detayları Gör] [Anket Gönder] [Sonuçları Gör] │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  [Audit Raporu Oluştur] [Aktar (PDF)]              │
└────────────────────────────────────────────────────────┘
```

##### 4.2 Memnuniyet Anketi Analytics
- [ ] Anket yanıtlarının özeti (grafik & istatistikler)
- [ ] NPS skoru ve trend
- [ ] Kategori bazında ortalamalar
- [ ] Danışman performans karşılaştırması
- [ ] Soru bazında detay

**UI Layout**:
```
┌─ KATILIMCİ MemnUNİYET ANALYTICS ──────────────────┐
│                                                      │
│  NPS Skoru: 42 (Nisan: 35, Mayıs: 42)            │
│                                                      │
│  Ortalama Memnuniyet: 7.8/10                       │
│  Tavsiye Edilme Oranı: 75%                         │
│                                                      │
│  [Grafik: NPS Trend] [Grafik: Puan Dağılımı]    │
│                                                      │
│  Soru Bazında Ortalamalar:                        │
│  Memnuniyet: 7.8/10 ████████░                     │
│  Profesyonellik: 8.5/10 ████████░                 │
│  İş Önerileri: 7.2/10 ███████░░                   │
│  Yetenek Analizi: 8.1/10 ████████░                │
│                                                      │
│  Danışman Karşılaştırması:                        │
│  └─ Alice Martin: 8.2/10 (12 anket)               │
│  └─ Bob Dupont: 7.5/10 (8 anket)                  │
│  └─ Claire Lefebvre: 8.4/10 (15 anket)            │
│                                                      │
│  [Detaylı Rapor] [Anketi Düzenle] [Aktar]        │
└───────────────────────────────────────────────────┘
```

##### 4.3 Döküman Arşiv Viewer
- [ ] Tüm arşivlenmiş dökümanların listesi
- [ ] Filtreleme: Tarihe göre, bilans ID'sine göre, türe göre
- [ ] Döküman detayları: metadata, erişim günlüğü
- [ ] Download / Preview
- [ ] Audit trail (kim erişti)

**UI Layout**:
```
┌─ DÖKÜMAN ARŞİVİ ────────────────────────────────┐
│                                                   │
│  Filtreleme:                                    │
│  [Tarih Aralığı] [Bilans ID] [Tür] [Danışman] │
│                                                   │
│  Arşiv Özeti: 156 döküman (3.2 GB)             │
│                                                   │
│  ┌─ bilan-2025-001_preliminary.pdf ─────────┐ │
│  │ Tarih: 2025-01-15     Boyut: 1.2 MB      │ │
│  │ Bilans: BILX-001      Tür: Preliminary   │ │
│  │ Oluşturan: Sistem                        │ │
│  │ Erişen: 3 kişi (son: 2025-10-20)        │ │
│  │ [Preview] [Download] [Erişim Günlüğü]   │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  ┌─ bilan-2025-001_final_report.pdf ──────────┐ │
│  │ Tarih: 2025-03-10     Boyut: 2.1 MB       │ │
│  │ Bilans: BILX-001      Tür: Final Report   │ │
│  │ Oluşturan: Sistem                         │ │
│  │ Erişen: 5 kişi (son: 2025-10-22)         │ │
│  │ [Preview] [Download] [Erişim Günlüğü]    │ │
│  └────────────────────────────────────────────┘ │
│                                                   │
│  [Retention Policy] [Aktar]                   │
└──────────────────────────────────────────────────┘
```

---

## 🛠️ BACKEND API ENDPOINT'LERİ

### 1. Qualiopi Göstergeler

```
GET /api/admin/qualiopi/indicators
├─ Response: Array<Qualiopi Indicator>
├─ Fields:
│  ├─ id: number (1-32)
│  ├─ name: string
│  ├─ description: string
│  ├─ status: COMPLIANT | MISSING | UNDER_REVIEW
│  ├─ lastUpdated: ISO timestamp
│  ├─ evidence: Array<EvidenceFile>
│  └─ notes: string
└─ Auth: ADMIN / ORG_ADMIN

GET /api/admin/qualiopi/indicators/:id
├─ Response: Single Indicator with full details
└─ Auth: ADMIN / ORG_ADMIN

PUT /api/admin/qualiopi/indicators/:id
├─ Body: {
│  status: COMPLIANT | MISSING | UNDER_REVIEW,
│  notes: string,
│  evidenceIds: [uuid]
│ }
└─ Auth: ADMIN / ORG_ADMIN

POST /api/admin/qualiopi/indicators/:id/evidence
├─ Body: FormData { file, description }
├─ Response: { evidenceId, url, size }
└─ Auth: ADMIN / ORG_ADMIN
```

### 2. Katılımcı Memnuniyet Anketi

```
POST /api/bilans/:bilanId/satisfaction-survey
├─ Body: {
│  surveyId: uuid,
│  answers: Array<{
│    questionId: number,
│    score: number (1-10) OR answer: string
│  }>
│ }
├─ Response: { surveyId, submitted: true }
└─ Auth: BENEFICIARY (kendisinin bilans'ı)

GET /api/admin/qualiopi/surveys
├─ Query: ?status=COMPLETED|PENDING&dateFrom=&dateTo=
├─ Response: {
│  totalSent: number,
│  totalResponded: number,
│  responseRate: percentage,
│  npsScore: number,
│  averageScore: number,
│  surveys: Array<SurveySummary>
│ }
└─ Auth: ADMIN / ORG_ADMIN

GET /api/admin/qualiopi/surveys/analytics
├─ Response: {
│  nps: { score, trend },
│  averages: { byQuestion, byConsultant },
│  charts: { npsHistory, scoreDistribution }
│ }
└─ Auth: ADMIN / ORG_ADMIN

GET /api/admin/qualiopi/surveys/:surveyId/details
├─ Response: Full survey with all answers
└─ Auth: ADMIN / ORG_ADMIN
```

### 3. Döküman Arşiv

```
GET /api/admin/qualiopi/documents
├─ Query: ?type=PDF|REPORT&bilanId=&dateFrom=
├─ Response: {
│  total: number,
│  totalSize: bytes,
│  documents: Array<DocumentMetadata>
│ }
└─ Auth: ADMIN / ORG_ADMIN

GET /api/admin/qualiopi/documents/:docId
├─ Response: DocumentMetadata with accessLog
└─ Auth: ADMIN / ORG_ADMIN

GET /api/admin/qualiopi/documents/:docId/access-log
├─ Response: Array<AccessLogEntry>
│  ├─ userId
│  ├─ timestamp
│  ├─ action (VIEW | DOWNLOAD)
│  └─ ip
└─ Auth: ADMIN / ORG_ADMIN

GET /api/admin/qualiopi/documents/:docId/download
├─ Response: Binary file
├─ Logs: Access to audit trail
└─ Auth: ADMIN / ORG_ADMIN
```

### 4. Uyumluluk Raporları

```
GET /api/admin/qualiopi/compliance-report
├─ Query: ?format=json|pdf&indicators=all|critical
├─ Response: {
│  generatedAt: ISO timestamp,
│  organizationName: string,
│  overallCompliance: percentage,
│  indicators: Array<IndicatorStatus>,
│  nextSteps: string,
│  auditReadiness: boolean
│ }
└─ Auth: ADMIN / ORG_ADMIN

POST /api/admin/qualiopi/compliance-report/generate-pdf
├─ Body: { includeEvidence: boolean }
├─ Response: { reportId, downloadUrl, expiresIn: hours }
└─ Auth: ADMIN / ORG_ADMIN
```

---

## 🗄️ VERİTABANI ŞEMASI GÜNCELLEMELERİ

### Yeni Tablolar

#### 1. qualiopi_indicators
```sql
CREATE TABLE qualiopi_indicators (
  id INT PRIMARY KEY (1-32),
  indicator_number INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100), -- e.g., "Information", "Satisfaction", "Archives"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. organization_qualiopi_status
```sql
CREATE TABLE organization_qualiopi_status (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  indicator_id INT NOT NULL REFERENCES qualiopi_indicators(id),
  status ENUM ('COMPLIANT', 'MISSING', 'UNDER_REVIEW') DEFAULT 'MISSING',
  notes TEXT,
  last_reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, indicator_id)
);
```

#### 3. qualiopi_evidence
```sql
CREATE TABLE qualiopi_evidence (
  id UUID PRIMARY KEY,
  indicator_id INT NOT NULL REFERENCES qualiopi_indicators(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_size INT,
  file_type VARCHAR(50),
  description TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Soft delete
);
```

#### 4. satisfaction_surveys
```sql
CREATE TABLE satisfaction_surveys (
  id UUID PRIMARY KEY,
  bilan_id UUID NOT NULL REFERENCES bilans(id),
  beneficiary_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status ENUM ('PENDING', 'SENT', 'COMPLETED') DEFAULT 'PENDING',
  sent_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. survey_responses
```sql
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES satisfaction_surveys(id),
  question_number INT NOT NULL,
  answer_type ENUM ('SCORE', 'TEXT') NOT NULL,
  score_value INT (1-10),
  text_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. document_archive
```sql
CREATE TABLE document_archive (
  id UUID PRIMARY KEY,
  bilan_id UUID NOT NULL REFERENCES bilans(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  document_type ENUM ('PRELIMINARY', 'INVESTIGATION', 'CONCLUSION', 'OTHER'),
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_size INT,
  file_hash VARCHAR(64), -- SHA256 for integrity
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete
  retention_until TIMESTAMP -- Auto-delete policy
);
```

#### 7. document_access_log
```sql
CREATE TABLE document_access_log (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES document_archive(id),
  accessed_by UUID REFERENCES users(id),
  action ENUM ('VIEW', 'DOWNLOAD', 'DELETE_REQUEST') NOT NULL,
  accessed_at TIMESTAMP DEFAULT NOW(),
  user_ip VARCHAR(45),
  user_agent TEXT
);
```

#### 8. qualiopi_audit_log
```sql
CREATE TABLE qualiopi_audit_log (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  action VARCHAR(255) NOT NULL, -- e.g., "Indicator Updated", "Evidence Added"
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  details JSONB, -- Store what changed
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Düzenlenmiş Tablolar

#### organizations tablosu
```sql
ALTER TABLE organizations ADD COLUMN (
  qualiopi_certified BOOLEAN DEFAULT FALSE,
  qualiopi_expiry_date DATE,
  qualiopi_last_audit_date DATE,
  qualiopi_compliance_percentage INT DEFAULT 0
);
```

---

## 🎨 FRONTEND UI BILEŞENLERI

### Admin/OrgAdmin Panelinde Oluşturulacak Sayfalar

#### 1. Qualiopi Gösterge Panosu
- **Dosya**: `apps/frontend/app/(protected)/admin/qualiopi/indicators/page.tsx`
- **Bileşenler**:
  - `QualioptIndicatorBoard.tsx` - Ana pano
  - `IndicatorStatusCard.tsx` - Her gösterge için kart
  - `IndicatorDetailModal.tsx` - Detay modal
  - `IndicatorEvidenceUploader.tsx` - Kanıt yükleme
  - `ComplianceProgressBar.tsx` - İlerleme çubuğu

#### 2. Memnuniyet Anketi Analytics
- **Dosya**: `apps/frontend/app/(protected)/admin/qualiopi/surveys/page.tsx`
- **Bileşenler**:
  - `SurveyAnalyticsBoard.tsx` - Ana pano
  - `NPSScoreCard.tsx` - NPS göstergesi
  - `SurveyResponseChart.tsx` - Grafik
  - `ConsultantPerformanceComparison.tsx` - Danışman karşılaştırması
  - `SurveyResponseDetail.tsx` - Detaylı yanıtlar

#### 3. Döküman Arşiv Viewer
- **Dosya**: `apps/frontend/app/(protected)/admin/qualiopi/archive/page.tsx`
- **Bileşenler**:
  - `DocumentArchiveList.tsx` - Döküman listesi
  - `DocumentMetadataViewer.tsx` - Metaveri görüntüleyici
  - `AccessLogViewer.tsx` - Erişim günlüğü
  - `DocumentFilters.tsx` - Filtreleme kontrolleri

#### 4. Uyumluluk Rapor Oluşturması
- **Dosya**: `apps/frontend/app/(protected)/admin/qualiopi/reports/page.tsx`
- **Bileşenler**:
  - `ComplianceReportGenerator.tsx` - Rapor oluşturucu
  - `ReportPreview.tsx` - Rapor önizleme
  - `ReportDownloadButton.tsx` - İndirme

### Backend Servisler

#### 1. QualioptService
- **Dosya**: `apps/backend/src/services/qualioptService.ts`
- **Metodlar**:
  - `getIndicators()` - Tüm göstergeleri getir
  - `updateIndicatorStatus()` - Gösterge statusunu güncelle
  - `addEvidence()` - Kanıt ekle
  - `getCompliancePercentage()` - Uyumluluk yüzdesini hesapla

#### 2. SatisfactionSurveyService
- **Dosya**: `apps/backend/src/services/satisfactionSurveyService.ts`
- **Metodlar**:
  - `createSurvey()` - Anket oluştur
  - `sendSurvey()` - Anket gönder
  - `recordResponse()` - Yanıt kaydet
  - `calculateNPS()` - NPS hesapla
  - `getAnalytics()` - Analytics verisi getir

#### 3. DocumentArchiveService
- **Dosya**: `apps/backend/src/services/documentArchiveService.ts`
- **Metodlar**:
  - `archiveDocument()` - Dökümanı arşivle
  - `getArchiveList()` - Arşiv listesi getir
  - `logAccess()` - Erişimi kaydet
  - `applyRetentionPolicy()` - Saklama politikasını uygula

#### 4. ComplianceReportService
- **Dosya**: `apps/backend/src/services/complianceReportService.ts`
- **Metodlar**:
  - `generateReport()` - Rapor oluştur
  - `generatePDF()` - PDF rapor oluştur
  - `getAuditReadiness()` - Audit hazırlığı kontrol et

---

## 📝 İMPLEMENTASYON DETAYLARı

### Phase 1: Veri Modeli & Backend (Hafta 1)
1. **Veritabanı Migrasyonları** (1.5 gün)
   - SQL migration scripts oluştur
   - Tablolar oluştur
   - Foreign keys & indexes kur
   - Test verisi yükle

2. **Backend Servisler** (2 gün)
   - QualioptService
   - SatisfactionSurveyService
   - DocumentArchiveService
   - ComplianceReportService

3. **API Endpoints** (1.5 gün)
   - POST/GET/PUT endpoints
   - Validation & Authorization
   - Error handling
   - Test ile doğrula

### Phase 2: Frontend & UI (Hafta 2)
1. **Admin Paneli Sayfaları** (2 gün)
   - Qualiopi Gösterge Panosu
   - Memnuniyet Anketi Analytics
   - Döküman Arşiv

2. **React Bileşenleri** (1.5 gün)
   - Stateful components
   - Data fetching hooks
   - Form handling

3. **Integration & Testing** (1.5 gün)
   - API entegrasyonu
   - E2E testing
   - Bug fixes

### Phase 3: Automation & Optimization (Hafta 2.5)
1. **Otomasyonlar**
   - Bilans tamamlanınca anket gönder
   - Döküman otomatik arşivle
   - Compliance % otomatik hesapla

2. **Raporlama**
   - PDF rapor oluşturma
   - Scheduled raporlar (email)

---

## 📊 BAŞARIM KRİTERLERİ

### Fonksiyonel Kriterler
- [ ] 3 ana Qualiopi göstergesi (1, 11, 22) tam uyumluluk takibi
- [ ] Memnuniyet anketi sistem otomatik gönderim ve yanıt toplama
- [ ] Döküman arşivi tam audit trail
- [ ] Uyumluluk raporu otomatik oluşturma (JSON + PDF)

### Teknik Kriterler
- [ ] 0 TypeScript errors
- [ ] >80% code coverage
- [ ] API response time < 500ms
- [ ] Document archiving 100% success rate

### UI/UX Kriterler
- [ ] Admin paneli responsive & intuitive
- [ ] Qualiopi gösterge panosu 3-click accessibility
- [ ] Analytics grafikler responsive
- [ ] Mobile-friendly (tablet+)

---

## ⏱️ TAHMİNİ ZAMAN ÇIZELGESI

| Aşama | Görev | Tahmini Süre |
|-------|-------|--------------|
| 1 | Veritabanı Şeması & Migrasyonlar | 1.5 gün |
| 2 | Backend Servisler | 2 gün |
| 3 | API Endpoints & Testing | 1.5 gün |
| 4 | Frontend Sayfaları | 2 gün |
| 5 | React Bileşenleri | 1.5 gün |
| 6 | Integration & E2E Test | 1.5 gün |
| 7 | Otomasyonlar & Optimizasyon | 1 gün |
| 8 | Final Testing & Deployment | 1 gün |
| | **TOPLAM** | **~12 iş günü (Sprint 7 süresi)** |

---

## 📋 ÖZET

### Oluşturulacak Bileşenler
- **Veritabanı Tabloları**: 8 yeni tablo
- **Backend Servisler**: 4 servis sınıfı
- **API Endpoints**: 10+ endpoints
- **Frontend Sayfaları**: 3 ana sayfa
- **React Bileşenleri**: 15+ bileşen
- **Tests**: 50+ test case

### Tahmini Kod Satırları
- **Backend**: ~1,500 lines (services + routes)
- **Frontend**: ~2,000 lines (pages + components)
- **Tests**: ~1,000 lines
- **Database**: ~300 lines (SQL migrations)
- **TOPLAM**: ~4,800 lines

### Önemli Notlar
1. **Qualiopi Sertifikasyon**: Bu modül tam sertifikasyon değil, pre-compliance desteği sağlar
2. **Gelecek Planlama**: Kalan 29 göstergenin takibi Phase 2'de
3. **Audit Ready**: Sistem Q1 2026 audit'e hazır olacak
4. **Otomasyon Önemli**: Memnuniyet anketleri otomatik gönderimi critical

---

## 🚀 SONRAKI ADIM

Bu plan onaylandıktan sonra:
1. ✅ Detaylı implementasyon başla
2. ✅ Daily progress reports
3. ✅ Haftalık onay checkpoint'leri
4. ✅ Final testing & deployment

---

**Plan Hazırlayıcı**: Claude Code AI
**Durum**: 📋 Onay Bekleniyor
**Tarih**: 2025-10-22

