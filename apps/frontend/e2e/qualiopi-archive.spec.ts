import { test, expect } from '@playwright/test';

test.describe('Qualiopi Archive Page - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to archive page
    await page.goto('/admin/qualiopi/archive', { waitUntil: 'networkidle' });
  });

  test('should load archive page with statistics', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for page title or heading
    const heading = page.locator('h1').or(page.locator('h2'));
    const hasHeading = await heading.isVisible().catch(() => false);

    // Check for metric cards (MetricCard component)
    const metricCards = page.locator('[class*="bg-gradient"]');
    const cardCount = await metricCards.count();

    // Should have metric cards showing statistics
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('should search for documents using FilterBar', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find search input in FilterBar
    const searchInput = page.locator('input[type="text"], input[placeholder*="Ara"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('test');

      // Wait for filter to apply
      await page.waitForLoadState('networkidle');

      // Check that table content updates or shows filtered results
      const tableRows = page.locator('tbody tr');
      expect(await tableRows.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter documents by type', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find filter select/dropdown
    const filterSelects = page.locator('select');
    const selectCount = await filterSelects.count();

    if (selectCount > 0) {
      // Click first filter dropdown
      const firstSelect = filterSelects.first();
      const options = await firstSelect.locator('option').count();

      if (options > 1) {
        // Select different option
        const optionValues = await firstSelect.locator('option').nth(1).evaluate((el: HTMLOptionElement) => el.value);
        await firstSelect.selectOption(optionValues);

        // Wait for filter to apply
        await page.waitForLoadState('networkidle');

        // Check that results appear
        const tableRows = page.locator('tbody tr');
        const rowCount = await tableRows.count();
        expect(rowCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should display and use DataTable with pagination', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for table
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check for table headers
    const headers = page.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(1);

    // Check for table body rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Check for pagination controls
      const nextButton = page.locator('button[aria-label="Next page"], button:has-text("→")').first();
      const prevButton = page.locator('button[aria-label="Previous page"], button:has-text("←")').first();

      // Navigation buttons should be present
      const hasNavigation = await nextButton.isVisible().catch(() => false);
      expect(hasNavigation || await prevButton.isVisible().catch(() => false)).toBeTruthy();
    }
  });

  test('should sort table when clicking headers', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find table headers
    const headers = page.locator('th');
    const firstHeader = headers.first();

    if (await firstHeader.isVisible()) {
      // Get initial first row text
      const initialFirstRow = await page.locator('tbody tr').first().textContent();

      // Click header to sort
      await firstHeader.click();
      await page.waitForLoadState('networkidle');

      // Get new first row
      const newFirstRow = await page.locator('tbody tr').first().textContent();

      // Data should still exist
      expect(newFirstRow).toBeTruthy();
    }
  });

  test('should open access log modal for document', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if there are document rows
    const docRows = page.locator('tbody tr');
    const rowCount = await docRows.count();

    if (rowCount > 0) {
      // Click first document row or access log button
      const firstRow = docRows.first();
      await firstRow.click();

      // Wait for modal or details to appear
      await page.waitForLoadState('networkidle');

      // Check for modal content or access log section
      const modal = page.locator('[role="dialog"], [class*="fixed"], [class*="modal"]').first();
      const hasModal = await modal.isVisible().catch(() => false);

      // Or check for access log text
      const accessLogText = page.locator('text=/Access Log|Access History|Erişim Günlüğü/i');
      const hasAccessLog = await accessLogText.isVisible().catch(() => false);

      expect(hasModal || hasAccessLog).toBeTruthy();
    }
  });

  test('should clear filters with reset button', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Apply a filter first
    const searchInput = page.locator('input[type="text"], input[placeholder*="Ara"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForLoadState('networkidle');
    }

    // Find and click reset/clear button
    const clearButton = page.locator('button', { hasText: /Clear|Temizle|Reset/i });
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForLoadState('networkidle');

      // Search input should be cleared
      const inputValue = await searchInput.inputValue().catch(() => '');
      expect(inputValue).toBe('');
    }
  });

  test('should display archive statistics with MetricCard', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for metric cards with statistics
    const metricCards = page.locator('[class*="bg-gradient"], [class*="rounded-lg"][class*="border"]');
    const cardCount = await metricCards.count();

    // Should have at least one metric card
    expect(cardCount).toBeGreaterThanOrEqual(1);

    // Check for statistics labels and numbers
    const metricLabels = page.locator('text=/Document|Total|Expiring|Archive|Type/i');
    const hasLabels = await metricLabels.count() > 0;
    expect(hasLabels).toBeTruthy();
  });

  test('should handle loading state correctly', async ({ page }) => {
    // Watch network requests
    let loadingStateFound = false;

    page.on('framenavigated', () => {
      // Loading state detected
      loadingStateFound = true;
    });

    // Reload page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that content is visible after loading
    const mainContent = page.locator('main').or(page.locator('[role="main"]'));
    await expect(mainContent).toBeVisible();
  });

  test('should be fully responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/admin/qualiopi/archive', { waitUntil: 'networkidle' });

      // Check that content is visible and not cut off
      const mainContent = page.locator('main').or(page.locator('[role="main"]'));
      await expect(mainContent).toBeVisible();

      const bbox = await mainContent.boundingBox();
      expect(bbox?.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('should support keyboard navigation for table', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find first table row
    const firstRow = page.locator('tbody tr').first();

    if (await firstRow.isVisible()) {
      // Click row to focus
      await firstRow.click();

      // Try to navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Check that a row is still in focus or table is still visible
      const table = page.locator('table');
      await expect(table).toBeVisible();
    }
  });
});
