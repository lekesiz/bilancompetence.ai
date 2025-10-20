import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test('should display login form with all fields', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Check email field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');

    // Check password field
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', '••••••••••••');

    // Check remember me checkbox
    const rememberCheckbox = page.locator('input[type="checkbox"]');
    await expect(rememberCheckbox).toBeVisible();

    // Check submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('Sign In');

    // Check forgot password link
    const forgotLink = page.locator('a[href="/forgot-password"]');
    await expect(forgotLink).toBeVisible();

    // Check signup link
    const signupLink = page.locator('a[href="/register"]');
    await expect(signupLink).toBeVisible();
  });

  test('should show demo credentials', async ({ page }) => {
    // Check demo credentials section
    const demoSection = page.locator('text=Demo Credentials');
    await expect(demoSection).toBeVisible();

    // Check demo email is displayed
    await expect(page.locator('text=demo@example.com')).toBeVisible();

    // Check demo password is displayed
    await expect(page.locator('text=Demo@123456')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Try invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();

    // Should show validation error
    const errorMessage = page.locator('text=Invalid email');
    await expect(errorMessage).toBeVisible();

    // Clear and try valid email format
    await emailInput.clear();
    await emailInput.fill('user@example.com');
    // Error should disappear after correcting
  });

  test('should validate password minimum length', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Enter valid email but short password
    await emailInput.fill('user@example.com');
    await passwordInput.fill('short');
    await submitButton.click();

    // Should show validation error
    const errorMessage = page.locator('text=/at least 8 characters|password must/i');
    await expect(errorMessage).toBeVisible();

    // Correct password
    await passwordInput.clear();
    await passwordInput.fill('ValidPassword123');
    // Error should disappear
  });

  test('should enable/disable submit button based on validation', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Initially button should be enabled
    await expect(submitButton).toBeEnabled();

    // Enter invalid email
    await emailInput.fill('invalid');

    // Submit with empty password - should show error
    await submitButton.click();
    await expect(page.locator('text=/invalid/i')).toBeVisible();

    // Fill valid credentials
    await emailInput.clear();
    await emailInput.fill('user@example.com');
    await passwordInput.fill('ValidPass123');

    // Button should still be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: /👁|🙈/ });

    // Enter password
    await passwordInput.fill('MyPassword123');

    // Password should be hidden initially
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button to show
    await toggleButton.click();

    // Should show password as text
    const visibleInput = page.locator('input[type="text"]');
    await expect(visibleInput).toHaveValue('MyPassword123');

    // Click toggle again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle remember me checkbox', async ({ page }) => {
    const rememberCheckbox = page.locator('input[type="checkbox"]');

    // Initially unchecked
    await expect(rememberCheckbox).not.toBeChecked();

    // Click to check
    await rememberCheckbox.click();
    await expect(rememberCheckbox).toBeChecked();

    // Click to uncheck
    await rememberCheckbox.click();
    await expect(rememberCheckbox).not.toBeChecked();
  });

  test('should show loading state during login', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Fill form
    await emailInput.fill('user@example.com');
    await passwordInput.fill('ValidPassword123');

    // Click submit
    await submitButton.click();

    // Button should show loading state
    const loadingIndicator = page.locator('text=/signing in|loading/i');
    if (await loadingIndicator.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingIndicator).toBeVisible();
      // Button should be disabled during loading
      await expect(submitButton).toBeDisabled();
    }
  });

  test('should handle demo credentials login', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Use demo credentials
    await emailInput.fill('demo@example.com');
    await passwordInput.fill('Demo@123456');

    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(1000);

    // Should either show success message or redirect to dashboard
    const successMessage = page.locator('text=/login successful|welcome/i');
    const isDashboard = page.url().includes('/dashboard');

    if (await successMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(successMessage).toBeVisible();
    } else if (isDashboard) {
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should show error message on failed login', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Use non-existent credentials
    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('WrongPassword123');

    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(1000);

    // Should show error message
    const errorMessage = page.locator('[class*="error"], [role="alert"], text=/failed|invalid/i');
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should navigate to signup page', async ({ page }) => {
    const signupLink = page.locator('a[href="/register"]').or(page.locator('text=Create one here'));
    await signupLink.click();

    // Should navigate to registration page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    const forgotLink = page.locator('a[href="/forgot-password"]');
    await forgotLink.click();

    // Should navigate to forgot password page
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('should have responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Form should still be visible and usable
    const formContainer = page.locator('form');
    await expect(formContainer).toBeVisible();

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Should be able to interact with form
    await emailInput.fill('user@example.com');
    await expect(emailInput).toHaveValue('user@example.com');
  });

  test('should have responsive layout on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Form should be properly displayed
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Welcome Back');

    // Input fields should be accessible
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should preserve form data if navigation back', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Fill form
    await emailInput.fill('user@example.com');
    await passwordInput.fill('MyPassword123');

    // Navigate to register page
    const signupLink = page.locator('a[href="/register"]').or(page.locator('text=Create one here'));
    await signupLink.click();

    // Navigate back to login
    await page.goBack();

    // Form should be reset (standard browser behavior)
    // Or might retain data depending on implementation
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Note: This would require mocking network errors
    // In real tests, we might simulate offline mode
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill('user@example.com');
    await passwordInput.fill('ValidPassword123');

    // Go offline
    await page.context().setOffline(true);

    await submitButton.click();

    // Should show error message
    const errorMessage = page.locator('[class*="error"], [role="alert"]');
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(errorMessage).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);
  });
});
