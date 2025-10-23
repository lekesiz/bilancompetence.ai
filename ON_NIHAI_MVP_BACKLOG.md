# 🎯 Ön Nihai MVP Görev Listesi (Backlog)

**Proje:** BilanCompetence.AI
**Tarih:** 2025-10-23
**Hazırlayan:** Claude AI + Abacus.AI Gap Analysis
**Durum:** Manus Smoke Test Sonucunu Beklemede

---

## 📊 Özet

| Kategori | Görev Sayısı | Durum | Öncelik |
|----------|------------|-------|---------|
| **Kritik Altyapı** | 12 | ⏳ In Progress | KRİTİK |
| **TypeScript & Build** | 32 | ⏳ In Progress | KRİTİK |
| **Backend Endpoints** | 18 | ⏳ Pending | YÜKSEK |
| **Frontend İyileştirmeler** | 24 | ⏳ Pending | YÜKSEK |
| **Test & QA** | 16 | ⏳ Pending | YÜKSEK |
| **Operasyonel** | 8 | ⏳ MVP Sonrası | ORTA |
| **Dokumentasyon** | 6 | ✅ Partial | ORTA |
| **Bonus Features** | 10 | ⏳ MVP Sonrası | DÜŞÜK |
| **TOPLAM** | **126** | - | - |

---

## 🔴 KRİTİK - Domain Deploy Öncesi (Tamamlanmalı)

### K1: Backend TypeScript Hata Düzeltmeleri
**Status:** 90/122 tamamlandı (74%)
**Kalan:** 32 hata (küçük property access ve type assertion issues)

**Altgörevler:**
- [x] Supabase type guards utility oluştur (`supabaseTypeGuards.ts`)
- [x] Enums helper oluştur (`enums.ts`)
- [x] schedulingService.ts düzelt (20 hata)
- [x] supabaseService.ts düzelt (18 hata)
- [x] userService.ts düzelt (13 hata)
- [x] assessmentService.ts düzelt (11 hata)
- [x] analyticsService.ts düzelt (8 hata)
- [x] Diğer services düzelt (12 hata)
- [ ] Remaining 32 hata (scheduling.ts, compliance, qualiopt, survey services)
- [ ] `npm run build` 0 error ile geç
- [ ] TypeScript errors 0'a indir

**Sahibi:** Claude
**Tahmini Süre:** 2-3 saat (Remaining fixes)
**Blokaja:** Manus deployment öncesi bitmiş olmalı

---

### K2: Backend Build & Test Doğrulaması
**Status:** Başlanmadı

**Altgörevler:**
- [ ] `npm run build` koş ve 0 exit code doğrula
- [ ] `npm run test` koş ve tests pass etsin
- [ ] Backend dev server başlat: `npm run dev`
- [ ] Temel health check endpoint test et: `GET /api/health`
- [ ] Authentication flow test et (login, token generation)
- [ ] Database connection test et (Supabase credentials verify)

**Sahibi:** Claude
**Tahmini Süre:** 30 dakika
**Blokaja:** TypeScript fixes tamamlandıktan sonra

---

### K3: Vercel Hybrid Deployment Setup (Manus tarafından)
**Status:** Manus'un smoke test'inde

**Not:** Bu görev Manus'un sorumluluğunda. Manus:
- [ ] Vercel project structure kurulumunu tamamla
- [ ] API routes (`/api/*` handler) setup et
- [ ] Environment variables Vercel dashboard'a ekle
- [ ] Frontend + Backend single deployment doğrula
- [ ] Smoke test (CRUD operations, auth, error handling) çalıştır

**Sahibi:** Manus
**Blokaja:** Claude'un build verification'ını geçmesi gerekir

---

### K4: Frontend Basic Operasyonel (Known Issues Fixler)
**Status:** Manus feedback'i bekleniyor

**Manus'un tespit ettiği issues (Vercel deploy sırasında görülen):**
- [ ] Dashboard sayfa hata mesajları (Manus tarafından raporlanan)
- [ ] Navigation issues (eğer varsa)
- [ ] Session management (eğer varsa)
- [ ] Form submission errors (eğer varsa)
- [ ] API connection issues (test environment)

