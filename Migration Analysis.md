# Migration Analysis

**Tarih:** 25 Ekim 2025
**Kaynak:** `/home/ubuntu/bilancompetence.ai/apps/backend/migrations/001_create_schema.sql`

## Users Table Schema (Migration)

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,  -- ❌ SORUN BURADA!
  age INT,
  role VARCHAR(50) NOT NULL DEFAULT 'BENEFICIARY',
  organization_id UUID,
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

## Sorun

Migration dosyası **`full_name`** kolonunu oluşturuyor ama backend kodu **`first_name`** ve **`last_name`** kullanıyor.

## Kanıt

1. **Migration (001_create_schema.sql):**
   - Satır 12: `full_name VARCHAR(255) NOT NULL`

2. **Supabase (Gerçek Veritabanı):**
   - `full_name` kolonu VAR ✅
   - `first_name` kolonu YOK ❌
   - `last_name` kolonu YOK ❌

3. **Backend Logs:**
   - `POST /api/auth/register 400 Bad Request`
   - Muhtemelen backend `first_name` ve `last_name` gönderiyor ama veritabanı kabul etmiyor

## Çözüm Önerileri

### Seçenek 1: Backend'i Güncelle (Önerilen)
Backend kodunu `full_name` kullanacak şekilde güncelle:
```typescript
// Önce
{ firstName, lastName } = req.body;

// Sonra
{ fullName } = req.body;
```

### Seçenek 2: Migration Ekle
`full_name`'i `first_name` ve `last_name`'e bölen bir migration ekle:
```sql
ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
UPDATE users SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = substring(full_name from position(' ' in full_name) + 1);
ALTER TABLE users DROP COLUMN full_name;
```

### Seçenek 3: SQL ile Direkt ADMIN Oluştur
`full_name` kullanarak direkt SQL ile ADMIN user ekle (geçici çözüm):
```sql
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('admin@bilancompetence.ai', crypt('AdminSecure123!@#', gen_salt('bf')), 'Admin User', 'ADMIN');
```

## Sonuç

Migration dosyası **doğru** - `full_name` kullanıyor. Sorun **backend kodunda** - `first_name` ve `last_name` kullanıyor. Backend kodu migration ile uyumlu değil!

