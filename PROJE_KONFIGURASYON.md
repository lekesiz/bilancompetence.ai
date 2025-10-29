# 🔧 BilanCompetence.AI - Proje Konfigürasyon ve Deployment Bilgileri

**Son Güncelleme:** 30 Ekim 2025  
**Not:** Bu dosya proje deployment ve test stratejisi hakkında kritik bilgiler içerir.

---

## 🚀 DEPLOYMENT ALTYAPISI

### Frontend - Vercel
- **URL:** https://app.bilancompetence.ai
- **Deployment:** Otomatik (git push sonrası)
- **Branch:** `main` → production
- **Framework:** Next.js 14
- **Test URL:** https://app.bilancompetence.ai (production ortamında test yapılıyor)
- **Vercel Token:** v5PAlpB1aGUijv8YHmmMSSTZ (`.vercel-token.txt`)
- **Project ID:** prj_oiAgQ2cG1RmfOBrGpKNw0wcHR8XO

### Backend - Railway
- **URL:** https://web-production-60dbd.up.railway.app
- **Deployment:** Otomatik (git push sonrası)
- **Branch:** `main` → production
- **Framework:** Express.js + TypeScript
- **Health Check:** `/health`
- **Version Endpoint:** `/api/version`
- **Railway Token:** 6e8a9275-7fcf-4305-bf75-7213c0c028a7 (`.railway-token.txt`)
- **Railway Config:** `apps/backend/railway.json`

### Database - Neon PostgreSQL
- **Organization ID:** org-shy-voice-89002201
- **Project ID:** delicate-recipe-65517628
- **REST API Endpoint:** https://ep-shy-waterfall-ahr8f8tp.apirest.c-3.us-east-1.aws.neon.tech/neondb/rest/v1
- **Connection String:** `postgresql://neondb_owner:npg_SWnEQIOXU83Y@ep-shy-waterfall-ahr8f8tp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **API Token:** napi_dgroac4a9beezwn10uja4dexo5e40i345ge214f2c3dl8rvjsfrq98whbco1hkbl (`.neon-token.txt`)
- **Type:** Serverless PostgreSQL
- **Connection:** Connection pooling aktif
- **Backups:** Automated daily backups

### Stack Auth (Neon Auth)
- **Project ID:** 3915fe6f-2981-447f-af29-cc0f334e3b19
- **JWKS URL:** https://api.stack-auth.com/api/v1/projects/3915fe6f-2981-447f-af29-cc0f334e3b19/.well-known/jwks.json
- **Publishable Key:** pck_ca57765qg0dcm4dzv01m2fp9g2fch85zrvc5tb3hvkqn8
- **Secret Key:** ssk_23mm4xxm2pdtczfky25h2f51v8dvtt2h7f5n3kgwpxmkg

---

## 📋 DEPLOYMENT WORKFLOW

### Mevcut Süreç

1. **Kod Değişiklikleri**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin main
   ```

2. **Otomatik Deployment**
   - ✅ Vercel → Otomatik deploy başlar
   - ✅ Railway → Otomatik deploy başlar (GitHub integration)
   - ⏱️ Genellikle 2-5 dakika içinde live olur

3. **Test Süreci**
   - ✅ Production URL'de test: https://app.bilancompetence.ai
   - ✅ Browser testleri online yapılıyor
   - ✅ Son kullanıcı testleri production ortamında gerçekleştiriliyor

### Manual Deploy Tetikleme

#### Vercel
```bash
cd apps/frontend
npx vercel@latest deploy --token v5PAlpB1aGUijv8YHmmMSSTZ --prod --yes
```

#### Railway
```bash
# Railway otomatik deploy GitHub webhook kullanıyor
# Manuel deploy için Railway dashboard kullanılmalı
# Veya: git commit --allow-empty -m "chore: Force Railway redeploy" && git push
```

---

## ⚙️ ENVIRONMENT VARIABLES

### Backend (Railway)
- Database: Neon connection string (proje içinde mevcut)
- JWT_SECRET
- API Keys (Gemini, France Travail, Stripe, SendGrid, etc.)

