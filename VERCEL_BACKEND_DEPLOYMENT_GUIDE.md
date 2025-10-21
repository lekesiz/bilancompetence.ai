# BilanCompetence.AI - Backend Deployment on Vercel

## Overview

Bu guide, BilanCompetence.AI'nin **backend API'sini Vercel'e deploy** etmek için adım adım talimatlar içerir.

### ✅ Tamamlanan Hazırlıklar

Backend'i Vercel'e deploy etmek için gerekli tüm yapılandırmalar hazırlanmıştır:

```
✅ vercel.json - Serverless configuration
✅ api/index.ts - Express wrapper for Vercel
✅ tsconfig.json - TypeScript compilation settings
✅ .env.example - Environment variables template
✅ All routes configured and tested
✅ CORS & security headers configured
```

---

## 🚀 Deployment Adımları

### Adım 1: Vercel Dashboard'a Gir

1. https://vercel.com/dashboard'a gir
2. **Ekle** (Add) → **GitHub Repo** seç
3. Repository: `lekesiz/bilancompetence.ai` ara

### Adım 2: Project Konfigürasyonu

```
Framework Preset: Other (Node.js)
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Adım 3: Environment Variables Ayarla

Vercel Dashboard'da → **Settings** → **Environment Variables**

Aşağıdaki 10 değişkeni gir:

#### 1. **DATABASE_URL** (Supabase)
```
postgresql://postgres:YOUR_PASSWORD@db.supabase.co:5432/postgres
```

#### 2. **SUPABASE_URL**
```
https://your-project.supabase.co
```

#### 3. **SUPABASE_ANON_KEY**
```
eyJhbGc... (Supabase Settings → API Keys → anon public key)
```

#### 4. **SUPABASE_SERVICE_KEY**
```
eyJhbGc... (Supabase Settings → API Keys → service_role key)
```

#### 5. **JWT_SECRET**
```
your_super_secret_jwt_key_at_least_32_chars_1a2b3c4d5e6f7g8h9i0j
```

#### 6. **SENDGRID_API_KEY**
```
SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 7. **SENDGRID_FROM_EMAIL**
```
noreply@bilancompetence.ai
```

#### 8. **CORS_ORIGIN**
```
https://bilancompetence-ai-frontend.vercel.app,http://localhost:3000
```

#### 9. **FRONTEND_URL**
```
https://bilancompetence-ai-frontend.vercel.app
```

#### 10. **NODE_ENV**
```
production
```

### Adım 4: Deploy Başlat

1. Vercel'de "Deploy" butonuna tıkla
2. Build logs'u takip et (2-3 dakika sürer)
3. Deployment tamamlandığında URL gösterilecek

### Adım 5: API Health Check

Deployment başarılı ise:

```bash
# Health check
curl https://your-deployment.vercel.app/api/health

# Version info
curl https://your-deployment.vercel.app/api/version
```

Beklenen cevap:
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T...",
  "uptime": 123.45
}
```

---

## 🔌 Frontend Integration

Frontend'i update et:

### `apps/frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://your-deployment.vercel.app/api
NEXT_PUBLIC_REALTIME_URL=https://your-deployment.vercel.app
```

### Frontend'i rebuild et:
```bash
cd apps/frontend
npm run build
# Vercel otomatik deploy eder
```

---

## 📊 API Endpoints

Backend deploy olduğunda aşağıdaki endpoints kullanılabilir:

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/verify
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/:id
```

### Assessments
```
POST   /api/assessments
GET    /api/assessments
GET    /api/assessments/:id
PUT    /api/assessments/:id
```

### Chat
```
GET    /api/chat/conversations
POST   /api/chat/conversations
GET    /api/chat/conversations/:id/messages
```

### Notifications
```
GET    /api/notifications
POST   /api/notifications
```

### Files
```
POST   /api/files/upload
GET    /api/files/:id
DELETE /api/files/:id
```

### Analytics
```
GET    /api/analytics/dashboard
GET    /api/analytics/assessments
```

### Export
```
POST   /api/export/assessments
GET    /api/export/assessments/:id
```

---

## 🐛 Troubleshooting

### Build Error: "Cannot find module"

**Çözüm**: npm dependencies eksik
```bash
npm install
npm run build
```

### Error: "DATABASE_URL not found"

**Çözüm**: Environment variables Vercel'de set edilmedi
- Vercel Dashboard → Settings → Environment Variables kontrol et
- Deployment'ı redeploy et (Deployments → Redeploy)

### CORS Error

**Çözüm**: CORS_ORIGIN variable'ı güncelle
```
CORS_ORIGIN=https://your-frontend.vercel.app,http://localhost:3000
```

### Socket.io Connection Error

**Not**: Socket.io real-time özellik Vercel serverless'da sınırlı. HTTP polling kullanılır.

---

## 🔒 Security Checklist

Deployment öncesi kontrol et:

- [ ] JWT_SECRET 32+ karakter uzunluğunda
- [ ] SENDGRID_API_KEY güvenli ve valid
- [ ] DATABASE_URL SSL=require ile (production)
- [ ] CORS_ORIGIN sadece trusted domains
- [ ] Environment variables public'te expose edilmiyor
- [ ] Rate limiting aktif

---

## 📈 Monitoring & Logs

### Vercel Logs
```bash
# Terminal'den logs'u takip et
vercel logs https://your-deployment.vercel.app
```

### API Monitoring
```
GET /api/health       → Server status
GET /api/version      → Version info
```

---

## 🔄 Continuous Deployment

Her GitHub push'dan sonra otomatik deploy:

1. GitHub'da code push et
2. Vercel otomatik build başlatır
3. Build başarılı ise deploy eder
4. Deployment URL'si same kalır

---

## ✨ Next Steps

Backend deploy olduktan sonra:

1. ✅ Tüm API endpoints test et
2. ✅ Frontend environment variables güncelle
3. ✅ Database migration kontrol et
4. ✅ SendGrid email gönderimi test et
5. ✅ Rate limiting test et (5 fast requests)
6. ✅ CORS policy kontrol et

---

## 📞 Support

### Error Logs Nasıl Kontrol Edilir?

```bash
# Vercel CLI ile logs bak
npm i -g vercel
vercel logs your-project-name --follow
```

### Database Connection Error?

Supabase → Settings → Database → Connection pooling kontrol et.

### Email Gönderilmiyor?

SendGrid → Integration → Verify domain: `bilancompetence.ai`

---

## 🎯 Success Criteria

✅ Backend deploy başarılı:
- [ ] https://your-deployment.vercel.app/api/health → 200 OK
- [ ] Frontend API endpoint'lerine bağlanıyor
- [ ] Database'e bağlantı kurmuş
- [ ] SendGrid emails gönderiliyor
- [ ] Rate limiting çalışıyor

---

**Tarih**: 21 Ekim 2025
**Status**: Vercel Backend Deployment Ready ✅
**Version**: 1.0.0