**Sahibi:** Claude (Manus feedback sonrası)
**Tahmini Süre:** 1-2 saat (feedback'e bağlı)
**Blokaja:** Manus'un smoke test sonuçları

---

## 🟡 YÜKSEK ÖNCELİK - MVP İçin Kritik Eksiklikler

### Y1: Email Service Implementation (SendGrid)
**Status:** Hazırlık tamamlandı, implementation başlanmadı
**GAP:** Backend email templates hazır, ama SendGrid entegrasyonu yapılmadı

**Altgörevler:**
- [ ] SendGrid API key'i Vercel environment'ine ekle
- [ ] `src/services/emailService.ts` implement et
- [ ] Email template'leri (welcome, verification, reset) finalize et
- [ ] Test et: Email gönderme işlemi
- [ ] Retry logic ekle (failed emails)

**Kullanılan Endpoints:**
- POST `/auth/register` - Welcome email gönder
- POST `/auth/verify-email` - Verification email link gönder
- POST `/auth/forgot-password` - Password reset email gönder

**Sahibi:** Claude
**Tahmini Süre:** 2-3 saat
**Dependency:** Backend build pass etmesi

---

### Y2: Assessment CRUD API Endpoints
**Status:** Partial (20% tamamlandı, Abacus gap analysis'te flagged)

**Eksik Endpoints:**
- [ ] `POST /api/assessments` - Create assessment (bilan)
- [ ] `GET /api/assessments/:id` - Get single assessment
- [ ] `PUT /api/assessments/:id` - Update assessment
- [ ] `DELETE /api/assessments/:id` - Soft delete assessment
- [ ] `GET /api/assessments?beneficiary_id=X` - List user's assessments
- [ ] `POST /api/assessments/:id/questions` - Add questions to assessment
- [ ] `PUT /api/assessments/:id/status` - Update assessment phase (PRELIMINARY → INVESTIGATION → CONCLUSION)
- [ ] `POST /api/assessments/:id/recommendations` - Generate/save recommendations
- [ ] `GET /api/assessments/:id/recommendations` - Get recommendations

**Validation:**
- Assessment phases: PRELIMINARY → INVESTIGATION → CONCLUSION → COMPLETED
- Only consultant can modify assessment
- Beneficiary can only view and answer questions
- Recommendations require assessment to be in CONCLUSION phase

**Sahibi:** Claude
**Tahmini Süre:** 4-5 saat
**Dependency:** Backend build + TypeScript fixes
**Database:** bilans, bilan_questions, recommendations tables ready

---

### Y3: Session Booking & Scheduling API
**Status:** Service layer partial (80%), routes incomplete (30%)

**Eksik Endpoints:**
- [ ] `POST /api/scheduling/availability` - Create consultant availability
- [ ] `GET /api/scheduling/availability/:consultantId` - Get available slots
- [ ] `POST /api/scheduling/book-session` - Create session booking
- [ ] `GET /api/scheduling/sessions` - Get bookings (filter by user role)
- [ ] `PUT /api/scheduling/sessions/:id` - Update session (confirm, cancel, complete)
- [ ] `POST /api/scheduling/sessions/:id/rate` - Add beneficiary rating
- [ ] `GET /api/scheduling/calendar/:consultantId` - Calendar view for consultant
- [ ] `POST /api/scheduling/reminder` - Session reminder trigger

**Validation:**
- Availability slot validation (no conflicts)
- Session booking validation (slots available, user permissions)
- Status transitions (SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED/CANCELLED)

**Sahibi:** Claude
**Tahmini Süre:** 3-4 saat
**Dependency:** Backend build + Assessment endpoints
**Database:** availability_slots, session_bookings tables ready

---

### Y4: Frontend Authentication Flow
**Status:** Login/Register UI tamamlandı, backend integration incomplete

**Eksik Features:**
- [ ] Email verification flow (frontend → backend link handling)
- [ ] Password reset flow (frontend form + backend API)
- [ ] Token refresh logic (background token renewal)
- [ ] Logout + session cleanup
- [ ] "Remember me" functionality
- [ ] Error message handling (backend errors → user-friendly messages)
- [ ] Loading states during auth operations
- [ ] Redirect after login (role-based dashboard)

**Sahibi:** Frontend Team (Manus'un feedback sonrası)
**Tahmini Süre:** 3-4 saat
**Dependency:** Email service + Backend auth endpoints verified

---

### Y5: Dashboard Role-Based Rendering
**Status:** Basic dashboard tamamlandı, role-based views incomplete (30%)

**Beneficiary Dashboard Eksikleri:**
- [ ] Active assessments card (status, progress)
- [ ] Recommendations section
- [ ] Upcoming sessions calendar
- [ ] Session history
- [ ] Rating & feedback on completed sessions

**Consultant Dashboard Eksikleri:**
- [ ] Assigned assessments list
- [ ] Client management (list, filter, search)
- [ ] Availability calendar
- [ ] Session bookings (upcoming, completed)
- [ ] Assessment templates quick create

**Admin Dashboard Eksikleri:**
- [ ] Organization statistics
- [ ] User management (CRUD)
- [ ] System health monitoring
- [ ] Audit logs viewer
- [ ] Reports & analytics

**Sahibi:** Frontend Team
**Tahmini Süre:** 4-5 saat
**Dependency:** Role-based backend API endpoints working

---

### Y6: PDF Generation & Watermarking
**Status:** Flagged by Abacus.AI (Security & Compliance)

**Altgörevler:**
- [ ] PDF generation library ekle (`pdfkit` or `puppeteer`)
- [ ] Assessment report PDF template oluştur
- [ ] Recommendation report PDF template oluştur
- [ ] Watermarking logic (beneficiary name, date, session info)
- [ ] Backend endpoint: `GET /api/assessments/:id/pdf-report`
- [ ] Frontend: "Download Report" button

**Security Requirements:**
- PDF access control (only authorized users can download)
- Watermark prevents unauthorized sharing
- Server-side generation (not client-side)
- Temporary file cleanup

**Sahibi:** Claude
**Tahmini Süre:** 3-4 saat
**Dependency:** Assessment endpoints tamamlanmalı

---

### Y7: Test Coverage - Backend
**Status:** Test files başlanmadı (0%)

**Unit Tests (Jest):**
- [ ] Auth service tests (login, register, token verification)
- [ ] User service tests (CRUD operations)
- [ ] Assessment service tests (create, update, status transitions)
- [ ] Scheduling service tests (availability, booking, conflict detection)
- [ ] Email service tests (template rendering, SendGrid mock)
- [ ] Helper functions tests (validators, transformers)

**Target Coverage:** >80% (MVP requirement)

**Test Files to Create:**
- `src/services/__tests__/authService.test.ts`
- `src/services/__tests__/userService.test.ts`
- `src/services/__tests__/assessmentService.test.ts`
- `src/services/__tests__/schedulingService.test.ts`
- `src/utils/__tests__/validators.test.ts`

**Sahibi:** Claude
**Tahmini Süre:** 4-5 saat
**Dependency:** All service implementations complete

---

### Y8: Frontend Test Coverage
**Status:** 0%

**Component Tests (Vitest/React Testing Library):**
- [ ] Login/Register forms
- [ ] Dashboard layouts (beneficiary, consultant, admin)
- [ ] Assessment form
- [ ] Session booking calendar
- [ ] Error handling components

**Target Coverage:** >60% (MVP requirement)

**Sahibi:** Frontend Team
**Tahmini Süre:** 3-4 saat

---

### Y9: API Documentation
**Status:** 0% (Auto-generated by Swagger/OpenAPI)

**Tasks:**
- [ ] Swagger/OpenAPI spec generator setup
- [ ] Auto-generate API docs from route comments
- [ ] Publish docs: `/api/docs`
- [ ] Include auth example, error responses
- [ ] Test all endpoints in docs (try-it-out feature)

**Sahibi:** Claude (code comments) + DevOps
**Tahmini Süre:** 2 saat

---

## 🟠 ORTA ÖNCELİK - MVP Sonrası (Phase 2)

### M1: Monitoring & Logging (Abacus.AI önerisiyle)
**Status:** Logger utility setup tamamlandı, monitoring incomplete

- [ ] Application performance monitoring (APM) setup
- [ ] Error tracking (Sentry or similar)
- [ ] Centralized logging (ELK stack or Vercel logs)
- [ ] Alert setup (critical errors)
- [ ] Health check endpoint

**Tahmini Süre:** 3-4 saat
**Öncelik:** MVP sonrası, production deploy sonrası kritik

---

### M2: Backup & Disaster Recovery (Abacus.AI önerisiyle)
**Status:** 0%

- [ ] Database backup automation (Supabase automated backups)
- [ ] Backup verification process
- [ ] Restore procedure documentation
- [ ] RTO/RPO setup (Recovery Time/Point Objectives)

**Tahmini Süre:** 2-3 saat
**Öncelik:** Production deploy öncesi, MVP sonrası

---

### M3: Performance Optimization
**Status:** 0%

- [ ] Database query optimization (indexes, eager loading)
- [ ] API response caching (Redis if needed)
- [ ] Image optimization (frontend assets)
- [ ] Bundle size reduction
- [ ] CDN setup (for static assets)

**Tahmini Süre:** 4-6 saat
**Dependent:** All endpoints implemented

---

### M4: Advanced Auth Features
**Status:** Basic JWT auth done

- [ ] Two-factor authentication (2FA) - optional for admin
- [ ] Single sign-on (SSO) - optional, enterprise feature
- [ ] Role-based access control refinement
- [ ] Refresh token rotation
- [ ] Session management (concurrent logins limit)

**Tahmini Süre:** 4-5 saat
**Öncelik:** MVP sonrası, enterprise feature

---

### M5: Internationalization (i18n)
**Status:** Kısmi (en, fr ready - de pending - tr pending)

**Şu anda:**
- [x] English (en) - Complete
- [x] French (fr) - Complete
- [ ] German (de) - To add
- [ ] Turkish (tr) - To add

**Tasks:**
- [ ] Translation keys extract from frontend
- [ ] Language switch component
- [ ] Backend translation support
- [ ] Test all language variants

**Tahmini Süre:** 3-4 saat

---

## 🟢 DÜŞÜK ÖNCELİK - Nice-to-Have Features

### L1: Advanced Analytics
- [ ] User engagement metrics
- [ ] Assessment completion rate tracking
- [ ] Consultant effectiveness metrics
- [ ] Custom reports generation
- [ ] Dashboard export (PDF, Excel)

**Tahmini Süre:** 5-6 saat

---

### L2: Notifications System
- [ ] In-app notifications
- [ ] Email notifications (assessment updates, session reminders)
- [ ] Push notifications (web/mobile)
- [ ] Notification preferences (user settings)

**Tahmini Süre:** 4-5 saat

---

### L3: Advanced Search & Filters
- [ ] Full-text search on assessments
- [ ] Advanced filtering (date range, status, consultant)
- [ ] Saved filters/favorites
- [ ] Search suggestions/autocomplete

**Tahmini Süre:** 3-4 saat

---

### L4: Bulk Operations
- [ ] Bulk assessment status update
- [ ] Bulk user import (CSV)
- [ ] Bulk email sending
- [ ] Bulk export (assessments, sessions)

**Tahmini Süre:** 3-4 saat

---

### L5: Data Visualization
- [ ] Assessment progress charts
- [ ] User statistics dashboard
- [ ] Completion rate trends
- [ ] Interactive reports

**Tahmini Süre:** 3-4 saat

---

## 📋 Maus Smoke Test Sonrası Güncellenecek Kısımlar

Manus'un smoke test'i sonrası aşağıdaki görevler **KRİTİK veya YÜKSEK**'e taşınması gerekebilir:

```markdown
### Manus Tarafından Raporlanan Issues:
- [ ] [PLACEHOLDER - Manus test'ten sonra doldurulacak]

**Örnek Issues (Tahmini):**
- [ ] Dashboard endpoint connection error
- [ ] Auth token validation failing
- [ ] Form submission validation missing
- [ ] Database query timeout
- [ ] CORS policy issue
- [ ] API error response format inconsistency
```

---

## 🏆 Görev Tamamlama Sırası

### Faz 1: Altyapı & Build (This Session)
**Sorumlu:** Claude
**Tahmini Süre:** 2-3 saat

1. ✅ Supabase type guards oluştur
2. ✅ TypeScript hataları düzelt (90/122 done)
3. ⏳ Remaining 32 hata düzelt
4. ⏳ Build verification: `npm run build && npm run test`

**Çıktı:** Zero build errors + passing tests

---

### Faz 2: Manus Smoke Test & Feedback (Parallel)
**Sorumlu:** Manus
**Tahmini Süre:** 1-2 saat

1. Vercel deployment setup (hybrid approach)
2. Basic smoke tests (CRUD, auth, error handling)
3. Report issues ve frontendissues
4. Share results dengan Claude

**Çıktı:** Issue list + Working deployment

---

### Faz 3: Critical Fixes + Core Features (Sequential)
**Sorumlu:** Claude
**Tahmini Süre:** 6-8 saat

Based on Manus feedback:
1. Fix reported issues (K4)
2. Implement email service (Y1)
3. Implement assessment APIs (Y2)
4. Implement scheduling APIs (Y3)

**Çıktı:** Working backend APIs

---

### Faz 4: Frontend Integration (Parallel)
**Sorumlu:** Frontend Team / Manus
**Tahmini Süre:** 4-5 saat

1. Auth flow UI (Y4)
2. Dashboard role-based views (Y5)
3. Form integrations
4. Error handling

**Çıktı:** Functioning frontend

---

### Faz 5: Testing & Documentation
**Sorumlu:** Claude
**Tahmini Süre:** 4-5 saat

1. Test coverage (Y7)
2. API documentation (Y9)
3. User documentation
4. Deployment guide

**Çıktı:** Documented & tested MVP

---

### Faz 6: Polish & Optimization
**Sorumlu:** Team
**Tahmini Süre:** 2-3 saat

1. Performance optimization (M3)
2. UI/UX polish
3. Final testing
4. Production readiness

**Çıktı:** Production-ready MVP

---

## 📈 Tahmini Timeline

| Faz | Sorumlu | Tahmini Süre | Takvim |
|-----|---------|-------------|--------|
| Faz 1 | Claude | 2-3 saat | Bugün (Oct 23) |
| Faz 2 | Manus | 1-2 saat | Bugün paralel |
| Faz 3 | Claude | 6-8 saat | Oct 24-25 |
| Faz 4 | Frontend | 4-5 saat | Oct 25-26 |
| Faz 5 | Claude | 4-5 saat | Oct 26-27 |
| Faz 6 | Team | 2-3 saat | Oct 27 |
| **TOPLAM** | - | **20-26 saat** | **Oct 23-27** |

---

## 🎯 MVP Definition

**MVP olarak kabul edilir:**
- ✅ Zero TypeScript errors
- ✅ Authentication (register/login/logout)
- ✅ User roles (BENEFICIARY, CONSULTANT, ORG_ADMIN)
- ✅ Assessment CRUD + status management
- ✅ Session booking + scheduling
- ✅ Dashboard (role-specific views)
- ✅ Email notifications (welcome, verification)
- ✅ Basic error handling
- ✅ Test coverage >70%
- ✅ API documentation
- ✅ Deployed to production (Vercel hybrid)

**NOT included in MVP:**
- ❌ Advanced analytics
- ❌ 2FA/SSO
- ❌ Multi-language full support
- ❌ Mobile app
- ❌ Advanced search/filters

---

## 🔄 Güncellenmiş Backlog (Smoke Test'ten Sonra)

Bu backlog Manus'un smoke test'i tamamlandığında aşağıdaki şekilde güncellencek:

```markdown
## Manus Smoke Test Results (Oct 23, 15:00 UTC)

### Reported Issues:
1. [Issue Description] - CRITICAL
2. [Issue Description] - HIGH
3. ...

### Workarounds/Temporary Fixes:
- [Workaround for issue 1]
- [Workaround for issue 2]

### Fixed Items:
- ✅ [Completed by Manus/Claude]

### Next Steps:
- Priority 1: Fix critical issues
- Priority 2: Implement missing endpoints
- Priority 3: Polish & optimization
```

---

## 📝 Notlar

- **Version Control:** Tüm changes git'e commit edilecek
- **Code Review:** Önemli changes code review'dan geçecek
- **Testing:** Her feature için test yazılacak
- **Documentation:** Inline comments + API docs
- **Communication:** Daily standup (if async, Slack updates)

---

**Hazırlayan:** Claude AI
**İncelemeler:** Manus (deployment), Project Manager
**Son Güncelleme:** 2025-10-23 15:45 UTC
**Durum:** Ready for Phase 1 Completion + Phase 2 Feedback

🚀 **MVP hedefi: Oct 27 tamamlanması**
