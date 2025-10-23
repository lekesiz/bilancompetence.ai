# Render.com Backend Deployment Rehberi

## 🚀 Adım Adım Deployment

### 1. Render.com'a Giriş Yapın
https://dashboard.render.com/

### 2. Yeni Web Service Oluşturun
1. Dashboard'da **"New +"** butonuna tıklayın
2. **"Web Service"** seçin
3. GitHub repository'yi bağlayın: `lekesiz/bilancompetence.ai`

### 3. Service Ayarları

**Temel Bilgiler:**
- **Name:** `bilancompetence-api`
- **Region:** Frankfurt (EU Central)
- **Branch:** `main`
- **Root Directory:** `apps/backend`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Plan:**
- **Free** (başlangıç için yeterli)

### 4. Environment Variables

Aşağıdaki environment variables'ları ekleyin:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://bilancompetence-lekesizs-projects.vercel.app,https://bilancompetence-git-main-lekesizs-projects.vercel.app
GEMINI_API_KEY=your-gemini-key (opsiyonel)
FRANCE_TRAVAIL_API_KEY=your-france-travail-key (opsiyonel)
SENDGRID_API_KEY=your-sendgrid-key (opsiyonel)
```

**Önemli Notlar:**
- `PORT=10000` - Render.com varsayılan portu
- `CORS_ORIGIN` - Vercel domain'lerini ekleyin
- Supabase bilgilerini Supabase dashboard'dan alın
- `JWT_SECRET` - Güçlü bir secret key oluşturun

### 5. Deploy Edin

1. **"Create Web Service"** butonuna tıklayın
2. Deployment başlayacak (5-10 dakika sürer)
3. Deployment tamamlandığında, service URL'i alın:
   - Örnek: `https://bilancompetence-api.onrender.com`

### 6. Deployment'ı Test Edin

```bash
# Health check
curl https://bilancompetence-api.onrender.com/health

# API test
curl https://bilancompetence-api.onrender.com/api/auth/health
```

### 7. Backend URL'ini Kaydedin

Deployment başarılı olduktan sonra, backend URL'ini kaydedin:

**Backend API URL:** `https://bilancompetence-api.onrender.com`

Bu URL'i Vercel environment variables'ına ekleyeceğiz.

---

## 🔧 Alternatif: render.yaml Kullanımı

Eğer `render.yaml` dosyası kullanmak isterseniz:

1. Render Dashboard'da **"New +"** → **"Blueprint"** seçin
2. GitHub repository'yi seçin
3. `render.yaml` dosyası otomatik olarak algılanacak
4. Environment variables'ları manuel olarak ekleyin
5. **"Apply"** butonuna tıklayın

---

## ⚠️ Önemli Notlar

1. **Free Plan Limitations:**
   - 750 saat/ay ücretsiz
   - 15 dakika inaktivite sonrası sleep mode
   - İlk istek 30-60 saniye sürebilir (cold start)

2. **Supabase Bilgileri:**
   - Supabase Dashboard → Settings → API
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (gizli!)

3. **JWT Secret:**
   ```bash
   # Güçlü bir secret oluşturun
   openssl rand -base64 32
   ```

4. **CORS:**
   - Vercel domain'lerini ekleyin
   - Wildcard kullanabilirsiniz: `https://*.vercel.app`

---

## 📝 Deployment Sonrası

Backend başarıyla deploy edildikten sonra:

1. ✅ Backend URL'ini kaydedin
2. ✅ Health check yapın
3. ✅ Vercel environment variables'ını güncelleyin
4. ✅ Vercel'i yeniden deploy edin

---

## 🆘 Sorun Giderme

### Build Hatası
- `apps/backend` dizininin doğru olduğundan emin olun
- `package.json` dosyasının mevcut olduğunu kontrol edin
- Build log'larını inceleyin

### Runtime Hatası
- Environment variables'ların doğru olduğundan emin olun
- Supabase bağlantısını test edin
- Log'ları kontrol edin: Dashboard → Logs

### CORS Hatası
- `CORS_ORIGIN` environment variable'ını kontrol edin
- Vercel domain'lerini ekleyin
- Wildcard kullanın: `https://*.vercel.app`

---

**Deployment tamamlandıktan sonra backend URL'ini bana bildirin!**

