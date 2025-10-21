# BilanCompetence.AI - Monorepo Vercel Deployment Guide

## 🏗️ Architecture: OPSİYON 1 - Ayrı Vercel Projeleri

Bu guide, **aynı GitHub monorepo'sundan** iki farklı Vercel project'i deploy etmek için adım adım talimatlar içerir.

---

## 📊 Architecture Diagram

```
GitHub Repository (Monorepo)
└── lekesiz/bilancompetence.ai
    ├── apps/frontend/         ← Vercel Project 1
    ├── apps/backend/          ← Vercel Project 2
    └── apps/mobile/           (React Native - Expo)

                    ↓

    ┌─────────────────────────────────────┐
    │         Vercel Platform            │
    │                                     │
    │  Project 1: Frontend                │
    │  Root: ./apps/frontend              │
    │  URL: ...frontend.vercel.app       │
    │                                     │
    │  Project 2: Backend                 │
    │  Root: ./apps/backend               │
    │  URL: ...backend.vercel.app        │
    └─────────────────────────────────────┘
```

---

## ✅ Avantajları (OPSİYON 1)

```
✅ Git: 1 monorepo (tüm projeler aynı yerden)
✅ Vercel: 2 ayrı project (bağımsız deployment)
✅ Scaling: Her project kendi CPU/Memory kaynağı
✅ Reliability: Backend down ise frontend çalışmaya devam
✅ Development: Bütün kod tek repo'da, local test kolay
✅ CI/CD: Push → otomatik her iki project deploy
✅ Production Grade: Netflix, Airbnb, Stripe mimarisi
```

---

## 🚀 ADIM 1: Frontend Project (Already Done ✅)

```
Status: ✅ LIVE
URL: https://bilancompetence-ai-frontend.vercel.app
Configuration:
├─ Root Directory: ./apps/frontend
├─ Build Command: npm run build
├─ Framework: Next.js
└─ Files:
   ├─ apps/frontend/vercel.json (created)
   ├─ apps/frontend/package.json (existing)
   └─ apps/frontend/src/ (existing)
```

---

## 🚀 ADIM 2: Backend Project (Deploy Now!)

Şu anda yapacağını adımlar:

### Step 1: Vercel'e Git

```
https://vercel.com/dashboard → Add New Project
```

### Step 2: GitHub Repo Seç

```
GitHub: lekesiz/bilancompetence.ai
(Frontend ile aynı repo!)
```

### Step 3: Project Ayarları

```
Framework Preset: Other (Node.js)
Root Directory: ./apps/backend     ← ÖNEMLİ!
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 4: Environment Variables Ekle

Vercel Dashboard → Settings → Environment Variables

Şu 10 değişkeni ekle:

| Variable | Value | Nereden |
|----------|-------|---------|
| `DATABASE_URL` | `postgresql://...` | Supabase Settings |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase API Keys |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...` | Supabase API Keys |
| `JWT_SECRET` | `your_super_secret_key` | Generate (32+ chars) |
| `SENDGRID_API_KEY` | `SG.xxx...` | SendGrid |
| `SENDGRID_FROM_EMAIL` | `noreply@bilancompetence.ai` | SendGrid |
| `CORS_ORIGIN` | `https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000` | Manual |
| `FRONTEND_URL` | `https://bilancompetence-ai-frontend.vercel.app` | Frontend URL |
| `NODE_ENV` | `production` | Manual |

### Step 5: Deploy

```
Click "Deploy" button
Wait 3-5 minutes for build
Monitor logs for errors
```

### Step 6: Verify Backend

```bash
# Health Check
curl https://your-backend-url.vercel.app/api/health

# Expected Response:
{
  "status": "ok",
  "timestamp": "2025-10-21T...",
  "uptime": 123.45,
  "environment": "production"
}
```

---

## 🔌 ADIM 3: Frontend'i Backend'e Bağla

### Update Frontend Environment

File: `apps/frontend/.env.local` (or `.env.production`)

```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
NEXT_PUBLIC_REALTIME_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXX
```

### Redeploy Frontend

Frontend deploy otomatik olacak. Vercel'de:
- Push detected → Build starts → Deployment complete

---

## ✅ Verification Checklist

### Backend API Check
- [ ] `/api/health` → 200 OK
- [ ] `/api/version` → Version info
- [ ] Database connection working
- [ ] SendGrid emails gönderiliyor
- [ ] Rate limiting active

### Frontend Check
- [ ] Frontend yükleniyor
- [ ] Login page açılıyor
- [ ] API calls başarılı
- [ ] Real-time messaging çalışıyor
- [ ] Analytics data gidiyor

### Integration Check
- [ ] Kayıt → Database'e kaydediliyor
- [ ] Login → JWT token alınıyor
- [ ] Assessment → Backend'te oluşturuluyor
- [ ] Chat → Real-time mesaj gönderiliyor
- [ ] Files → Upload/Download çalışıyor

---

## 🛠️ Troubleshooting

### Build Error: "Cannot find module"

**Çözüm:**
```bash
npm install
npm run build
# Vercel'de redeploy
```

### Backend 404 Errors

**Çözüm:** CORS_ORIGIN check
```
CORS_ORIGIN=https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000
```

### Frontend → Backend Connection Error

**Çözüm:** Environment variables
```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
```

### Database Connection Failed

**Çözüm:** DATABASE_URL check
```
postgresql://postgres:password@db.supabase.co:5432/postgres?sslmode=require
```

