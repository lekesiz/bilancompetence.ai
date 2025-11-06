# 🚀 Backend Deployment Talimatları

## Son Değişiklik: Socket.IO HttpOnly Cookie Authentication

**Commit:** `9faa4c0` - Update Socket.IO backend to read JWT from HttpOnly cookies

**Branch:** `claude/ne-durumda-011CUrWKdxGDdPBNQQDHuWZF`

---

## 📋 Deployment Öncesi Kontrol Listesi

### ✅ 1. Environment Variables Kontrolü

Backend'de şu environment variable'ların ayarlı olduğundan emin olun:

```bash
# Zorunlu
JWT_SECRET=<güvenli-random-string>
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-frontend-url.vercel.app

# Email (Resend)
RESEND_API_KEY=<yeni-api-key>  # ⚠️ ESKİ KEY'İ DEĞİŞTİRİN!
EMAIL_FROM=noreply@yourdomain.com

# Opsiyonel
GEMINI_API_KEY=<your-gemini-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
STRIPE_SECRET_KEY=<your-stripe-key>
```

### ✅ 2. Değişiklikleri Kontrol Edin

```bash
# Son 5 commit'i görüntüleyin
git log --oneline -5

# Değişen dosyaları kontrol edin
git diff main..claude/ne-durumda-011CUrWKdxGDdPBNQQDHuWZF --name-only | grep backend
```

---

## 🔄 Deployment Yöntemleri

### Yöntem 1: Vercel'den Direct Deploy (ÖNERİLEN)

#### Adım 1: Branch'i Merge Edin (Opsiyonel)

```bash
# Main branch'e geçin
git checkout main

# Feature branch'i merge edin
git merge claude/ne-durumda-011CUrWKdxGDdPBNQQDHuWZF

# Push yapın
git push origin main
```

#### Adım 2: Vercel Dashboard'dan Deploy

1. **Vercel Dashboard'a gidin:** https://vercel.com/dashboard
2. **Backend projenizi seçin**
3. **"Deployments" tab'ına gidin**
4. **"Deploy" butonuna tıklayın**
5. **Branch seçin:**
   - Merge ettiyseniz: `main`
   - Direct deploy: `claude/ne-durumda-011CUrWKdxGDdPBNQQDHuWZF`
6. **"Deploy" butonuna tıklayın**

#### Adım 3: Environment Variables Güncelleyin

1. **Settings → Environment Variables**
2. **Şu değişkenleri kontrol/güncelleyin:**
   - `RESEND_API_KEY` → **YENİ KEY GİRİN!** ⚠️
   - `FRONTEND_URL` → Production URL'iniz
   - `JWT_SECRET` → Değişmemiş olmalı

---

### Yöntem 2: Docker ile Deploy

#### Adım 1: Docker Image Build

```bash
# Backend dizinine gidin
cd apps/backend

# Docker image build edin
docker build -t bilancompetence-backend:latest .

# Test için local'de çalıştırın
docker run -p 3001:3001 \
  -e JWT_SECRET=your-secret \
  -e DATABASE_URL=your-db-url \
  -e FRONTEND_URL=http://localhost:3000 \
  bilancompetence-backend:latest
```

#### Adım 2: Docker Registry'e Push

```bash
# Docker Hub'a login
docker login

# Image'ı tag'leyin
docker tag bilancompetence-backend:latest your-username/bilancompetence-backend:latest

# Push yapın
docker push your-username/bilancompetence-backend:latest
```

#### Adım 3: Production'da Pull & Run

```bash
# Production sunucunuzda:
docker pull your-username/bilancompetence-backend:latest

docker run -d \
  --name bilancompetence-backend \
  -p 3001:3001 \
  -e JWT_SECRET=$JWT_SECRET \
  -e DATABASE_URL=$DATABASE_URL \
  -e FRONTEND_URL=$FRONTEND_URL \
  -e RESEND_API_KEY=$RESEND_API_KEY \
  your-username/bilancompetence-backend:latest
```

---

### Yöntem 3: Git Push ile Auto-Deploy

Eğer CI/CD pipeline'ınız varsa:

