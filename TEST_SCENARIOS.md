# 🧪 Detaylı Test Senaryoları - HttpOnly Cookie Authentication

## 📋 Test Öncesi Hazırlık

### Gerekli Araçlar:
- ✅ Modern web tarayıcı (Chrome, Firefox, Safari)
- ✅ Browser DevTools açık
- ✅ Production URL'niz hazır
- ✅ Test kullanıcı hesabı bilgileri

### DevTools Açma:
- **Chrome/Edge:** `F12` veya `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox:** `F12` veya `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Safari:** `Cmd+Option+I` (Safari → Preferences → Advanced → Show Develop menu'yu aktif edin)

---

## 🔐 Test Kategorisi 1: Authentication (Kimlik Doğrulama)

### Test 1.1: Kullanıcı Kaydı (Register)

**Amaç:** Yeni kullanıcı kaydının HttpOnly cookie'lerle çalıştığını doğrula

**Adımlar:**
1. Production sitenize gidin: `https://your-site.vercel.app`
2. "Kayıt Ol" / "Register" butonuna tıklayın
3. **DevTools'u açın → Application tab → Cookies**
4. Formu doldurun:
   ```
   Email: test+{random}@example.com
   Şifre: Test1234!@#$
   Ad Soyad: Test User
   ```
5. "Kayıt Ol" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Kayıt başarılı mesajı görünmeli
- ✅ **Cookies sekmesinde şunlar görünmeli:**
  ```
  accessToken:
    Value: [JWT token - başı "eyJ" ile başlar]
    HttpOnly: ✓ (checked)
    Secure: ✓ (checked)
    SameSite: Lax veya Strict

  refreshToken:
    Value: [JWT token]
    HttpOnly: ✓ (checked)
    Secure: ✓ (checked)
    SameSite: Lax veya Strict
  ```
- ✅ Dashboard'a yönlendirilmeli
- ❌ Console'da hata OLMAMALI

**Hata Durumu:**
- Eğer cookie'ler görünmüyorsa → Backend cookie ayarlarını kontrol edin
- Eğer HttpOnly checked değilse → GÜVENLİK SORUNU! Backend'i düzeltin

---

### Test 1.2: Kullanıcı Girişi (Login)

**Amaç:** Login'in HttpOnly cookie'lerle çalıştığını doğrula

**Adımlar:**
1. Eğer login durumundaysanız, çıkış yapın
2. **DevTools → Application → Cookies** - Mevcut cookie'leri not edin
3. Login sayfasına gidin
4. **Network tab'ını açın** (önemli!)
5. Credentials girin:
   ```
   Email: test@example.com
   Password: Test1234!@#$
   ```
6. "Giriş Yap" butonuna tıklayın
7. **Network tab'da `/api/auth/login` request'ini bulun**
8. Response Headers'ı kontrol edin

**Beklenen Sonuç:**
- ✅ Login başarılı
- ✅ **Network → Response Headers'da:**
  ```
  Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Lax
  Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax
  ```
- ✅ **Application → Cookies'de yeni token'lar görünmeli**
- ✅ Dashboard'a yönlendirme
- ❌ Console'da "localStorage" hatası OLMAMALI

**localStorage Kontrolü (ÖNEMLİ!):**
```javascript
// DevTools Console'da çalıştırın:
console.log(localStorage.getItem('accessToken'));
// SONUÇ: null olmalı (token artık localStorage'da DEĞİL!)

console.log(document.cookie);
// SONUÇ: Boş string ("") olmalı (HttpOnly cookie'ler JS'ten okunamaz!)
```

**Hata Durumu:**
- Token localStorage'da varsa → Frontend eski kodu kullanıyor, cache silin!
- `document.cookie` ile token okunabiliyorsa → GÜVENLİK SORUNU!

---

### Test 1.3: Şifre Sıfırlama (Password Reset)

**Amaç:** Email gönderimi ve token'ların çalıştığını doğrula

**Adımlar:**
1. Logout olun
2. "Şifremi Unuttum" linkine tıklayın
3. Email adresinizi girin
4. "Sıfırlama Linki Gönder" butonuna tıklayın
5. **Email kutunuzu kontrol edin** (Resend'den gelecek)
6. Email'deki linke tıklayın
7. Yeni şifre girin ve kaydedin

**Beklenen Sonuç:**
- ✅ "Email gönderildi" mesajı
- ✅ 2-5 dakika içinde email alınmalı
- ✅ Reset link çalışmalı
- ✅ Yeni şifre ile login yapılabilmeli
- ❌ Email gelmiyorsa → **Resend API key kontrol edin!**

**Email Gelmezse Kontrol Listesi:**
1. Spam klasörünü kontrol edin
2. Backend logs'da hata var mı?
3. **RESEND_API_KEY doğru mu?** (Eski key silinmiş olmalı!)
4. Email adresi doğru domain'den mi? (Resend'de verify edilmiş olmalı)

---

### Test 1.4: Token Refresh (Otomatik Yenileme)

**Amaç:** Token'ların otomatik yenilendiğini doğrula

**Adımlar:**
1. Login olun
2. **DevTools → Application → Cookies** → `accessToken` değerini kopyalayın
3. **DevTools → Console'da decode edin:**
   ```javascript
   // Token'ın payload'ını görmek için:
   const token = 'accessToken değerini buraya yapıştırın';
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token expiry:', new Date(payload.exp * 1000));
   console.log('Time until expiry:', (payload.exp * 1000 - Date.now()) / 1000 / 60, 'minutes');
   ```
4. Token expire olana kadar bekleyin (genelde 15 dakika)
5. Bir API call yapın (örn: dashboard'da bir butona tıklayın)

**Beklenen Sonuç:**
- ✅ Token expire olduğunda otomatik refresh olmalı
- ✅ **Network tab'da `/api/auth/refresh` request görülmeli**
- ✅ Yeni `accessToken` cookie'si set edilmeli
- ✅ Kullanıcı hiçbir şey farketmemeli (seamless)
- ❌ Login sayfasına yönlendirilmemeli

**Manuel Test:**
```javascript
// Console'da token'ı manuel expire edin:
document.cookie = 'accessToken=expired; path=/; max-age=0';

// Sonra bir API call yapın, otomatik refresh olmalı
fetch('/api/user/profile').then(r => r.json()).then(console.log);
```

---

## 🔌 Test Kategorisi 2: Socket.IO / WebSocket

### Test 2.1: WebSocket Bağlantısı

**Amaç:** Socket.IO'nun HttpOnly cookie'lerle bağlanabildiğini doğrula

**Adımlar:**
1. Login olun
2. **DevTools → Console'da:**
   ```javascript
   // Socket.IO bağlantı durumunu kontrol edin
   console.log('Socket connected:', window.socket?.connected);
   ```
3. **DevTools → Network → WS (WebSocket) tab'ına gidin**
4. Socket.IO connection'ı bulun (`socket.io/?EIO=4&transport=...`)
5. Frames tab'ında mesajları görün

**Beklenen Sonuç:**
- ✅ WebSocket connection başarılı (`101 Switching Protocols`)
- ✅ **Frames'de şu mesajlar görülmeli:**
  ```
  0{"sid":"..."}  → Socket ID
  40              → Connection successful
  42["connected",{"socketId":"...","userId":"..."}]
  ```
- ✅ Console'da bağlantı mesajı
- ❌ `Authentication error` OLMAMALI

**Hata Durumu:**
```
Error: Authentication error: No cookies found
```
→ Backend Socket.IO middleware'i cookie'leri okumuyor
→ Commit `9faa4c0` deploy edilmiş mi kontrol edin!

---

### Test 2.2: Real-time Notifications

**Amaç:** Bildirim sistemi çalışıyor mu?

**Adımlar:**
1. İki browser veya incognito window açın
2. İkisinde de login olun (farklı kullanıcılar)
3. **1. Browser:** Bir aksiyon yapın (örn: mesaj gönderin)
4. **2. Browser:** Bildirim geldi mi kontrol edin

**Beklenen Sonuç:**
- ✅ 2. browser'da bildirim anında görünmeli
- ✅ **DevTools → Network → WS → Frames:**
  ```
  42["notification",{"type":"message","title":"...","message":"..."}]
  ```
- ✅ Bildirim toast/popup görünmeli
- ✅ Bildirim sayısı artmalı

**Test Komutu (Backend'de):**
```bash
# Backend'den test bildirimi gönderin:
curl -X POST https://your-backend/api/admin/test-notification \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id","message":"Test notification"}'
```

---

### Test 2.3: Typing Indicators

**Amaç:** Real-time typing göstergeleri çalışıyor mu?

**Adımlar:**
1. İki browser açın (farklı kullanıcılar)
2. İkisinde de chat sayfasına gidin
3. **1. Browser:** Chat input'a yazmaya başlayın
4. **2. Browser:** "typing..." göstergesi görünmeli

**Beklenen Sonuç:**
- ✅ Typing indicator 0.5 saniye delay ile görünmeli
- ✅ **WebSocket frames:**
  ```
  42["user_typing",{"userId":"...","conversationId":"...","isTyping":true}]
  ```
- ✅ Yazmayı bırakınca 2-3 saniye sonra kaybolmalı

---

## 🛡️ Test Kategorisi 3: Güvenlik (Security)

### Test 3.1: XSS Protection (HttpOnly Cookie)

**Amaç:** Token'ların JavaScript'ten erişilemediğini doğrula

**Adımlar:**
1. Login olun
2. **DevTools → Console:**
   ```javascript
   // Token'lara erişmeye çalışın:
   console.log('localStorage token:', localStorage.getItem('accessToken'));
   console.log('sessionStorage token:', sessionStorage.getItem('accessToken'));
   console.log('document.cookie:', document.cookie);

   // Hepsinin sonucu:
   // null, null, "" (veya sadece non-HttpOnly cookies)
   ```

**Beklenen Sonuç:**
- ✅ Tüm sonuçlar `null` veya boş string olmalı
- ✅ `document.cookie` ile token okunamaz
- ✅ **Bu XSS saldırılarına karşı koruma sağlar!**

**Simüle XSS Denemesi:**
```javascript
// Kötü niyetli script token'a erişmeye çalışıyor:
const malicious = () => {
  const token = document.cookie.split(';')
    .find(c => c.includes('accessToken'));
  console.log('Stolen token:', token);  // undefined olmalı!
};
malicious();
```

---

### Test 3.2: CSRF Protection

**Amaç:** CSRF token'ların çalıştığını doğrula

**Adımlar:**
1. Login olun
2. **DevTools → Network → Headers**
3. Bir POST request yapın (örn: profil güncelleme)
4. Request headers'ı kontrol edin

**Beklenen Sonuç:**
- ✅ **Request Headers'da:**
  ```
  x-csrf-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- ✅ Backend bu token'ı verify ediyor olmalı
- ❌ Token olmadan request 403 Forbidden dönmeli

**Manuel Test:**
```javascript
// CSRF token olmadan request denemesi:
fetch('/api/user/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test' })
}).then(r => console.log('Status:', r.status));
// Sonuç: 403 Forbidden olmalı
```

---

### Test 3.3: Secure & SameSite Flags

**Amaç:** Cookie security flag'lerini kontrol et

**Adımlar:**
1. **DevTools → Application → Cookies**
2. `accessToken` ve `refreshToken` cookie'lerini seçin
3. Properties'leri kontrol edin

**Beklenen Sonuç:**
- ✅ **HttpOnly:** ☑ (checked)
- ✅ **Secure:** ☑ (checked) - Production'da
- ✅ **SameSite:** Lax veya Strict
- ✅ **Domain:** `.your-domain.com` (subdomain'lerde çalışması için)
- ✅ **Path:** `/`
- ✅ **Expires:** Future date (15 minutes for accessToken, 7 days for refreshToken)

**Produc tion vs Development:**
| Flag | Production | Development (localhost) |
|------|-----------|----------------------|
| Secure | ✅ Must be ON | ❌ Can be OFF |
| HttpOnly | ✅ Must be ON | ✅ Must be ON |
| SameSite | Lax/Strict | Lax |

---

## 🔄 Test Kategorisi 4: Kullanıcı Akışları

### Test 4.1: Tam Kullanıcı Yolculuğu

**Senaryo:** Yeni kullanıcının ilk deneyimi

**Adımlar:**
1. **Kayıt:** Yeni hesap oluştur
2. **Email Doğrulama:** Email'deki linke tıkla (varsa)
3. **Profil Tamamlama:** Profil bilgilerini doldur
4. **Dashboard:** Dashboard'u gez
5. **Bir İşlem Yap:** Örn: assessment başlat
6. **Logout:** Çıkış yap
7. **Login:** Tekrar giriş yap
8. **Session Devam:** İşlemin devam ettiğini kontrol et

**Beklenen Sonuç:**
- ✅ Tüm adımlar sorunsuz çalışmalı
- ✅ Sayfa yenilemede session korunmalı
- ✅ Logout'ta cookie'ler silinmeli
- ✅ Login'de eski session'a dönülebilmeli

---

### Test 4.2: Multi-tab Senaryosu

**Senaryo:** Kullanıcı birden fazla tab'da işlem yapıyor

**Adımlar:**
1. Login olun (Tab 1)
2. **Yeni tab açın** (Tab 2) - Aynı site
3. Tab 2'de işlem yapın (örn: profil düzenle)
4. Tab 1'e dönün - Session hala aktif olmalı
5. Tab 1'de logout yapın
6. Tab 2'yi yenileyin

**Beklenen Sonuç:**
- ✅ Her iki tab'da da session aktif
- ✅ Logout tüm tab'larda geçerli olmalı
- ✅ Tab 2 yenilenince login sayfasına gitmeli

---

### Test 4.3: Token Expiry Senaryosu

**Senaryo:** Access token expire oldu ama refresh token hala geçerli

**Adımlar:**
1. Login olun
2. 15-20 dakika bekleyin (veya token'ı manuel expire edin)
3. Bir işlem yapın (API call)

**Beklenen Sonuç:**
- ✅ İlk request 401 dönebilir
- ✅ Otomatik `/api/auth/refresh` çağrılmalı
- ✅ Yeni token alınmalı
- ✅ Orijinal request tekrar denenmeli (retry)
- ✅ Kullanıcı hiçbir şey farketmemeli

**Network Sequence:**
```
1. POST /api/some-action → 401 Unauthorized
2. POST /api/auth/refresh → 200 OK (yeni token)
3. POST /api/some-action → 200 OK (retry success!)
```

---

## 📊 Test Kategorisi 5: Performance & Load

### Test 5.1: Response Time

**Amaç:** API response sürelerini ölç

**Adımlar:**
1. **DevTools → Network → Headers**
2. Birkaç API call yap
3. **Timing tab'ını kontrol et**

**Beklenen Sonuç:**
- ✅ **Average response time < 500ms:**
  - Auth endpoints: < 200ms
  - Regular API: < 500ms
  - File upload: < 2s
- ✅ **TTFB (Time to First Byte) < 100ms**

---

### Test 5.2: Concurrent Users

**Amaç:** Çoklu kullanıcı simülasyonu

**Adımlar:**
1. 5-10 farklı browser/incognito window açın
2. Hepsinde login olun (farklı kullanıcılar)
3. Aynı anda işlem yapın

**Beklenen Sonuç:**
- ✅ Tüm kullanıcılar sorunsuz bağlanmalı
- ✅ Socket.IO connections stable olmalı
- ✅ Database connection pool yeterli olmalı
- ❌ "Too many connections" hatası OLMAMALI

---

## 🐛 Test Kategorisi 6: Error Scenarios

### Test 6.1: Network Error

**Senaryo:** İnternet bağlantısı kesildi

**Adımlar:**
1. Login olun
2. **DevTools → Network → Throttling:** "Offline" seç
3. Bir işlem yapmaya çalışın
4. Network'ü tekrar "Online" yap

**Beklenen Sonuç:**
- ✅ "Bağlantı hatası" mesajı
- ✅ Retry butonu gösterilmeli
- ✅ Network döndüğünde otomatik reconnect
- ✅ Socket.IO tekrar bağlanmalı

---

### Test 6.2: Invalid Token

**Senaryo:** Token corrupted/invalid

**Adımlar:**
1. Login olun
2. **DevTools → Application → Cookies**
3. `accessToken` değerini bozun (son karakteri değiştirin)
4. Sayfayı yenileyin

**Beklenen Sonuç:**
- ✅ Token invalid algılanmalı
- ✅ Refresh token ile yenileme denenmeli
- ✅ Refresh de başarısızsa login'e yönlendirilmeli
- ❌ Sonsuz loop OLMAMALI

---

### Test 6.3: Expired Refresh Token

**Senaryo:** Her iki token da expire olmuş

**Adımlar:**
1. Login olun
2. **Console'da her iki token'ı silin:**
   ```javascript
   document.cookie = 'accessToken=; path=/; max-age=0';
   document.cookie = 'refreshToken=; path=/; max-age=0';
   ```
3. Sayfayı yenileyin

**Beklenen Sonuç:**
- ✅ Login sayfasına yönlendirilmeli
- ✅ "Session expired" mesajı (opsiyonel)
- ❌ Error page OLMAMALI

---

## ✅ Test Raporu Şablonu

Her test sonrası bu formu doldurun:

```markdown
## Test Raporu - [Tarih]

