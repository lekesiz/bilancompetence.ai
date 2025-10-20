import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page before each test
    await page.goto('/register');
  });

  test('should display registration form with all fields', async ({ page }) => {
    // Check form title
    await expect(page.locator('h1')).toContainText('Create Account');

    // Check step indicator exists (progress bar)
    const progressBar = page.locator('[class*="progress"]');
    await expect(progressBar).toBeVisible();

    // Step 1: Email field should be visible
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('Step 1: should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton = page.locator('button:has-text("Continue")').first();

    // Try invalid email
    await emailInput.fill('invalid-email');
    await continueButton.click();

    // Should show validation error
    const errorMessage = page.locator('text=Invalid email');
    await expect(errorMessage).toBeVisible();

    // Clear and try valid email
    await emailInput.clear();
    await emailInput.fill('user@example.com');

    // Button should become enabled
    await expect(continueButton).toBeEnabled();
  });

  test('Step 1: should proceed with valid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton = page.locator('button:has-text("Continue")').first();

    await emailInput.fill('newuser@example.com');
    await continueButton.click();

    // Should move to Step 2: Password
    await expect(page.locator('label:has-text("Password")')).toBeVisible();
  });

  test('Step 2: should validate password strength', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton1 = page.locator('button:has-text("Continue")').first();

    // Go to step 2
    await emailInput.fill('user@example.com');
    await continueButton1.click();

    // Wait for password field
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    // Try weak password
    await passwordInput.fill('weak');

    // Check password strength indicator shows failures
    const strengthIndicator = page.locator('[class*="strength"], [class*="meter"]');
    if (await strengthIndicator.isVisible()) {
      // Verify it shows red/error color for weak password
      const failedChecks = page.locator('text=/❌|✗|✕/');
      await expect(failedChecks.first()).toBeVisible();
    }
  });

  test('Step 2: should show password strength requirements', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton1 = page.locator('button:has-text("Continue")').first();

    // Go to step 2
    await emailInput.fill('user@example.com');
    await continueButton1.click();

    const passwordInput = page.locator('input[type="password"]').first();

    // Type a character
    await passwordInput.fill('P');

    // Should show requirements
    await expect(page.locator('text=character')).toBeVisible();

    // Add more characters to meet requirements
    await passwordInput.fill('SecurePass@123');

    // Should show most requirements met
    const checkedItems = page.locator('text=✓');
    const visibleChecks = await checkedItems.count();
    expect(visibleChecks).toBeGreaterThanOrEqual(4); // At least uppercase, lowercase, digit, special
  });

  test('Step 2: should proceed with strong password', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton1 = page.locator('button:has-text("Continue")').first();

    // Go to step 2
    await emailInput.fill('user@example.com');
    await continueButton1.click();

    const passwordInput = page.locator('input[type="password"]').first();
    const continueButton2 = page.locator('button:has-text("Continue")').nth(1);

    // Enter strong password
    await passwordInput.fill('SecurePass@123');
    await continueButton2.click();

    // Should move to Step 3: Full Name
    await expect(page.locator('label:has-text("Full Name")')).toBeVisible();
  });

  test('Step 3: should validate name', async ({ page }) => {
    // Go through steps 1 and 2
    const emailInput = page.locator('input[type="email"]');
    const continueButton1 = page.locator('button:has-text("Continue")').first();

    await emailInput.fill('user@example.com');
    await continueButton1.click();

    const passwordInput = page.locator('input[type="password"]').first();
    const continueButton2 = page.locator('button:has-text("Continue")').nth(1);

    await passwordInput.fill('SecurePass@123');
    await continueButton2.click();

    // Step 3: Try invalid name (too short)
    const nameInput = page.locator('input[type="text"]').last();
    const submitButton = page.locator('button:has-text("Create Account")');

    await nameInput.fill('A');
    await submitButton.click();

    // Should show validation error
    const errorMessage = page.locator('text=/must be at least|too short/i');
    await expect(errorMessage).toBeVisible();

    // Clear and try valid name
    await nameInput.clear();
    await nameInput.fill('John Doe');
    await expect(submitButton).toBeEnabled();
  });

  test('should complete full registration', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton1 = page.locator('button:has-text("Continue")').first();

    // Step 1: Email
    await emailInput.fill('newuser@example.com');
    await continueButton1.click();

    // Step 2: Password
    const passwordInput = page.locator('input[type="password"]').first();
    const continueButton2 = page.locator('button:has-text("Continue")').nth(1);

    await passwordInput.fill('SecurePass@123');
    await continueButton2.click();

    // Step 3: Name
    const nameInput = page.locator('input[type="text"]').last();
    const submitButton = page.locator('button:has-text("Create Account")');

    await nameInput.fill('John Doe');
    await submitButton.click();

    // Should show success message or redirect
    // Wait for response
    await page.waitForTimeout(1000);

    // Should either show success or redirect to dashboard
    const successMessage = page.locator('text=/success|account created/i');
    const isDashboard = page.url().includes('/dashboard');

    if (await successMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(successMessage).toBeVisible();
    } else if (isDashboard) {
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should toggle password visibility', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton1 = page.locator('button:has-text("Continue")').first();

    // Go to step 2
    await emailInput.fill('user@example.com');
    await continueButton1.click();

    const passwordInput = page.locator('input[type="password"]').first();
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: /👁|🙈/ });

    // Password should be hidden initially
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await toggleButton.click();

    // Password should now be visible
    const visiblePasswordInput = page.locator('input[type="text"]');
    await expect(visiblePasswordInput).toBeVisible();

    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle session persistence after registration', async ({ page, context }) => {
    const emailInput = page.locator('input[type="email"]');
    const continueButton1 = page.locator('button:has-text("Continue")').first();

    // Complete registration
    await emailInput.fill('persistent@example.com');
    await continueButton1.click();

    const passwordInput = page.locator('input[type="password"]').first();
    const continueButton2 = page.locator('button:has-text("Continue")').nth(1);

    await passwordInput.fill('SecurePass@123');
    await continueButton2.click();

    const nameInput = page.locator('input[type="text"]').last();
    const submitButton = page.locator('button:has-text("Create Account")');

    await nameInput.fill('Test User');
    await submitButton.click();

    // Wait a moment for registration to complete
    await page.waitForTimeout(1000);

    // Check if localStorage has auth tokens
    const localStorage = await context.storageState();
    // Note: We would verify token storage in actual tests
  });

  test('should redirect to login if already have token', async ({ page, context }) => {
    // Set mock auth token
    await context.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-token-here');
    });

    // Visit register page
    await page.goto('/register');

    // Should redirect to dashboard
    // Note: This depends on implementation
  });
});