### Frontend (Vercel)
- NEXT_PUBLIC_API_URL: Backend Railway URL
- NEXT_PUBLIC_APP_URL: https://app.bilancompetence.ai

---

## 🧪 TEST STRATEJİSİ

### Test Ortamları

1. **Local Development**
   - Backend: `localhost:5000` veya `localhost:3001`
   - Frontend: `localhost:3000`
   - Database: Neon (development connection)

2. **Production Testing**
   - ✅ Backend: https://web-production-60dbd.up.railway.app
   - ✅ Frontend: https://app.bilancompetence.ai
   - ⚠️ Production database kullanılıyor - dikkatli test yapılmalı

### Test Endpoints

**Backend Health:**
```bash
curl https://web-production-60dbd.up.railway.app/health
```

**Backend Version:**
```bash
curl https://web-production-60dbd.up.railway.app/api/version
```

**Frontend:**
```bash
curl https://app.bilancompetence.ai
```

---

## 🔐 AUTHENTICATION & TOKENS

### Vercel
- **Token:** v5PAlpB1aGUijv8YHmmMSSTZ
- **Dosya:** `.vercel-token.txt`
- **Project ID:** prj_oiAgQ2cG1RmfOBrGpKNw0wcHR8XO

### Railway
- **Token:** 6e8a9275-7fcf-4305-bf75-7213c0c028a7
- **Dosya:** `.railway-token.txt`
- **URL:** https://web-production-60dbd.up.railway.app

### Neon
- **API Token:** napi_dgroac4a9beezwn10uja4dexo5e40i345ge214f2c3dl8rvjsfrq98whbco1hkbl
- **Dosya:** `.neon-token.txt` ve `.neon-config.txt`
- **Organization ID:** org-shy-voice-89002201
- **Project ID:** delicate-recipe-65517628
- **Stack Auth Project ID:** 3915fe6f-2981-447f-af29-cc0f334e3b19

---

## 🛠️ GELİŞTİRME ARAÇLARI

### YAGO AI Orchestrator
- **Lokasyon:** Desktop'ta mevcut
- **Kullanım:** Proje geliştirme için kullanılabilir
- **Not:** İhtiyaç duyulduğunda YAGO AI orchestrator kullanılabilir

---

## 📞 KAYNAKLAR

- **Frontend:** https://app.bilancompetence.ai
- **Backend API:** https://web-production-60dbd.up.railway.app
- **GitHub:** https://github.com/lekesiz/bilancompetence.ai
- **Vercel Dashboard:** Vercel UI
- **Railway Dashboard:** Railway UI
- **Neon Dashboard:** Neon Console

---

## ⚠️ ÖNEMLİ UYARILAR

1. **VERCEL PROJE YAPISI:**
   - ⚠️ **MEVCUT PROJE KULLANILIYOR - YENİ PROJE OLUŞTURMA!**
   - Project ID: `prj_oiAgQ2cG1RmfOBrGpKNw0wcHR8XO` (MEVCUT PROJE)
   - Root Directory: `apps/frontend` (Vercel dashboard'da ayarlanmış olmalı)
   - `.vercel/project.json` dosyası **DEĞİŞTİRİLMEMELİ**
   - Vercel CLI ile proje oluşturma YAPILMAMALI - mevcut projeden devam ediliyor

2. **Production Testing:** 
   - Testler production ortamında yapılıyor
   - Değişiklikler canlıyı etkiliyor
   - Dikkatli test yapılmalı

3. **Auto Deploy:**
   - Her git push deployment tetikliyor
   - Feature branch kullanımı önerilir (isteğe bağlı)

4. **Database:**
   - Neon erişim bilgileri proje içinde mevcut
   - Production database kullanılıyor
   - Backup strategy mevcut (automated daily)

5. **Tokens:**
   - Vercel ve Railway token'ları proje içinde saklanıyor
   - `.gitignore`'a eklendi
   - Güvenlik: Production'da kullanım için dikkatli olunmalı

---

**Not:** Bu bilgiler tüm çalışma süreçlerinde referans alınacak.

**Son Güncelleme:** 30 Ekim 2025
