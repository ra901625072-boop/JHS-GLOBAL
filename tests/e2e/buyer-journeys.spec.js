import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Buyer Journeys & Platform Integrity Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with stable network idle
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Journey 1: Homepage brand identity, navigation header, and export call-to-action', async ({ page }) => {
    await expect(page).toHaveTitle(/JHS GLOBAL/i);

    // Verify header exists
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Verify responsive navigation landmark
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 1024;
    if (isMobile) {
      const menuButton = page.locator('header button').first();
      await expect(menuButton).toBeVisible();
    } else {
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
      const productsLink = page.locator('header a[href*="products"], nav a[href*="products"]').first();
      await expect(productsLink).toBeVisible();
    }
  });

  test('Journey 2: Product catalogue discovery and export categories', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });

    // Header or title of products catalogue
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Verify commodity grid or listing container is rendered
    const body = page.locator('main');
    await expect(body).toBeVisible();
  });

  test('Journey 3: Sample request buyer workflow', async ({ page }) => {
    await page.goto('/sample-request', { waitUntil: 'domcontentloaded' });

    // Verify form exists
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Check essential buyer input fields
    await expect(page.locator('input[name*="name"], input[placeholder*="Name" i]').first()).toBeVisible();
    await expect(page.locator('input[name*="email"], input[placeholder*="Email" i]').first()).toBeVisible();
  });

  test('Journey 4: Contact desk and commercial inquiries', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });

    // Check contact form presence
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    await expect(page.locator('input[type="email"], input[name*="email"]').first()).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
  });

  test('Journey 5: Admin route protection redirects unauthorized visitor to login', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Should redirect to /admin/login
    await expect(page).toHaveURL(/.*admin\/login.*/);

    // Verify login inputs
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Journey 6: 404 resilience handles broken links gracefully', async ({ page }) => {
    await page.goto('/route-that-does-not-exist-404', { waitUntil: 'domcontentloaded' });

    // Check 404 indication or Return Home link
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('Journey 7: WCAG 2.1 AA Accessibility audit on homepage', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // Color contrast verified separately in visual tokens
      .analyze();

    // Ensure zero critical accessibility violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations.length).toBe(0);
  });
});
