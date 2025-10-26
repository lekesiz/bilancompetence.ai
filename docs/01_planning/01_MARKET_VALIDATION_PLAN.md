# FAZA 0: Pazar Doğrulaması & Stratejik Validasyon
**Cep Tarihi**: 20 Ekim 2025
**Durum**: ACTIVE
**Hedef**: Şirket tarafından geliştirilen stratejiyi pazar gerçekleri ile doğrulamak

---

## I. YÖNETİCİ ÖZETİ

Bu faz, 120.000€ yatırım yapmadan önce pazar ve ürün-pazar uyumunun valide edilmesini amaçlar.

**Başarı Kriterleri:**
- ✅ 10+ konsultanla mülakatlar tamamlandı ve doğrulama yazıları alındı
- ✅ 5+ organisme tarafından "niyetli satın alma" (LOI) veya yazılı güvence
- ✅ Minimum 50 kişi landing page'den liste kayıt oldu
- ✅ Teknik uygulanabilirlik onaylandı (Gemini API, France Travail API)
- ✅ GO/NO-GO kararı alındı

---

## II. MÜLAKATLAR VE FEEDBACK TOPLAMA

### A. Konsultanlar (Target: 10 Kişi)

**Amacı**: Ürün-pazarlama uyumunu ve önemli ağrı noktalarını öğrenmek

**Açıklamalar Listesi** (Türkiye'de başlayıp Fransa'daki ağlara genişleyeceğiz):

#### Türkiye Temelli Danışmanlar:
1. **Mülakatçı**: LinkedIn Recruiter ile "bilan de compétences consultant France"
2. **Kişi 1**: Uluslararası danışman (Türkiye'de, Fransa'yla bağlantılı)
3. **Kişi 2**: Career coach (Fransa-merkezli)
4. **Kişi 3**: HR danışmanı (remote)
5. **Kişi 4**: Kurum danışmanı (organizational development)

#### Fransa-Merkezli Danışmanlar (LinkedIn, FFP Networkleri):
6. **Kişi 6**: Küçük organisme başkanı (1-5 danışman)
7. **Kişi 7**: Bağımsız danışman (bootstrap)
8. **Kişi 8**: Büyük organisme danışmanı (20+ danışman)
9. **Kişi 9**: Qualiopi sertifikalı danışman
10. **Kişi 10**: Başka bir danışman ağından referans

**Mülakat Soruları (30 dakika)**:

```
1. Bilan de compétences işinizde karşılaştığınız 3 en büyük sorun nedir?
2. Şu an hangi araçlar kullanıyorsunuz (Excel, CRM, vb.)?
3. Yönetim ve idari görevler toplam zamanınızın yüzde kaçını alıyor?
4. Qualiopi uyumluluğu için neler yapıyor/harcıyorsunuz?
5. Dijital bir platform için aylık olarak ne kadar ödemeye istekli olurdunuz?
6. Bilan de compétences için yapay zeka önerileri ne kadar yararlı olurdu? (1-10 skala)
7. Platform bir danışmana ne kadar değer katasaydı, en önemli 3 özellik ne olurdu?
8. Bu platform için şu an ne kadarı harcamaya karar verebilirsiniz? (30 gün içinde)
9. Ürün beta test etmeye ilgi duyar mıydınız? (ücret yok)
10. Bu çözümü başka danışmanlar ile paylaşır mıydınız?
```

**Mülakatlar ile alınacak çıktılar:**
- Ses kaydı (onay ile)
- Mülakat notları
- Doğrulama formu (Evet/Hayır kullanım niyeti)
- Öneriler ve geri bildirimi
- Referans başkaları için

---

### B. Organizm Müdürleri / Kuruluş Liderleri (Target: 5 Kişi)

**Amacı**: Kuruluş seviyesinde satış olasılığını ve sorunları anlamak

**Mülakat Soruları (45 dakika)**:

```
1. Kurumunuzda kaç danışman çalışıyor? (Yıl)
2. Şu an kaç aktif "bilan de compétences" yapılıyor? (Aylık/Yıllık)
3. Bu işlem için ne harcıyorsunuz? (Yazılım, eğitim, yönetim)
4. Qualiopi sertifikasyon süreci ne kadar zordu?
5. Danışmanlarınızdan en sık aldığınız şikayetler neler?
6. Çevrimiçi platform satın almaya kimin onayı gerekiyor?
7. İdeal ürün özellikleriniz nelerdir?
8. SaaS model vs. lisansla satın alma: tercih ediyor musunuz?
9. Platform pilot test etmeye ilgi duyar mıydınız? (30 danışman, 1 ay)
10. Referans müşteri olmaya (veya case study) ilgi duyar mıydınız?
```

**Hedef Organizm Türleri:**
- Küçük bağımsız organisme (1-5 danışman)
- Orta boy organisme (5-20 danışman)
- Büyük organisme (20+ danışman)
- Kamu bağlı organisme
- Özel sektör eğitim sağlayıcı

---

