# 📋 BilanCompetence.AI - Test Prosedürü Raporu

**Proje:** BilanCompetence.AI  
**Test Tarihi:** _____________  
**Test Uzmanı:** _____________  
**Platform Versiyonu:** Production  
**Backend URL:** https://web-production-5a97.up.railway.app  
**Frontend URL:** https://bilancompetence.vercel.app

---

## 📝 Test Talimatları

- Her test senaryosunu sırayla uygulayın
- Başarılı testleri ✅ ile işaretleyin
- Başarısız testleri ❌ ile işaretleyin ve "Notlar" bölümüne detay ekleyin
- Kısmi başarılı testleri ⚠️ ile işaretleyin
- Her kullanıcı seviyesi için ayrı test hesapları kullanın

---

## 🔐 Test Hesapları

### ADMIN Hesabı
- **Email:** ___________________________
- **Password:** ___________________________
- **Oluşturuldu:** [ ] Evet [ ] Hayır

### CONSULTANT Hesabı
- **Email:** ___________________________
- **Password:** ___________________________
- **Organization:** ___________________________
- **Oluşturuldu:** [ ] Evet [ ] Hayır

### BENEFICIARY Hesabı #1
- **Email:** ___________________________
- **Password:** ___________________________
- **Oluşturuldu:** [ ] Evet [ ] Hayır

### BENEFICIARY Hesabı #2
- **Email:** ___________________________
- **Password:** ___________________________
- **Oluşturuldu:** [ ] Evet [ ] Hayır

---

## 🧪 TEST SENARYOLARI

---

## BÖLÜM 1: GENEL SİSTEM TESTLERİ

### 1.1 Platform Erişilebilirliği
- [ ] Frontend URL'e erişilebiliyor (https://bilancompetence.vercel.app)
- [ ] Backend URL'e erişilebiliyor (https://web-production-5a97.up.railway.app)
- [ ] Backend health endpoint çalışıyor (`GET /health`)
- [ ] Frontend sayfa yükleme süresi < 3 saniye
- [ ] Backend API yanıt süresi < 500ms
- [ ] HTTPS sertifikaları geçerli
- [ ] CORS yapılandırması doğru

**Notlar:**
```


```

---

### 1.2 Responsive Tasarım
- [ ] Desktop görünüm (1920x1080) düzgün
- [ ] Tablet görünüm (768x1024) düzgün
- [ ] Mobile görünüm (375x667) düzgün
- [ ] Tüm butonlar tıklanabilir
- [ ] Tüm formlar kullanılabilir
- [ ] Menüler doğru çalışıyor

**Notlar:**
```


```

---

## BÖLÜM 2: GUEST (Misafir) KULLANICI TESTLERİ

### 2.1 Anasayfa ve Genel Erişim
- [ ] Anasayfa yükleniyor
- [ ] Login sayfasına erişim var
- [ ] Register sayfasına erişim var
- [ ] Hakkımızda/İletişim sayfalarına erişim var
- [ ] Korumalı sayfalara erişim **engelleniyor**
- [ ] Dashboard'a erişim **engelleniyor**

**Notlar:**
```


```

---

### 2.2 Kayıt (Register) İşlemi
- [ ] Register formu görünüyor
- [ ] Email validasyonu çalışıyor
- [ ] Password strength kontrolü çalışıyor
- [ ] Password confirmation kontrolü çalışıyor
- [ ] "Kayıt Ol" butonu çalışıyor
- [ ] Başarılı kayıt sonrası email onayı gerekiyor
- [ ] Email onay linki çalışıyor
- [ ] Onay sonrası login yapılabiliyor

**Notlar:**
```


```

---

### 2.3 Giriş (Login) İşlemi
- [ ] Login formu görünüyor
- [ ] Email/password girişi çalışıyor
- [ ] Yanlış email ile hata mesajı alınıyor
- [ ] Yanlış password ile hata mesajı alınıyor
- [ ] "Şifremi Unuttum" linki çalışıyor
- [ ] Başarılı login sonrası dashboard'a yönlendiriliyor
- [ ] JWT token oluşturuluyor

**Notlar:**
```


```

---

## BÖLÜM 3: BENEFICIARY (Faydalanıcı) KULLANICI TESTLERİ

