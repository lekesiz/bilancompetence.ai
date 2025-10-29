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
- **Erişim:** Proje içerisinde environment variables'da mevcut
- **Type:** Serverless PostgreSQL
- **Connection:** Connection pooling aktif
- **Backups:** Automated daily backups

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

1. **Production Testing:** 
   - Testler production ortamında yapılıyor
   - Değişiklikler canlıyı etkiliyor
   - Dikkatli test yapılmalı

2. **Auto Deploy:**
   - Her git push deployment tetikliyor
   - Feature branch kullanımı önerilir (isteğe bağlı)

3. **Database:**
   - Neon erişim bilgileri proje içinde mevcut
   - Production database kullanılıyor
   - Backup strategy mevcut (automated daily)

4. **Tokens:**
   - Vercel ve Railway token'ları proje içinde saklanıyor
   - `.gitignore`'a eklendi
   - Güvenlik: Production'da kullanım için dikkatli olunmalı

---

**Not:** Bu bilgiler tüm çalışma süreçlerinde referans alınacak.

**Son Güncelleme:** 30 Ekim 2025
