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

### Backend - Railway
- **URL:** https://web-production-60dbd.up.railway.app
- **Deployment:** Otomatik (git push sonrası)
- **Branch:** `main` → production
- **Framework:** Express.js + TypeScript
- **Health Check:** `/health`

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
   - ✅ Railway → Otomatik deploy başar
   - ⏱️ Genellikle 2-5 dakika içinde live olur

3. **Test Süreci**
   - ✅ Production URL'de test: https://app.bilancompetence.ai
   - ✅ Browser testleri online yapılıyor
   - ✅ Son kullanıcı testleri production ortamında gerçekleştiriliyor

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
   - Database: Local veya Neon dev instance

2. **Production Testing**
   - ✅ **Ana test ortamı: Production**
   - URL: https://app.bilancompetence.ai
   - Test tipi: Son kullanıcı browser testleri
   - Test yapan: Project owner
   - Not: Production ortamında test yapılması tercih ediliyor

### Test Yaklaşımı

**⚠️ ÖNEMLİ:** 
- Final testler production ortamında yapılıyor
- Git push sonrası otomatik deploy → Live test
- Browser testleri https://app.bilancompetence.ai üzerinde gerçekleştiriliyor

---

## 📊 MONITORING

### Health Checks
- Backend: https://web-production-60dbd.up.railway.app/health
- Frontend: https://app.bilancompetence.ai (live check)

### Logs
- Railway: Backend logs
- Vercel: Frontend logs
- Neon: Query logs

---

## 🔐 GÜVENLİK NOTLARI

1. **Environment Variables:**
   - Neon erişim bilgileri proje içinde secure şekilde saklanıyor
   - Railway ve Vercel environment variables UI'dan yönetiliyor

2. **Deployment Güvenliği:**
   - Otomatik deploy aktif (git push → deploy)
   - Main branch protection önerilir (henüz uygulanmadıysa)

---

## 📝 ÖNEMLİ NOTLAR

### Deployment Best Practices

1. **Git Push Öncesi:**
   - ✅ Local test yap
   - ✅ Build kontrolü (`npm run build`)
   - ✅ Type check (`npm run type-check`)

2. **Git Push Sonrası:**
   - ⏱️ 2-5 dakika bekle (deploy tamamlansın)
   - ✅ Production URL'de test et
   - ✅ Health checks kontrol et

3. **Test Süreci:**
   - ✅ Production ortamında browser testleri yap
   - ✅ Tüm kritik flow'ları test et
   - ✅ Mobile responsive test

---

## 🔄 ROLLBACK STRATEJİSİ

### Vercel Rollback
- Vercel dashboard → Deployments → Previous deployment'a rollback

### Railway Rollback
- Railway dashboard → Deployments → Previous build'e rollback
- Veya `git revert` + push

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

---

**Not:** Bu bilgiler tüm çalışma süreçlerinde referans alınacak.

**Son Güncelleme:** 30 Ekim 2025