### 3.1 Dashboard Erişimi
- [ ] Login sonrası dashboard yükleniyor
- [ ] Kullanıcı adı/email görünüyor
- [ ] Profil menüsü erişilebilir
- [ ] Logout butonu çalışıyor
- [ ] Sidebar menüsü görünüyor
- [ ] Bildirimler (varsa) görünüyor

**Notlar:**
```


```

---

### 3.2 Profil Yönetimi
- [ ] Profil sayfası açılıyor
- [ ] Mevcut bilgiler görünüyor
- [ ] Ad/Soyad güncellenebiliyor
- [ ] Email güncellenebiliyor
- [ ] Telefon numarası güncellenebiliyor
- [ ] Profil fotoğrafı yüklenebiliyor
- [ ] Şifre değiştirilebiliyor
- [ ] Değişiklikler kaydediliyor

**Notlar:**
```


```

---

### 3.3 Bilan Oluşturma
- [ ] "Yeni Bilan" butonu görünüyor
- [ ] Bilan oluşturma formu açılıyor
- [ ] Bilan başlığı girilebiliyor
- [ ] Bilan açıklaması girilebiliyor
- [ ] Danışman seçilebiliyor (varsa)
- [ ] Bilan başarıyla oluşturuluyor
- [ ] Oluşturulan bilan listede görünüyor

**Notlar:**
```


```

---

### 3.4 Bilan Görüntüleme
- [ ] Bilan listesi yükleniyor
- [ ] Sadece kendi bilanları görünüyor
- [ ] Başka kullanıcıların bilanları **görünmüyor**
- [ ] Bilan detayı açılabiliyor
- [ ] Bilan durumu (status) görünüyor
- [ ] İlerleme yüzdesi (progress) görünüyor

**Notlar:**
```


```

---

### 3.5 Assessment (Değerlendirme) İşlemleri
- [ ] Assessment listesi görünüyor
- [ ] "Yeni Assessment" butonu çalışıyor
- [ ] Assessment tipi seçilebiliyor (CV, Personality, vb.)
- [ ] Assessment formu doldurulabiliyor
- [ ] Assessment kaydediliyor
- [ ] Kaydedilen assessment görünüyor
- [ ] Assessment düzenlenebiliyor
- [ ] Assessment tamamlanabiliyor

**Notlar:**
```


```

---

### 3.6 CV Analizi
- [ ] CV yükleme formu açılıyor
- [ ] PDF/DOCX formatları kabul ediliyor
- [ ] CV başarıyla yükleniyor
- [ ] CV analizi başlatılabiliyor
- [ ] Analiz sonuçları görünüyor
- [ ] Yetkinlikler (competencies) listeleniyor
- [ ] Öneriler (recommendations) görünüyor

**Notlar:**
```


```

---

### 3.7 Kişilik Analizi (MBTI/RIASEC)
- [ ] MBTI testi başlatılabiliyor
- [ ] MBTI soruları görünüyor
- [ ] Sorular cevaplanabiliyor
- [ ] Test tamamlanabiliyor
- [ ] MBTI sonuçları görünüyor
- [ ] RIASEC testi başlatılabiliyor
- [ ] RIASEC soruları görünüyor
- [ ] RIASEC sonuçları görünüyor

**Notlar:**
```


```

---

### 3.8 Mesajlaşma
- [ ] Mesaj listesi görünüyor
- [ ] Danışmanla mesajlaşma açılıyor
- [ ] Yeni mesaj gönderilebiliyor
- [ ] Gelen mesajlar görünüyor
- [ ] Mesaj bildirimleri çalışıyor
- [ ] Mesaj arama/filtreleme çalışıyor

**Notlar:**
```


```

---

### 3.9 Doküman Yönetimi
- [ ] Doküman listesi görünüyor
- [ ] Yeni doküman yüklenebiliyor
- [ ] PDF/DOCX/JPG formatları destekleniyor
- [ ] Doküman indirilebiliyor
- [ ] Doküman silinebiliyor
- [ ] Doküman kategorileri çalışıyor

**Notlar:**
```


```

---

