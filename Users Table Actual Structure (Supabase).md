# Users Table Actual Structure (Supabase)

**Tarih:** 25 Ekim 2025
**Kaynak:** Supabase SQL Editor - information_schema.columns

## Kolonlar (12 rows)

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| id | uuid | NO | gen_random_uuid() |
| email | character varying | NO | NULL |
| password_hash | character varying | NO | NULL |
| **full_name** | character varying | NO | NULL |
| age | integer | YES | NULL |
| role | character varying | NO | 'BENEFICIARY'::character varying |
| organization_id | uuid | YES | NULL |
| avatar_url | text | YES | NULL |
| bio | text | YES | NULL |
| ... | ... | ... | ... |

## Önemli Bulgular

1. ❌ **`first_name` kolonu YOK** - Bunun yerine `full_name` var
2. ❌ **`last_name` kolonu YOK** - Bunun yerine `full_name` var
3. ✅ `role` kolonu VAR - Default: 'BENEFICIARY'
4. ✅ `password_hash` kolonu VAR
5. ✅ `email` kolonu VAR
6. ✅ `organization_id` kolonu VAR

## Sorun

Backend kodu `first_name` ve `last_name` kolonlarını kullanıyor ama veritabanında `full_name` kolonu var. Bu uyumsuzluk:
- Register endpoint'inin çalışmamasına neden oluyor
- User creation işlemlerinin başarısız olmasına neden oluyor

## Çözüm Önerileri

1. **Migration ekle**: `full_name`'i `first_name` ve `last_name`'e böl
2. **Backend'i güncelle**: `full_name` kullanacak şekilde adapte et
3. **SQL ile direkt insert**: `full_name` kullanarak ADMIN user oluştur