### Ortam:
- Platform: Production / Staging
- URL: https://...
- Browser: Chrome 119 / Firefox 120
- Test Eden: [İsim]

### Test Sonuçları:

#### ✅ Başarılı Testler:
- [ ] Test 1.1: Kullanıcı Kaydı
- [ ] Test 1.2: Kullanıcı Girişi
- [ ] Test 1.3: Şifre Sıfırlama
- [ ] Test 1.4: Token Refresh
- [ ] Test 2.1: WebSocket Bağlantısı
- [ ] Test 2.2: Real-time Notifications
- [ ] Test 3.1: XSS Protection
- [ ] Test 3.2: CSRF Protection

#### ❌ Başarısız Testler:
- Test adı: [Sorun açıklaması]
- Hata mesajı: [Console log]
- Screenshot: [Link]

#### ⚠️ İyileştirme Önerileri:
1. ...
2. ...

### Performans Metrikleri:
- Average Response Time: XXXms
- Socket.IO Connection Time: XXXms
- Page Load Time: XXXs

### Güvenlik Kontrolleri:
- ✅ HttpOnly cookies: OK
- ✅ CSRF tokens: OK
- ✅ XSS prevention: OK
- ✅ Secure flags: OK
```

---

## 🚨 Kritik Test Checklist

Deployment sonrası **mutlaka** test edin:

- [ ] ✅ Login çalışıyor
- [ ] ✅ Cookie'ler HttpOnly ve Secure
- [ ] ✅ Token localStorage'da DEĞİL
- [ ] ✅ Socket.IO bağlanıyor
- [ ] ✅ Real-time bildirimler çalışıyor
- [ ] ✅ Email gönderimi çalışıyor (Resend)
- [ ] ✅ CSRF protection aktif
- [ ] ✅ Token refresh otomatik
- [ ] ✅ Logout cookie'leri siliyor
- [ ] ✅ Multi-tab scenario çalışıyor

---

**Test tamamlandıktan sonra:**
1. ✅ Tüm testleri pass ederse → Production'a devam
2. ❌ Fail varsa → Rollback yapın ve düzeltin
3. 📊 Raporu dokümante edin

**Son Güncelleme:** 2024-11-06