### 3.10 RLS Güvenlik Testleri (BENEFICIARY)
- [ ] Başka kullanıcının bilanını görüntüleme **engelleniyor**
- [ ] Başka kullanıcının assessment'ını görüntüleme **engelleniyor**
- [ ] Başka kullanıcının CV'sini görüntüleme **engelleniyor**
- [ ] Başka kullanıcının mesajlarını okuma **engelleniyor**
- [ ] Başka kullanıcının dokümanlarını indirme **engelleniyor**
- [ ] API'ye direkt erişimle veri çalma denemesi **başarısız**

**Test Yöntemi:** Browser console'da API çağrıları yaparak test edin.

**Notlar:**
```


```

---

## BÖLÜM 4: CONSULTANT (Danışman) KULLANICI TESTLERİ

### 4.1 Dashboard Erişimi
- [ ] Consultant dashboard yükleniyor
- [ ] Atanan bilanlar listesi görünüyor
- [ ] Bekleyen görevler (tasks) görünüyor
- [ ] İstatistikler görünüyor
- [ ] Takvim/randevu sistemi çalışıyor

**Notlar:**
```


```

---

### 4.2 Bilan Yönetimi
- [ ] Atanan bilanlar listesi görünüyor
- [ ] Bilan detayları açılabiliyor
- [ ] Bilan durumu güncellenebiliyor
- [ ] İlerleme yüzdesi güncellenebiliyor
- [ ] Notlar eklenebiliyor
- [ ] Başka danışmanın bilanları **görünmüyor**

**Notlar:**
```


```

---

### 4.3 Assessment Değerlendirme
- [ ] Faydalanıcının assessment'ları görünüyor
- [ ] Assessment detayları incelenebiliyor
- [ ] Assessment'a yorum eklenebiliyor
- [ ] Assessment onaylanabiliyor/reddedilebiliyor
- [ ] Değerlendirme notları kaydediliyor

**Notlar:**
```


```

---

### 4.4 CV Değerlendirme
- [ ] Faydalanıcının CV'si görüntülenebiliyor
- [ ] CV analiz sonuçları görünüyor
- [ ] CV'ye yorum eklenebiliyor
- [ ] Yetkinlik değerlendirmesi yapılabiliyor
- [ ] Öneriler eklenebiliyor

**Notlar:**
```


```

---

### 4.5 Kişilik Analizi Değerlendirme
- [ ] MBTI sonuçları görünüyor
- [ ] RIASEC sonuçları görünüyor
- [ ] Kişilik profili yorumlanabiliyor
- [ ] Meslek önerileri eklenebiliyor
- [ ] Rapor oluşturulabiliyor

**Notlar:**
```


```

---

### 4.6 Mesajlaşma ve İletişim
- [ ] Faydalanıcılarla mesajlaşma çalışıyor
- [ ] Toplu mesaj gönderilebiliyor
- [ ] Mesaj şablonları kullanılabiliyor
- [ ] Dosya paylaşımı çalışıyor
- [ ] Bildirimler düzgün çalışıyor

**Notlar:**
```


```

---

### 4.7 Rapor Oluşturma
- [ ] Bilan raporu oluşturulabiliyor
- [ ] Rapor şablonları kullanılabiliyor
- [ ] PDF export çalışıyor
- [ ] Rapor önizlemesi görünüyor
- [ ] Rapor faydalanıcıya gönderilebiliyor

**Notlar:**
```


```

---

### 4.8 Action Plan (Eylem Planı) Yönetimi
- [ ] Eylem planı oluşturulabiliyor
- [ ] Hedefler (goals) eklenebiliyor
- [ ] Görevler (tasks) atanabiliyor
- [ ] İlerleme takip edilebiliyor
- [ ] Eylem planı güncellenebiliyor

**Notlar:**
```


```

---

### 4.9 RLS Güvenlik Testleri (CONSULTANT)
- [ ] Atanmadığı bilanları görüntüleme **engelleniyor**
- [ ] Başka danışmanın faydalanıcılarını görme **engelleniyor**
- [ ] Başka organizasyonun verilerine erişim **engelleniyor**
- [ ] Faydalanıcı olarak işaretlenen verileri değiştirme **engelleniyor**
- [ ] API'ye direkt erişimle yetkisiz veri çekme **başarısız**

**Notlar:**
```


```

---

## BÖLÜM 5: ADMIN KULLANICI TESTLERİ

