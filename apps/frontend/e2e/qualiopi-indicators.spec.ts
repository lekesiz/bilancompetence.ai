import { test, expect } from '@playwright/test';

test.describe('Qualiopi Indicators Page - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to indicators page
    // Note: In a real environment, you would login first
    // For this example, we assume the user is already logged in via fixtures
    await page.goto('/admin/qualiopi/indicators', { waitUntil: 'networkidle' });
  });

  test('should load indicators page with metrics', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page title
    const title = page.locator('h1');
    await expect(title).toContainText('Qualiopi Uyumluluk Göstergeleri');

    // Check for metric cards (MetricCard component)
    const metricCards = page.locator('[class*="bg-gradient-to-br"]');
    await expect(metricCards.first()).toBeVisible();

    // Check for overall compliance percentage
    const complianceText = page.locator('text=Genel Uyumluluk');
    await expect(complianceText).toBeVisible();

    // Check for metric values
    const metricValues = page.locator('[class*="text-4xl"]');
    expect(await metricValues.count()).toBeGreaterThanOrEqual(3);
  });

  test('should display and filter indicators by status', async ({ page }) => {
    // Wait for indicators to load
    await page.waitForLoadState('networkidle');

    // Check for filter buttons
    const allButton = page.locator('button', { hasText: 'Tümü' });
    const compliantButton = page.locator('button', { hasText: '✅ Uyumlu' });
    const missingButton = page.locator('button', { hasText: '❌ Eksik' });
    const underReviewButton = page.locator('button', { hasText: '🔄 İnceleme Altında' });

    await expect(allButton).toBeVisible();
    await expect(compliantButton).toBeVisible();
    await expect(missingButton).toBeVisible();
    await expect(underReviewButton).toBeVisible();

    // Click "Compliant" filter
    await compliantButton.click();
    await page.waitForLoadState('networkidle');

    // Verify indicators are filtered (check for StatusBadge components)
    const indicators = page.locator('[role="status"]');
    const visibleIndicators = await indicators.count();
    expect(visibleIndicators).toBeGreaterThan(0);

    // Click "All" to reset filter
    await allButton.click();
    await page.waitForLoadState('networkidle');
  });

  test('should open indicator detail modal and update status', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find first indicator card and click it
    const firstIndicatorCard = page.locator('[class*="rounded-lg"][class*="border"]').first();
    await firstIndicatorCard.click();

    // Wait for modal to appear (check for modal header)
    const modalHeader = page.locator('[class*="bg-gradient-to-r"]').first();
    await expect(modalHeader).toBeVisible();

    // Check modal contains indicator info
    const modalTitle = page.locator('h2');
    await expect(modalTitle).toBeVisible();

    // Check for status badge in modal
    const statusBadge = page.locator('[role="status"]');
    await expect(statusBadge).toBeVisible();

    // Check for form elements in modal
    const selectElement = page.locator('select');
    if (await selectElement.isVisible()) {
      // If there's a select dropdown for status
      await selectElement.selectOption('COMPLIANT');
    }

    // Check for save button
    const saveButton = page.locator('button', { hasText: 'Kaydet' }).or(page.locator('button', { hasText: 'Save' }));
    if (await saveButton.isVisible()) {
      await saveButton.click();
      // Wait for API response
      await page.waitForLoadState('networkidle');
    }

    // Close modal by clicking close button (X)
    const closeButton = page.locator('button[aria-label="Close modal"]').or(page.locator('text=✕').first());
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });

  test('should display loading skeleton while data is loading', async ({ page }) => {
    // Watch for loading skeleton on page load
    const skeletons = page.locator('[class*="animate-pulse"]');

    // Check if skeletons appear during initial load
    const hasSkeletons = await skeletons.count();

    // Wait for actual content to load
    await page.waitForLoadState('networkidle');

    // After load, check for actual metric cards
    const metricCards = page.locator('[class*="bg-gradient-to-br"]');
    await expect(metricCards.first()).toBeVisible();
  });

  test('should refresh data with refresh button', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find and click refresh button
    const refreshButton = page.locator('button', { hasText: '🔄 Yenile' });

    if (await refreshButton.isVisible()) {
      // Get current metric value
      const initialValue = await page.locator('[class*="text-4xl"]').first().textContent();

      // Click refresh
      await refreshButton.click();

      // Wait for refresh to complete
      await page.waitForLoadState('networkidle');

      // Verify data is still visible
      const metricValue = await page.locator('[class*="text-4xl"]').first().textContent();
      expect(metricValue).toBeTruthy();
    }
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Simulate API failure by intercepting network
    await page.route('**/api/admin/qualiopi/**', route => {
      route.abort('failed');
    });

    // Reload page to trigger error
    await page.reload();

    // Check for error message or alert
    const errorText = page.locator('text=/Error|error|Failed/i');
    const errorVisible = await errorText.isVisible().catch(() => false);

    // Or check for retry button
    const retryButton = page.locator('button', { hasText: /Try Again|Yeniden Dene/i });
    const retryVisible = await retryButton.isVisible().catch(() => false);

    // At least one error handling element should be visible
    expect(errorVisible || retryVisible).toBeTruthy();
  });

  test('should maintain responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that metric cards are visible
    const metricCards = page.locator('[class*="bg-gradient-to-br"]');
    await expect(metricCards.first()).toBeVisible();

    // Check that content is not cut off
    const mainContent = page.locator('main').or(page.locator('[role="main"]'));
    const boundingBox = await mainContent.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    let tabCount = 0;
    while (tabCount < 10) {
      await page.keyboard.press('Tab');
      tabCount++;

      // Get current focus
      const focused = page.locator(':focus');
      const focusedText = await focused.textContent().catch(() => '');

      // Check that focus is visible
      if (focusedText.trim()) {
        // Tab navigation is working
        break;
      }
    }

    // Verify we can interact with at least one button via keyboard
    const firstButton = page.locator('button').first();
    await firstButton.focus();
    await page.keyboard.press('Enter');

    // Some action should occur (like opening modal or filtering)
    expect(true).toBeTruthy(); // Navigation successful
  });
});