```bash
# Feature branch'ten push yapın
git push origin claude/ne-durumda-011CUrWKdxGDdPBNQQDHuWZF

# Veya main'e merge edip push yapın
git checkout main
git merge claude/ne-durumda-011CUrWKdxGDdPBNQQDHuWZF
git push origin main
```

---

## 🧪 Deployment Sonrası Kontroller

### 1. Health Check

```bash
# Backend'in çalıştığını kontrol edin
curl https://your-backend-url.com/health

# Beklenen response:
# {"status":"ok","timestamp":"2024-11-06T..."}
```

### 2. Socket.IO Connection Test

```bash
# WebSocket endpoint'ini test edin
curl https://your-backend-url.com/socket.io/

# Beklenen response:
# {"code":0,"message":"Transport unknown"}
# Bu normal - Socket.IO ayakta demektir
```

### 3. Auth Test

```bash
# Login endpoint'ini test edin
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Cookie'lerin set edildiğini kontrol edin (response headers'da)
```

---

## ⚠️ Önemli Notlar

### 🚨 KRİTİK: Resend API Key'i Rotate Edin!

**Eski key expose olmuş:**
```
re_j299ogpf_EEAKZAoLJArch69r5tXmjVPs
```

**Hemen yapın:**
1. https://resend.com/api-keys → Yeni key oluştur
2. Vercel Environment Variables → Güncelle
3. Eski key'i SİLİN!

### 🔒 Socket.IO Değişikliği

Backend artık Socket.IO için JWT'yi **HttpOnly cookie'lerden** okuyor:

**Önceki sistem:**
```typescript
// ❌ ESKİ - Token auth object'ten geliyordu
const token = socket.handshake.auth.token;
```

**Yeni sistem:**
```typescript
// ✅ YENİ - Token cookie'den okunuyor
const cookies = socket.handshake.headers.cookie;
const token = parseCookie(cookies, 'accessToken');
```

### 📊 Monitoring

Deployment sonrası bu metrikleri izleyin:

- **Response Times:** < 200ms olmalı
- **Error Rate:** < 1% olmalı
- **Socket.IO Connections:** Aktif kullanıcı sayısı kadar
- **Database Connections:** Stable olmalı

---

## 🔄 Rollback Planı

Eğer deployment'ta sorun çıkarsa:

### Hızlı Rollback:

```bash
# Vercel Dashboard:
1. Deployments → Previous Production
2. "Promote to Production" butonuna tıkla

# Veya Git'ten:
git revert 9faa4c0
git push origin main
```

### Manuel Rollback:

```bash
# Önceki commit'e dön
git checkout e40b42e  # (Son stabil commit)
git push origin main --force  # ⚠️ Dikkatli kullanın!
```

---

## 📞 Sorun Giderme

### Socket.IO Bağlantı Hatası

**Sorun:** `Authentication error: No cookies found`

**Çözüm:**
1. Frontend `withCredentials: true` ayarlı mı kontrol edin
2. Backend CORS ayarlarında `credentials: true` var mı kontrol edin
3. Cookie domain'leri uyumlu mu kontrol edin

### CORS Hatası

**Sorun:** `Access-Control-Allow-Origin` hatası

**Çözüm:**
```typescript
// Backend src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,  // Bu çok önemli!
}));
```

### JWT Verification Hatası

**Sorun:** Token verify edilemiyor

**Çözüm:**
1. `JWT_SECRET` environment variable'ı doğru mu?
2. Cookie expiry süresi geçmiş olabilir - yeniden login
3. Cookie name'i `accessToken` mı?

---

## 📚 İlgili Dokümantasyon

- [TEST_SCENARIOS.md](./TEST_SCENARIOS.md) - Detaylı test senaryoları
- [SECURITY_FIXES.md](./SECURITY_FIXES.md) - Yapılan güvenlik düzeltmeleri
- [SECURITY_ACTION_REQUIRED.md](./SECURITY_ACTION_REQUIRED.md) - API key rotation

---

**Son Güncelleme:** 2024-11-06
**Deploy Edilmesi Gereken Commit:** `9faa4c0`
**Branch:** `claude/ne-durumda-011CUrWKdxGDdPBNQQDHuWZF`