### 5.1 Admin Dashboard
- [ ] Admin dashboard yükleniyor
- [ ] Tüm kullanıcılar görünüyor
- [ ] Tüm organizasyonlar görünüyor
- [ ] Tüm bilanlar görünüyor
- [ ] Sistem istatistikleri görünüyor
- [ ] Aktivite logları görünüyor

**Notlar:**
```


```

---

### 5.2 Kullanıcı Yönetimi
- [ ] Kullanıcı listesi görünüyor
- [ ] Yeni kullanıcı oluşturulabiliyor
- [ ] Kullanıcı rolleri atanabiliyor (ADMIN, CONSULTANT, BENEFICIARY)
- [ ] Kullanıcı bilgileri düzenlenebiliyor
- [ ] Kullanıcı deaktif edilebiliyor
- [ ] Kullanıcı silinebiliyor
- [ ] Kullanıcı arama/filtreleme çalışıyor

**Notlar:**
```


```

---

### 5.3 Organizasyon Yönetimi
- [ ] Organizasyon listesi görünüyor
- [ ] Yeni organizasyon oluşturulabiliyor
- [ ] Organizasyon bilgileri düzenlenebiliyor
- [ ] Organizasyona kullanıcı atanabiliyor
- [ ] Organizasyon deaktif edilebiliyor
- [ ] Organizasyon silinebiliyor

**Notlar:**
```


```

---

### 5.4 Bilan Yönetimi (Admin)
- [ ] Tüm bilanlar görünüyor
- [ ] Bilan detayları görüntülenebiliyor
- [ ] Bilan durumu değiştirilebiliyor
- [ ] Bilan silinebiliyor
- [ ] Bilan istatistikleri görünüyor
- [ ] Bilan export edilebiliyor

**Notlar:**
```


```

---

### 5.5 Qualiopi İndikatörleri
- [ ] Qualiopi endpoint çalışıyor (`GET /api/qualiopi/indicators`)
- [ ] Tüm indikatörler görünüyor
- [ ] İndikatör değerleri doğru hesaplanıyor
- [ ] Kanıtlar (evidence) listeleniyor
- [ ] Qualiopi raporu oluşturulabiliyor
- [ ] Rapor PDF olarak indirilebiliyor

**Notlar:**
```


```

---

### 5.6 Audit Logs (Denetim Kayıtları)
- [ ] Audit log listesi görünüyor
- [ ] Tüm kullanıcı aktiviteleri kaydediliyor
- [ ] Log filtreleme çalışıyor (kullanıcı, tarih, aksiyon)
- [ ] Log detayları görüntülenebiliyor
- [ ] Log export edilebiliyor

**Notlar:**
```


```

---

### 5.7 Sistem Ayarları
- [ ] Sistem ayarları sayfası açılıyor
- [ ] Email ayarları yapılandırılabiliyor
- [ ] API key'leri yönetilebiliyor
- [ ] Güvenlik ayarları değiştirilebiliyor
- [ ] Backup/restore işlemleri yapılabiliyor

**Notlar:**
```


```

---

### 5.8 RLS Güvenlik Testleri (ADMIN)
- [ ] ADMIN tüm bilanları görebiliyor
- [ ] ADMIN tüm assessment'ları görebiliyor
- [ ] ADMIN tüm kullanıcı verilerini görebiliyor
- [ ] ADMIN tüm organizasyon verilerini görebiliyor
- [ ] ADMIN tüm mesajları görebiliyor
- [ ] ADMIN tüm dokümanları görebiliyor

**Notlar:**
```


```

---

## BÖLÜM 6: API ENDPOINT TESTLERİ

### 6.1 Authentication Endpoints
- [ ] `POST /api/auth/register` - Kayıt çalışıyor
- [ ] `POST /api/auth/login` - Giriş çalışıyor
- [ ] `POST /api/auth/logout` - Çıkış çalışıyor
- [ ] `POST /api/auth/refresh` - Token yenileme çalışıyor
- [ ] `POST /api/auth/forgot-password` - Şifre sıfırlama çalışıyor
- [ ] `POST /api/auth/reset-password` - Şifre değiştirme çalışıyor

**Notlar:**
```


```

---

