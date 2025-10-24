import { test, expect } from '@playwright/test';

/**
 * Senaryo Grubu A: Temel İş Akışı (Beneficiary & Consultant)
 * 
 * Bu test grubu, BilanCompetence.AI'nin temel kullanıcı akışlarını test eder:
 * - Kullanıcı kaydı ve doğrulama
 * - Assessment (bilan) başlatma ve tamamlama
 * - Danışman ataması ve onayı
 * - AI öneri oluşturma
 */

test.describe('Grup A: Temel İş Akışı', () => {
  const TEST_EMAIL = `test-${Date.now()}@example.com`;
  const TEST_PASSWORD = 'Test@123456';
  const TEST_FULL_NAME = 'Test User';

  test.beforeEach(async ({ page }) => {
    // Her testten önce ana sayfaya git
    await page.goto('/');
  });

  test('A.1 - Faydalanıcı Kaydı ve Bilanço Başlatma', async ({ page }) => {
    // Register sayfasına git
    await page.goto('/register');
    
    // Step 1: Email
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.click('button:has-text("Next")');
    
    // Step 2: Password
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);
    await page.click('button:has-text("Next")');
    
    // Step 3: Details
    await page.fill('input[name="fullName"]', TEST_FULL_NAME);
    await page.click('button:has-text("Create Account")');
    
    // Email verification sayfasına yönlendirilmeli
    await expect(page).toHaveURL(/\/verify-email/);
    
    // Mock email verification (production'da email link tıklanır)
    // Test ortamında direkt olarak verify endpoint'ini çağırabiliriz
    // veya test kullanıcısını otomatik verify edebiliriz
  });

  test('A.2 - Değerlendirme Sihirbazı (Wizard) Tamamlanması', async ({ page }) => {
    // Login olmuş bir beneficiary kullanıcısı ile başla
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'Demo@123456');
    await page.click('button:has-text("Sign In")');
    
    // Dashboard'a yönlendirilmeli
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Yeni assessment başlat
    await page.click('button:has-text("Démarrer un bilan")');
    
    // Step 1: İş Geçmişi (Work History)
    await page.fill('textarea[name="workHistory"]', 'Test work history content');
    await page.click('button:has-text("Suivant")');
    
    // Auto-save kontrolü - localStorage veya API çağrısı kontrol edilebilir
    await page.waitForTimeout(1000);
    
    // Step 2: Eğitim (Education)
    await page.fill('textarea[name="education"]', 'Test education content');
    await page.click('button:has-text("Suivant")');
    
    // Step 3: Yetkinlikler (Competencies)
    await page.fill('input[name="competency1"]', 'Leadership');
    await page.fill('input[name="competency2"]', 'Communication');
    await page.click('button:has-text("Suivant")');
    
    // Step 4: Motivasyonlar (Motivations)
    await page.fill('textarea[name="motivations"]', 'Test motivations');
    await page.click('button:has-text("Suivant")');
    
    // Step 5: Kısıtlamalar (Constraints)
    await page.fill('textarea[name="constraints"]', 'Test constraints');
    await page.click('button:has-text("Terminer")');
    
    // Assessment tamamlandı mesajı görünmeli
    await expect(page.locator('text=Assessment completed')).toBeVisible();
  });

  test('A.3 - Bilanço Gönderimi ve Danışman Ataması', async ({ page }) => {
    // Login as beneficiary
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'Demo@123456');
    await page.click('button:has-text("Sign In")');
    
    // Assessment listesine git
    await page.goto('/dashboard/assessments');
    
    // DRAFT durumundaki bir assessment seç
    await page.click('tr:has-text("DRAFT") button:has-text("Submit")');
    
    // Confirm dialog
    await page.click('button:has-text("Confirm")');
    
    // Durum SUBMITTED olarak güncellenmeli
    await expect(page.locator('text=SUBMITTED')).toBeVisible();
    
    // Danışman atanmamışsa hata mesajı görünmeli
    // veya atanmışsa bildirim gönderilmeli
  });

  test('A.4 - Bilanço Onayı ve Geri Bildirim (Consultant)', async ({ page }) => {
    // Login as consultant
    await page.goto('/login');
    await page.fill('input[name="email"]', 'consultant@example.com');
    await page.fill('input[name="password"]', 'Consultant@123');
    await page.click('button:has-text("Sign In")');
    
    // Consultant dashboard'a git
    await page.goto('/dashboard/consultant');
    
    // Atanan assessments listesini göster
    await page.click('text=Assigned Assessments');
    
    // Bir assessment seç
    await page.click('tr:has-text("SUBMITTED"):first-child');
    
    // Yetkinlikleri gözden geçir
    await expect(page.locator('h2:has-text("Competencies")')).toBeVisible();
    
    // Assessment level ve not gir
    await page.selectOption('select[name="assessmentLevel"]', 'ADVANCED');
    await page.fill('textarea[name="consultantNotes"]', 'Excellent work, well done!');
    
    // Approve ve COMPLETED olarak işaretle
    await page.click('button:has-text("Approve & Complete")');
    
    // Başarı mesajı
    await expect(page.locator('text=Assessment approved')).toBeVisible();
  });

  test('A.5 - Öneri Oluşturma ve Görüntüleme', async ({ page }) => {
    // Login as beneficiary
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'Demo@123456');
    await page.click('button:has-text("Sign In")');
    
    // Recommendations sayfasına git
    await page.goto('/dashboard/recommendations');
    
    // AI tarafından oluşturulan öneriler görünmeli
    await expect(page.locator('h2:has-text("Career Recommendations")')).toBeVisible();
    
    // En az bir öneri kartı olmalı
    await expect(page.locator('.recommendation-card').first()).toBeVisible();
    
    // Öneri detaylarını kontrol et
    const firstRecommendation = page.locator('.recommendation-card').first();
    await expect(firstRecommendation.locator('.job-title')).toBeVisible();
    await expect(firstRecommendation.locator('.match-score')).toBeVisible();
  });
});

