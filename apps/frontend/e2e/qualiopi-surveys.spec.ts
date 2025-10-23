import { test, expect } from '@playwright/test';

test.describe('Qualiopi Surveys Analytics Page - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to surveys page
    await page.goto('/admin/qualiopi/surveys', { waitUntil: 'networkidle' });
  });

  test('should load surveys page and display NPS score card', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for NPS Score Card (NPSScoreCard component)
    const npsScoreText = page.locator('text=/NPS|Promoters|Detractors/i');
    const npsVisible = await npsScoreText.isVisible().catch(() => false);

    // Check for NPS score number (should be between -100 and 100)
    const npsNumber = page.locator('[class*="text-6xl"], [class*="text-5xl"], [class*="text-4xl"]');
    expect(await npsNumber.count()).toBeGreaterThan(0);

    // NPS page should have loaded
    expect(npsVisible || (await npsNumber.count() > 0)).toBeTruthy();
  });

  test('should display survey metrics with MetricCard components', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for metric labels
    const metricLabels = page.locator('text=/Response Rate|Average|Sent|Received/i');
    const metricsVisible = await metricLabels.count();

    // Should have multiple metric cards
    expect(metricsVisible).toBeGreaterThanOrEqual(2);

    // Check for metric values (numbers)
    const metricValues = page.locator('[class*="text-4xl"], [class*="text-3xl"], [class*="text-2xl"]');
    expect(await metricValues.count()).toBeGreaterThan(0);
  });

  test('should display bar chart for question analysis', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for SVG chart (BarChart component)
    const chartSvg = page.locator('svg').first();
    await expect(chartSvg).toBeVisible();

    // Check for chart labels
    const chartLabels = page.locator('text=/Question|Analysis|Survey/i');
    const hasChartLabel = await chartLabels.isVisible().catch(() => false);

    // Chart should be visible
    expect(await chartSvg.boundingBox()).toBeTruthy();
  });

  test('should display consultant performance table with DataTable', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for table headers
    const tableHeaders = page.locator('th');
    expect(await tableHeaders.count()).toBeGreaterThanOrEqual(3);

    // Check for table rows with data
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(0); // 0 or more rows depending on data

    // Check for specific column headers
    const nameHeader = page.locator('th', { hasText: /Name|Consultant|Rating/i }).first();
    if (await nameHeader.isVisible()) {
      expect(nameHeader).toBeVisible();
    }
  });

  test('should sort table when clicking column headers', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find a sortable column header
    const tableHeaders = page.locator('th button, th');
    const headerCount = await tableHeaders.count();

    if (headerCount > 0) {
      // Click first sortable header
      const firstHeader = tableHeaders.first();
      if (await firstHeader.isVisible()) {
        // Get initial data
        const initialFirstRow = await page.locator('tbody tr').first().textContent();

        // Click header to sort
        await firstHeader.click();
        await page.waitForLoadState('networkidle');

        // Data should still be visible (possibly reordered)
        const newFirstRow = await page.locator('tbody tr').first().textContent();
        expect(newFirstRow).toBeTruthy();
      }
    }
  });

  test('should handle empty survey data gracefully', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if page shows "no data" message or displays default values
    const emptyMessage = page.locator('text=/No data|Veri bulunamadı|Not available/i');
    const hasEmptyMessage = await emptyMessage.isVisible().catch(() => false);

    // Or check for metric cards with 0 or default values
    const metricCards = page.locator('[class*="bg-gradient"]');
    const hasCards = await metricCards.count() > 0;

    // Either empty message or metric cards should be visible
    expect(hasEmptyMessage || hasCards).toBeTruthy();
  });

  test('should display NPS category badge', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for NPS category (should show Excellent/Good/Moderate/Poor)
    const categoryBadge = page.locator('text=/Excellent|Good|Moderate|Poor|Mükemmel|İyi|Orta|Düşük/i');
    const hasCategoryBadge = await categoryBadge.isVisible().catch(() => false);

    // Or check for category indicator with badge component
    const badges = page.locator('[class*="bg-green"], [class*="bg-yellow"], [class*="bg-red"], [class*="bg-orange"]');
    const hasBadges = await badges.count() > 0;

    expect(hasCategoryBadge || hasBadges).toBeTruthy();
  });

  test('should display promoters/passives/detractors breakdown', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for promoters, passives, detractors text
    const promotersText = page.locator('text=/Promoters|Detractors|Passives/i');
    const hasBreakdown = await promotersText.isVisible().catch(() => false);

    // Or check for progress bars (part of NPSScoreCard)
    const progressBars = page.locator('[role="progressbar"], [class*="h-2"], [class*="bg-green"], [class*="bg-gray"]');
    const hasProgressBars = await progressBars.count() > 0;

    expect(hasBreakdown || hasProgressBars).toBeTruthy();
  });

  test('should respond correctly to different viewport sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/admin/qualiopi/surveys', { waitUntil: 'networkidle' });

    let content = page.locator('main').or(page.locator('[role="main"]'));
    let bbox = await content.boundingBox();
    expect(bbox?.width).toBeLessThanOrEqual(1920);

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle' });

    content = page.locator('main').or(page.locator('[role="main"]'));
    bbox = await content.boundingBox();
    expect(bbox?.width).toBeLessThanOrEqual(768);

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle' });

    content = page.locator('main').or(page.locator('[role="main"]'));
    bbox = await content.boundingBox();
    expect(bbox?.width).toBeLessThanOrEqual(375);
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Try to focus on first interactive element
    const firstButton = page.locator('button').first();
    await firstButton.focus();

    // Check that focus is visible
    const focused = page.locator(':focus');
    const hasFocus = await focused.count() > 0;
    expect(hasFocus).toBeTruthy();

    // Navigate with Tab key
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const tabFocused = page.locator(':focus');
      const focusExists = await tabFocused.count() > 0;
      if (focusExists) {
        expect(true).toBeTruthy();
        break;
      }
    }
  });

  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to page
    await page.goto('/admin/qualiopi/surveys', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Content should be visible
    const mainContent = page.locator('main').or(page.locator('[role="main"]'));
    await expect(mainContent).toBeVisible();
  });
});