### 6.2 User Endpoints
- [ ] `GET /api/users/me` - Kullanıcı profili çalışıyor
- [ ] `PUT /api/users/me` - Profil güncelleme çalışıyor
- [ ] `GET /api/users` - Kullanıcı listesi (ADMIN) çalışıyor
- [ ] `POST /api/users` - Kullanıcı oluşturma (ADMIN) çalışıyor
- [ ] `PUT /api/users/:id` - Kullanıcı güncelleme (ADMIN) çalışıyor
- [ ] `DELETE /api/users/:id` - Kullanıcı silme (ADMIN) çalışıyor

**Notlar:**
```


```

---

### 6.3 Bilan Endpoints
- [ ] `GET /api/bilans` - Bilan listesi çalışıyor
- [ ] `GET /api/bilans/:id` - Bilan detayı çalışıyor
- [ ] `POST /api/bilans` - Bilan oluşturma çalışıyor
- [ ] `PUT /api/bilans/:id` - Bilan güncelleme çalışıyor
- [ ] `DELETE /api/bilans/:id` - Bilan silme çalışıyor

**Notlar:**
```


```

---

### 6.4 Assessment Endpoints
- [ ] `GET /api/assessments` - Assessment listesi çalışıyor
- [ ] `GET /api/assessments/:id` - Assessment detayı çalışıyor
- [ ] `POST /api/assessments` - Assessment oluşturma çalışıyor
- [ ] `PUT /api/assessments/:id` - Assessment güncelleme çalışıyor
- [ ] `DELETE /api/assessments/:id` - Assessment silme çalışıyor

**Notlar:**
```


```

---

### 6.5 CV Analysis Endpoints
- [ ] `POST /api/cv-analyses` - CV yükleme çalışıyor
- [ ] `GET /api/cv-analyses/:id` - CV analizi görüntüleme çalışıyor
- [ ] `PUT /api/cv-analyses/:id` - CV analizi güncelleme çalışıyor
- [ ] `DELETE /api/cv-analyses/:id` - CV analizi silme çalışıyor

**Notlar:**
```


```

---

### 6.6 Personality Analysis Endpoints
- [ ] `GET /api/personality-analyses` - Kişilik analizleri listesi çalışıyor
- [ ] `POST /api/personality-analyses` - Yeni analiz oluşturma çalışıyor
- [ ] `GET /api/personality-analyses/:id` - Analiz detayı çalışıyor
- [ ] `PUT /api/personality-analyses/:id` - Analiz güncelleme çalışıyor

**Notlar:**
```


```

---

### 6.7 Message Endpoints
- [ ] `GET /api/messages` - Mesaj listesi çalışıyor
- [ ] `POST /api/messages` - Mesaj gönderme çalışıyor
- [ ] `GET /api/messages/:id` - Mesaj detayı çalışıyor
- [ ] `DELETE /api/messages/:id` - Mesaj silme çalışıyor

**Notlar:**
```


```

---

### 6.8 Document Endpoints
- [ ] `GET /api/documents` - Doküman listesi çalışıyor
- [ ] `POST /api/documents` - Doküman yükleme çalışıyor
- [ ] `GET /api/documents/:id` - Doküman indirme çalışıyor
- [ ] `DELETE /api/documents/:id` - Doküman silme çalışıyor

**Notlar:**
```


```

---

### 6.9 Qualiopi Endpoints
- [ ] `GET /api/qualiopi/indicators` - İndikatörler çalışıyor
- [ ] `GET /api/qualiopi/evidence` - Kanıtlar listeleniyor
- [ ] `POST /api/qualiopi/evidence` - Kanıt ekleme çalışıyor
- [ ] `GET /api/qualiopi/report` - Rapor oluşturma çalışıyor

**Notlar:**
```


```

---

## BÖLÜM 7: PERFORMANS TESTLERİ

### 7.1 Sayfa Yükleme Süreleri
- [ ] Anasayfa < 2 saniye
- [ ] Dashboard < 3 saniye
- [ ] Bilan listesi < 2 saniye
- [ ] Assessment detayı < 2 saniye
- [ ] Profil sayfası < 2 saniye

**Ölçülen Süreler:**
```
Anasayfa: _____ ms
Dashboard: _____ ms
Bilan listesi: _____ ms
Assessment detayı: _____ ms
Profil sayfası: _____ ms
```