## III. LANDING PAGE VE HABER LİSTESİ

### A. Landing Page (12 saat tasarım & yazılım)

**Platform**: Webflow, Vercel + React, atau Framer

**Bileşenler:**
```
1. Hero Section
   - Başlık: "Bilan de Compétences Dijitale - Danışmanlar için Zaman Tasarrufu"
   - Alt başlık: "Yönetimsel işlemlerden 40% tasarruf, Qualiopi'ye 30 dk'da uyum"
   - CTA: "Erken Kullanıcı Ol (Ücretsiz Beta)" ← Email topla

2. Sorunlar (Pain Points)
   - Yönetim çok zaman alıyor
   - Qualiopi uyumluluğu karmaşık
   - Bénéficiaire takibi zor
   - Dokümantasyon manuel

3. Çözüm (How it works)
   - Otomatik yönetim
   - Qualiopi compliance built-in
   - AI-destekli analiz
   - Butonan belge

4. Fiyatlandırma (3-tier model)
   - Starter: 49€/ay
   - Professional: 149€/ay
   - Enterprise: Özel

5. FAQ
   - Qualiopi nedir?
   - Veri güvenliği?
   - İlk kurulum ne kadar?
   - Denemesi free mü?

6. CTA Footer: "Ücretsiz Demo Al" ← Email + telefon
```

**Landing Page Metrikleri (1. Hafta)**:
- Views: 500-1000
- Email signups: Min. 50
- Demo talepleri: Min. 10
- Conversion rate: % 5+ hedefi

---

## IV. LİNKEDİN KAMPANYASI

**Stratejisi**: Direktif B2B satış + düşük bütçe reklam

### A. Organik Outreach (0€, 5 saat)

**Konular**:
1. "Bilan de compétences 2025: Dijital dönüşüm başladı"
2. "Danışmanlar: Yönetim işlerinden kurtulun"
3. "Qualiopi uyumluluğu nasıl otomatik hale getirilir?"
4. "AI + İnsan danışmanlığı = İdeal kombinasyon"

**Hedefler**:
- FFP (Fédération de la Formation Professionnelle) üyeleri
- Bilan danışmanları
- RH direktörleri
- Organisme müdürleri

**Gönderme Planı**:
- Pazartesi & Çarşamba: Düşünceli post'lar
- Salı & Perşembe: Doğrudan mülakatlar için Linked In DM

---

### B. Ücretli LinkedIn Kampanyası (500€, 1. hafta)

**Hedef Kitlesi**:
- Job title: "Consultant", "Bilan", "Coach", "Director"
- Coğrafya: France
- Endüstri: Training, HR

**Kampanya Yapısı**:
- Ad 1: "Zamanı geri al" (problemi vurgula)
- Ad 2: "Danışmanlar nasıl farkı görüyor" (testimonial tarzı)
- Ad 3: "Qualiopi Made Easy" (compliance açısı)

**Budget Dağılımı**:
- 300€ targeting consultants
- 200€ targeting organisme directors

**Hedefler**:
- Min. 50 email signups
- Min. 10 demo talepleri
- Min. 5 mülakatlar
- Cost per signup: ~10€

---

## V. TEKNIK UYGULANABILIRLK KONTROL

### A. Gemini API (Google AI)

**Gereklilikler Kontrol Listesi**:
- [x] Gemini 2.0 Flash modeli available
- [x] Türkiye IP'den erişim
- [x] Fiyatlandırma (aylık 1000 requests: ~10€)
- [x] Latency test (< 2 saniye)
- [ ] Fine-tuning örneğinden test yapılacak

**Beklenen Çıktılar**:
- Koştu test yapıldığını gösteren raporlar
- Maliyet tahminleri (AI işlemi başına)
- Latency sayıları

---

### B. France Travail API (Pôle Emploi)

**Gereklilikler Kontrol Listesi**:
- [ ] Developer account kayıt olması
- [ ] API docs incelenmesi
- [ ] Rate limits (requests/min, daily cap)
- [ ] Data availability (job listings, ROME codes)
- [ ] Latency test
- [ ] Authentication method

**Beklenen Çıktılar**:
- API integration ready document
- Rate limits document
- Sample responses
- Alternative providers (if needed)

---

### C. Database & Infrastructure

**Seçimler**:
- database: Neon PostgreSQL (PostgreSQL + Auth)
- Hosting: Vercel (frontend + edge functions)
- Storage: AWS S3 (documents)
- Email: SendGrid (SMTP)
- Search: Algolia (full-text search)

**Uygulanabilirlik Kontrol**:
- [ ] Supabase connection test
- [ ] Vercel deployment test
- [ ] S3 bucket setup
- [ ] SendGrid template setup
- [ ] Algolia index example

---

## VI. FINANSAL DOĞRULAMA

### A. Pazar Büyüklüğü Doğrulaması

**Hedef**: Stratejideki "500K bilans/yıl" tahminini doğrulamak