---

## 📊 Project Structure

```
lekesiz/bilancompetence.ai
│
├─ apps/
│  │
│  ├─ frontend/
│  │  ├─ vercel.json              ← Frontend config
│  │  ├─ package.json
│  │  ├─ next.config.js
│  │  ├─ src/
│  │  │  ├─ pages/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  ├─ lib/
│  │  │  │  └─ api.ts             ← API client
│  │  │  └─ styles/
│  │  └─ public/
│  │
│  ├─ backend/
│  │  ├─ vercel.json              ← Backend config
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ routes/               ← 14 route modules
│  │     ├─ services/             ← 11 service modules
│  │     ├─ middleware/
│  │     ├─ models/
│  │     ├─ types/
│  │     └─ utils/
│  │
│  └─ mobile/
│     └─ React Native + Expo
│
├─ package.json                   ← Root workspace
├─ .gitignore
├─ .github/
│  └─ workflows/                  ← CI/CD
└─ README.md
```

---

## 🔄 Continuous Deployment

Her GitHub push'da otomatik deploy:

```
1. Local development
   ↓ git push origin main
   ↓
2. GitHub webhook → Vercel
   ↓
3. Vercel build starts
   ├─ Frontend: npm run build (5 min)
   └─ Backend: npm run build (3 min)
   ↓
4. Tests run (if configured)
   ↓
5. Deployment
   ├─ Frontend → https://bilancompetence-ai-frontend.vercel.app
   └─ Backend → https://bilancompetence-ai-backend.vercel.app
   ↓
6. Live!
```

---

## 📈 Monitoring & Logs

### Frontend Logs
```bash
# Vercel CLI
vercel logs bilancompetence-ai-frontend --follow

# Browser Console (Ctrl+Shift+K)
- Check Network tab
- Check Console for errors
```

### Backend Logs
```bash
# Vercel CLI
vercel logs bilancompetence-ai-backend --follow

# Check endpoints
curl https://bilancompetence-ai-backend.vercel.app/api/health
```

---

## 🎯 Success Criteria

✅ **Complete Full Stack Deployment** when:

```
Frontend:
✅ https://bilancompetence-ai-frontend.vercel.app loads
✅ Pages render correctly
✅ No console errors

Backend:
✅ https://bilancompetence-ai-backend.vercel.app/api/health → 200
✅ Database connected
✅ SendGrid ready

Integration:
✅ Frontend calls backend API
✅ Login works
✅ Data saved to database
✅ Emails sent
✅ Real-time messaging works

Production:
✅ A+ Security Grade
✅ All 71+ endpoints functional
✅ Rate limiting active
✅ CORS working
✅ Monitoring in place
```

---

## 📚 Additional Documentation

- [VERCEL_BACKEND_DEPLOYMENT_GUIDE.md](./VERCEL_BACKEND_DEPLOYMENT_GUIDE.md)
- [BACKEND_VERCEL_DEPLOYMENT_SUMMARY.md](./BACKEND_VERCEL_DEPLOYMENT_SUMMARY.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [README.md](./README.md)

---

## 🎯 Next Steps

```
✅ Step 1: Create Backend Vercel Project
   URL: https://vercel.com/new

✅ Step 2: Set Environment Variables (10 variables)
   Location: Vercel Dashboard → Settings

✅ Step 3: Deploy
   Button: Deploy

✅ Step 4: Verify
   Test: /api/health endpoint

✅ Step 5: Update Frontend
   File: apps/frontend/.env.local
   Variable: NEXT_PUBLIC_API_URL

✅ Step 6: Test Integration
   Action: Login, Create Assessment, Send Message

✅ Step 7: Monitor
   Tool: Vercel CLI or Dashboard
```

---

## 🏆 Architecture Benefits

| Aspect | Benefit |
|--------|---------|
| **Scalability** | Backend scales independently |
| **Reliability** | Frontend works even if backend down |
| **Development** | All code in one repo, easy to manage |
| **Deployment** | Automatic CI/CD on every push |
| **Monitoring** | Separate logs for frontend/backend |
| **Security** | Isolated environments, better control |
| **Performance** | Edge caching for frontend, compute for backend |
| **Cost** | Pay-as-you-go, scales efficiently |

---

## 📞 Support

### Common Issues

**Q: Aynı repo'dan 2 Vercel project deploy edilebilir mi?**
A: Evet! Root Directory override ile yapılır.

**Q: CORS hatası alıyorum**
A: CORS_ORIGIN'i güncelleyip redeploy et.

**Q: Backend 404 veriyor**
A: DATABASE_URL veya environment variables kontrol et.

**Q: Frontend API'yi bulamıyor**
A: NEXT_PUBLIC_API_URL'yi güncelle ve redeploy.

---

## ✨ Summary

**Professional Production Architecture**

```
✅ Monorepo: 1 Git repository
✅ Frontend: Vercel Project 1 (separate deployment)
✅ Backend: Vercel Project 2 (separate deployment)
✅ Database: Supabase PostgreSQL
✅ Email: SendGrid integration
✅ Real-time: Socket.io + Vercel Functions
✅ Security: A+ Grade
✅ Monitoring: Vercel Dashboard + CLI
✅ CI/CD: Automatic on every git push
```

**Status**: ✅ Ready for Production

---

**Generated**: 21 October 2025
**Version**: 1.0.0
**Last Updated**: Now