---

### 7.2 API Yanıt Süreleri
- [ ] GET /api/users/me < 200ms
- [ ] GET /api/bilans < 500ms
- [ ] GET /api/assessments < 500ms
- [ ] POST /api/auth/login < 300ms
- [ ] GET /api/qualiopi/indicators < 1000ms

**Ölçülen Süreler:**
```
GET /api/users/me: _____ ms
GET /api/bilans: _____ ms
GET /api/assessments: _____ ms
POST /api/auth/login: _____ ms
GET /api/qualiopi/indicators: _____ ms
```

---

### 7.3 Yük Testleri
- [ ] 10 eşzamanlı kullanıcı - Sistem stabil
- [ ] 50 eşzamanlı kullanıcı - Sistem stabil
- [ ] 100 eşzamanlı kullanıcı - Sistem stabil
- [ ] Database connection pool yeterli
- [ ] Memory kullanımı normal

**Notlar:**
```


```

---

## BÖLÜM 8: GÜVENLİK TESTLERİ

### 8.1 Authentication Güvenliği
- [ ] JWT token doğru oluşturuluyor
- [ ] Token expiration çalışıyor
- [ ] Refresh token mekanizması çalışıyor
- [ ] Geçersiz token ile erişim **engelleniyor**
- [ ] Expired token ile erişim **engelleniyor**

**Notlar:**
```


```

---

### 8.2 Authorization Güvenliği
- [ ] Role-based access control (RBAC) çalışıyor
- [ ] BENEFICIARY, CONSULTANT'a ait verilere erişemiyor
- [ ] CONSULTANT, başka CONSULTANT'ın verilerine erişemiyor
- [ ] ADMIN, tüm verilere erişebiliyor
- [ ] Yetkisiz endpoint erişimi **engelleniyor**

**Notlar:**
```


```

---

### 8.3 SQL Injection Testleri
- [ ] Login formunda SQL injection denemesi **başarısız**
- [ ] Search formlarında SQL injection **başarısız**
- [ ] API parametrelerinde SQL injection **başarısız**
- [ ] Prepared statements kullanılıyor

**Test Örnekleri:**
```
' OR '1'='1
'; DROP TABLE users; --
admin'--
```

**Notlar:**
```


```

---

### 8.4 XSS (Cross-Site Scripting) Testleri
- [ ] Input alanlarında XSS denemesi **başarısız**
- [ ] Mesaj içeriğinde XSS **başarısız**
- [ ] Profil bilgilerinde XSS **başarısız**
- [ ] HTML sanitization çalışıyor

**Test Örnekleri:**
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
```

**Notlar:**
```


```

---

### 8.5 CSRF (Cross-Site Request Forgery) Testleri
- [ ] CSRF token kontrolü çalışıyor
- [ ] Geçersiz CSRF token ile istek **reddediliyor**
- [ ] SameSite cookie ayarları doğru

**Notlar:**
```


```

---

### 8.6 File Upload Güvenliği
- [ ] Sadece izin verilen dosya tipleri yüklenebiliyor
- [ ] Dosya boyutu limiti kontrol ediliyor
- [ ] Zararlı dosya yükleme **engelleniyor**
- [ ] Dosya adları sanitize ediliyor

**Notlar:**
```


```

---

## BÖLÜM 9: VERİ BÜTÜNLÜĞÜ TESTLERİ

### 9.1 Database Constraints
- [ ] Unique constraints çalışıyor (email, vb.)
- [ ] Foreign key constraints çalışıyor
- [ ] NOT NULL constraints çalışıyor
- [ ] Check constraints çalışıyor

**Notlar:**
```


```

---

### 9.2 Data Validation
- [ ] Email formatı doğrulanıyor
- [ ] Telefon numarası formatı doğrulanıyor
- [ ] Tarih formatları doğrulanıyor
- [ ] Zorunlu alanlar kontrol ediliyor
- [ ] Maksimum uzunluklar kontrol ediliyor

**Notlar:**
```


```

---

### 9.3 Transaction Management
- [ ] Database transactions çalışıyor
- [ ] Rollback mekanizması çalışıyor
- [ ] Concurrent updates doğru yönetiliyor
- [ ] Deadlock durumları yönetiliyor

**Notlar:**
```


