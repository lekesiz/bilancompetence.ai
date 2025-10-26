# Vercel Environment Variables - BilanCompetence.AI Backend

**Tarih:** 26 Ekim 2025  
**Amaç:** Backend deployment için gerekli environment variables

---

## 🔐 Gerekli Environment Variables

### 1. Database (Neon PostgreSQL)

```
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

**Nereden alınır:** Neon Dashboard → Connection String

**Örnek:**
```
DATABASE_URL=postgresql://neondb_owner:xxxxx@ep-xxx.eu-central-1.aws.neon.tech/bilancompetence?sslmode=require
```

---

### 2. JWT Authentication

```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
```

**Nasıl oluşturulur:**
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Örnek:**
```
JWT_SECRET=8f7d6e5c4b3a2918f7d6e5c4b3a2918f
JWT_REFRESH_SECRET=9g8h7i6j5k4l3m2n9g8h7i6j5k4l3m2n
```

---

### 3. Supabase Storage (CV ve Dosyalar)

```
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nereden alınır:** Supabase Dashboard → Project Settings → API

**Not:** Sadece dosya depolama için kullanılıyor (veritabanı değil)

---

### 4. SendGrid Email Service (Opsiyonel - Sonra Eklenecek)

```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@bilancompetence.ai
SENDGRID_FROM_NAME=BilanCompetence.AI
```

**Nereden alınır:** SendGrid Dashboard → API Keys

**Not:** Email verification ve password reset için gerekli

---

### 5. Application Settings

```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://bilancompetence.ai,https://www.bilancompetence.ai
```

**Not:** 
- `PORT` Vercel tarafından otomatik atanır, opsiyonel
- `CORS_ORIGIN` frontend domain'leri (virgülle ayrılmış)

---

## 📋 Vercel'e Ekleme Adımları

### Yöntem 1: Vercel Dashboard (Önerilen)

1. **Vercel Dashboard'a git:** https://vercel.com/dashboard
2. **Projeyi seç:** bilancompetence-ai (veya backend projesi)
3. **Settings → Environment Variables**
4. **Her değişkeni tek tek ekle:**
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Environment: `Production`, `Preview`, `Development` (hepsini seç)
   - **Add** butonuna tıkla
5. **Tüm değişkenler için tekrarla**

### Yöntem 2: Vercel CLI

```bash
# Vercel CLI yükle (eğer yoksa)
npm install -g vercel

# Login
vercel login

# Backend dizinine git
cd apps/backend

# Environment variable ekle
vercel env add DATABASE_URL production
# Prompt geldiğinde değeri yapıştır

# Diğer değişkenler için tekrarla
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NODE_ENV production
vercel env add CORS_ORIGIN production
```

---

## 🚀 Deployment Sonrası Test

### 1. Health Check

```bash
curl https://bilancompetence-api.vercel.app/health
```

**Beklenen Yanıt:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T10:00:00.000Z",
  "database": "connected"
}
```

### 2. API Test

```bash
# Login endpoint test
curl -X POST https://bilancompetence-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. CORS Test

```bash
curl -H "Origin: https://bilancompetence.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://bilancompetence-api.vercel.app/api/auth/login
```

---

## ⚠️ Güvenlik Notları

1. **JWT Secrets:** 
   - Minimum 32 karakter
   - Rastgele oluşturulmuş
   - Asla GitHub'a commit etmeyin

2. **Database URL:**
   - SSL mode aktif (`sslmode=require`)
   - Connection pooling ayarları kontrol edin

3. **Supabase Keys:**
   - `ANON_KEY`: Frontend'de de kullanılabilir (public)
   - `SERVICE_ROLE_KEY`: Sadece backend'de (private, güçlü yetkiler)

4. **CORS:**
   - Sadece kendi domain'lerinizi ekleyin
   - Wildcard (`*`) kullanmayın production'da

---

## 🔄 Environment Variables Güncelleme

Değişkenleri güncelledikten sonra:

```bash
# Vercel'de yeniden deploy
vercel --prod

# Veya GitHub'a push (otomatik deploy)
git push origin main
```

---

## 📝 Checklist

Backend deployment öncesi kontrol listesi:

- [ ] DATABASE_URL eklendi ve test edildi
- [ ] JWT_SECRET ve JWT_REFRESH_SECRET oluşturuldu
- [ ] SUPABASE_URL ve keys eklendi
- [ ] NODE_ENV=production ayarlandı
- [ ] CORS_ORIGIN frontend domain'leri içeriyor
- [ ] Vercel'de build başarılı
- [ ] Health check endpoint çalışıyor
- [ ] API endpoints test edildi
- [ ] CORS policy çalışıyor

---

**Hazırlayan:** Manus AI  
**Tarih:** 26 Ekim 2025  
**Durum:** Deployment için hazır