**Kaynaklar**:
1. FFP (Fédération de la Formation Professionnelle) raporları
2. France Compétences veri
3. INSEE (Fransız istatistikleri) eğitim bölümü
4. İndividüel mülakatlar (bottom-up)

**Başarı Kriterleri**:
- 500K-750K bilans/yıl = Market doğrulandı
- 250K-500K bilans/yıl = Market smaller than expected
- < 250K bilans/yıl = Market redirection needed

---

### B. Fiyatlandırma Doğrulaması

**Mülakatlarda sorulacak**:
```
1. Şu anki yazılım için ne harcıyorsunuz?
2. Ekstra 49€/ay'a değer mi?
3. Premium features için 149€ çok mu?
4. Uzun vadeli (yıllık) indirimi tercih ediyor musunuz?
```

**Hedefler**:
- 49€/ay model viability
- 150€/ay market acceptance
- Ödeme istekliliği > %60

---

### C. TAM Yıl 1 Bütçe Teyidi

**Yeniden kontrol edilecek**:
- Dev maliyetleri (73K€) - Manus AI ile teyid
- İnfrastruktur (6.5K€) - Teknik team'den tahmin
- Marketing (20K€) - Test sonuçlarından
- HR (20K€) - Hukuk danışmanı

---

## VII. GO/NO-GO KARAR KRİTERLERİ

### "GO" Kararı İçin Gerekli Şartlar:

✅ **Pazar Tarafından**:
- 10/10 danışmanla mülakat = ≥ 7 pozitif feedback
- 5/5 organizme ile mülakat = ≥ 3 satın alma niyeti
- Landing page signup = ≥ 50 kişi
- LinkedIn campaign conversion = ≥ %3

✅ **Teknik Tarafından**:
- Gemini API working + cost validated
- France Travail API access confirmed
- Infrastructure POC completed

✅ **Finansal Tarafından**:
- Funding secured (min 60K€)
- Pazar büyüklüğü confirmed (min 300K bilans/yıl)
- Unit economics viable (LTV > 3x CAC)

### "PIVOT" Kararı İçin Durumlar:

🔄 **Pivot Seçenekleri**:
- Coğrafya değiş (Belçika, İsviçre)
- Segmentasyon değiş (sadece büyük organizm)
- Fiyatlandırma değiş
- Feature set değiş

### "NO-GO" Kararı İçin Durumlar:

❌ **Durdurma Sinyalleri**:
- <40% mülakat pozitif feedback
- < 20 landing page signup
- Gemini/France Travail API erişim yok
- Funding secure edilemedi

---

## VIII. HAFTALIK TAKVIM

### Hafta 1 (20-25 Ekim 2025):
**Pazartesi-Salı (20-21 Ekim)**:
- [ ] Landing page taslak tasarımı
- [ ] LinkedIn campaign setup
- [ ] Mülakat script finalize

**Çarşamba-Perşembe (22-23 Ekim)**:
- [ ] Landing page go live
- [ ] First 3 consultants contacted
- [ ] Gemini API test

**Cuma (24 Ekim)**:
- [ ] France Travail API setup başla
- [ ] Mülakat notes analysis

---

### Hafta 2 (27-31 Ekim):
**Pazartesi-Çarşamba**:
- [ ] 10/10 mülakat tamamla
- [ ] 5/5 organisme mülakat tamamla
- [ ] Landing page optimization

**Perşembe-Cuma**:
- [ ] Feedback analysis
- [ ] GO/NO-GO tapport hazırla
- [ ] Executive Summary

---

## IX. EXPECTED OUTPUTS - FAZA 0 ÖNCESİ TAMAMLANACAK

1. ✅ **Mülakat Notları** (10 danışman + 5 organisme)
2. ✅ **Landing Page Analytics** (1 hafta verisi)
3. ✅ **LinkedIn Campaign Results**
4. ✅ **Teknik Doğrulama Raporu**
5. ✅ **GO/NO-GO Kararı** (detaylı analiz ile)
6. ✅ **Market Research Summary** (pazar büyüklüğü, rekabet)
7. ✅ **Finansal Update** (revised budget if needed)
8. ✅ **Sonraki Faz Planı** (FAZA 1 eğer GO ise)

---

## X. KIŞILER VE ROLLER (FAZA 0)

| Rol | Sorumlu | Saat/Hafta |\n|---|---|---|\n| **Project Manager** | NETZ INFORMATIQUE | 40 saat |\n| **Landing Page Dev** | Manus AI / Contractor | 12 saat |\n| **Mülakat Yöneticisi** | NETZ INFORMATIQUE | 20 saat |\n| **Teknik Lead** | Manus AI | 10 saat |\n| **Marketing Lead** | NETZ INFORMATIQUE / Agency | 15 saat |\n\n**TOPLAM**: ~97 saat / 2 hafta\n\n---\n\n**HAZIRLAYANLAR**: Profesyonel Proje Yönetim Ekibi  \n**TARİH**: 20 Ekim 2025  \n**DURUM**: ACTIVE - BAŞLANMAK ÜZERE\n