```

---

## BÖLÜM 10: HATA YÖNETİMİ TESTLERİ

### 10.1 Hata Mesajları
- [ ] Kullanıcı dostu hata mesajları gösteriliyor
- [ ] Teknik detaylar gizleniyor
- [ ] HTTP status kodları doğru
- [ ] Error logging çalışıyor

**Notlar:**
```


```

---

### 10.2 Edge Cases
- [ ] Boş form gönderme **engelleniyor**
- [ ] Çok uzun input **engelleniyor**
- [ ] Özel karakterler doğru işleniyor
- [ ] Unicode karakterler destekleniyor
- [ ] Null/undefined değerler yönetiliyor

**Notlar:**
```


```

---

## BÖLÜM 11: ENTEGRASYON TESTLERİ

### 11.1 Email Entegrasyonu
- [ ] Kayıt email'i gönderiliyor
- [ ] Şifre sıfırlama email'i gönderiliyor
- [ ] Bildirim email'leri gönderiliyor
- [ ] Email şablonları düzgün görünüyor

**Notlar:**
```


```

---

### 11.2 France Travail API Entegrasyonu
- [ ] API bağlantısı çalışıyor
- [ ] Meslek önerileri alınabiliyor
- [ ] API hata yönetimi çalışıyor
- [ ] Rate limiting yönetiliyor

**Notlar:**
```


```

---

### 11.3 Gemini AI Entegrasyonu
- [ ] AI API bağlantısı çalışıyor
- [ ] CV analizi AI ile yapılabiliyor
- [ ] Kişilik analizi yorumları AI ile oluşturuluyor
- [ ] AI yanıtları doğru formatlanıyor

**Notlar:**
```


```

---

## BÖLÜM 12: KULLANICI DENEYİMİ (UX) TESTLERİ

### 12.1 Navigasyon
- [ ] Menü yapısı anlaşılır
- [ ] Breadcrumb navigation çalışıyor
- [ ] Geri butonu çalışıyor
- [ ] Sayfa geçişleri smooth
- [ ] Loading göstergeleri var

**Notlar:**
```


```

---

### 12.2 Form Kullanılabilirliği
- [ ] Form alanları açık etiketlenmiş
- [ ] Placeholder metinler yardımcı
- [ ] Hata mesajları anlaşılır
- [ ] Başarı mesajları gösteriliyor
- [ ] Auto-focus çalışıyor

**Notlar:**
```


```

---

### 12.3 Accessibility (Erişilebilirlik)
- [ ] Keyboard navigation çalışıyor
- [ ] Screen reader uyumlu
- [ ] Renk kontrastı yeterli
- [ ] Alt text'ler mevcut
- [ ] ARIA labels kullanılıyor

**Notlar:**
```


```

---

## 📊 TEST SONUÇ ÖZETİ

### Genel İstatistikler
- **Toplam Test Sayısı:** ~250
- **Başarılı Testler:** _____ / 250
- **Başarısız Testler:** _____ / 250
- **Kısmi Başarılı:** _____ / 250
- **Başarı Oranı:** _____ %

### Kritik Sorunlar
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

### Orta Öncelikli Sorunlar
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

### Düşük Öncelikli Sorunlar
```
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

---

## ✅ ONAY

### Test Uzmanı Onayı
- **Ad Soyad:** _____________________________
- **İmza:** _____________________________
- **Tarih:** _____________________________

### Proje Yöneticisi Onayı
- **Ad Soyad:** _____________________________
- **İmza:** _____________________________
- **Tarih:** _____________________________

---

## 📎 EKLER

### Ek 1: Ekran Görüntüleri
- [ ] Başarılı testlerin ekran görüntüleri eklendi
- [ ] Başarısız testlerin ekran görüntüleri eklendi

### Ek 2: Log Dosyaları
- [ ] Backend log dosyaları eklendi
- [ ] Frontend console log'ları eklendi
- [ ] Database query log'ları eklendi

### Ek 3: Performans Raporları
- [ ] Lighthouse raporu eklendi
- [ ] API performans raporu eklendi
- [ ] Database performans raporu eklendi

---

**Rapor Versiyonu:** 1.0  
**Son Güncelleme:** 25 Ekim 2025  
**Hazırlayan:** Manus AI

