# BilanCompetence.ai - Protected Routes Analizi

## Tarih
23 Ekim 2025

## Korumalı Route'lar Listesi

### 1. Dashboard
**Path:** `/dashboard`
**File:** `apps/frontend/app/(protected)/dashboard/page.tsx`
**Açıklama:** Ana kullanıcı dashboard'u

### 2. Assessments (Yetkinlik Değerlendirmeleri)
**Base Path:** `/assessments`
**Files:**
- `apps/frontend/app/(protected)/assessments/page.tsx` - Assessment listesi
- `apps/frontend/app/(protected)/assessments/create/page.tsx` - Yeni assessment oluşturma
- `apps/frontend/app/(protected)/assessments/[id]/page.tsx` - Assessment detayı
- `apps/frontend/app/(protected)/assessments/[id]/wizard/page.tsx` - Assessment wizard (sihirbaz)

### 3. Profile
**Path:** `/profile`
**File:** `apps/frontend/app/(protected)/profile/page.tsx`
**Açıklama:** Kullanıcı profili

### 4. Recommendations
**Path:** `/recommendations`
**File:** `apps/frontend/app/(protected)/recommendations/page.tsx`
**Açıklama:** Kariyer önerileri

### 5. Saved Jobs
**Path:** `/saved-jobs`
**File:** `apps/frontend/app/(protected)/saved-jobs/page.tsx`
**Açıklama:** Kaydedilmiş iş ilanları

### 6. Admin - Qualiopi
**Base Path:** `/admin/qualiopi`
**Files:**
- `apps/frontend/app/(protected)/admin/qualiopi/indicators/page.tsx` - Qualiopi göstergeleri
- `apps/frontend/app/(protected)/admin/qualiopi/surveys/page.tsx` - Qualiopi anketleri
- `apps/frontend/app/(protected)/admin/qualiopi/reports/page.tsx` - Qualiopi raporları
- `apps/frontend/app/(protected)/admin/qualiopi/archive/page.tsx` - Qualiopi arşivi

## Test Edilecek Route'lar (Öncelik Sırasına Göre)

### Yüksek Öncelik (MVP Core Features)
1. `/dashboard` - Ana dashboard
2. `/assessments` - Assessment listesi
3. `/assessments/create` - Yeni assessment
4. `/assessments/[id]/wizard` - Assessment wizard
5. `/profile` - Kullanıcı profili

### Orta Öncelik (MVP Extended Features)
6. `/recommendations` - Kariyer önerileri
7. `/saved-jobs` - Kaydedilmiş işler

### Düşük Öncelik (Admin Features)
8. `/admin/qualiopi/*` - Admin Qualiopi sayfaları

## Beklenen Davranışlar

### Scenario 1: Giriş Yapmamış Kullanıcı
- **Beklenen:** Login sayfasına yönlendirme
- **Test:** Doğrudan URL ile erişim

### Scenario 2: Giriş Yapmış Kullanıcı (Token var ama backend 501)
- **Beklenen:** Sayfa yüklenir ama veri çekerken 501 hatası
- **Test:** Token ile erişim (manuel olarak localStorage'a token ekleyerek)

### Scenario 3: Backend API Çağrıları
- **Beklenen:** 501 Not Implemented veya 404 Not Found
- **Test:** Network tab'de API isteklerini kontrol et

## Smoke Test Planı

### Phase 1: Route Keşfi ✅
- [x] Protected routes listesi oluşturuldu
- [x] Öncelik sıralaması yapıldı

### Phase 2: Kayıt ve Login Testi
- [ ] Kayıt formunu doldur
- [ ] Backend 501 yanıtını doğrula
- [ ] Console hatalarını kaydet

### Phase 3: Korumalı Sayfalara Doğrudan Erişim
- [ ] `/dashboard` - Test et
- [ ] `/assessments` - Test et
- [ ] `/assessments/create` - Test et
- [ ] `/profile` - Test et
- [ ] `/recommendations` - Test et

### Phase 4: Rapor Hazırlama
- [ ] Tüm test sonuçlarını derle
- [ ] Console hatalarını listele
- [ ] Network isteklerini analiz et
- [ ] Final raporu oluştur

