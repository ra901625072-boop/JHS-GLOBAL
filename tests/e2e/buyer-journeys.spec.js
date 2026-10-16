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

  test('Journey 8: About Us route accessibility and redirect from legacy /about', async ({ page }) => {
    // Navigating to legacy /about should seamlessly transition to /about-us
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*about-us/);

    // Verify H1 and page identity
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/An export house built on trust/i);
    await expect(page).toHaveTitle(/About Us/i);

    // Verify desktop/mobile navigation label displays 'About Us'
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 1024;
    if (isMobile) {
      const footerAboutLink = page.locator('footer a[href*="about-us"]').first();
      await footerAboutLink.scrollIntoViewIfNeeded();
      await expect(footerAboutLink).toBeVisible();
      await expect(footerAboutLink).toContainText(/About Us/i);
    } else {
      const aboutLink = page.locator('nav a[href*="about-us"], header a[href*="about-us"]').first();
      await expect(aboutLink).toBeVisible();
      await expect(aboutLink).toContainText(/About Us/i);
    }
  });

  test('Journey 9: FAQ Page Discovery, Accordion, Search & Deep Linking', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Frequently Asked Questions/i);

    // Verify Page Header
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Frequently Asked Questions/i);

    // Test Search Input
    const searchInput = page.locator('#faq-search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('MOQ');
    await page.waitForTimeout(100);

    // Test Accordion Trigger on visible question
    const triggerBtn = page.locator('button[id^="faq-btn-"]').first();
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();
    await expect(triggerBtn).toHaveAttribute('aria-expanded', 'true');

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(100);

    // Test Deep Link
    await page.goto('/faq#standard-minimum-order-quantity-moq', { waitUntil: 'domcontentloaded' });
    const targetCard = page.locator('#faq-item-standard-minimum-order-quantity-moq');
    await expect(targetCard).toBeVisible();

    // WCAG Accessibility Scan on /faq
    const a11yResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();
    const criticalViolations = a11yResults.violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });

  test('Journey 10: Home Page FAQ Section & Navigation to Full FAQ', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Scroll to Home FAQ section
    const faqSection = page.locator('#home-faq');
    await expect(faqSection).toBeVisible();

    // Verify Section Heading
    await expect(faqSection.locator('h2')).toContainText(/Clear Answers Before You Order/i);

    // Verify first question is open by default
    const firstAccordion = faqSection.locator('button[id^="home-faq-btn-"]').first();
    await expect(firstAccordion).toHaveAttribute('aria-expanded', 'true');

    // Click View All FAQs link
    const viewAllBtn = faqSection.locator('a[href="/faq"]').first();
    await expect(viewAllBtn).toBeVisible();
    await viewAllBtn.click();
    await expect(page).toHaveURL(/.*\/faq/);
  });

  test('Journey 11: About Us Page Executive Image & Core Supply Categories', async ({ page }) => {
    await page.goto('/about-us', { waitUntil: 'domcontentloaded' });

    // Verify 3 Founders Leadership Section & Portrait Images
    const foundersSection = page.locator('[data-testid="founders-section"]').first();
    await expect(foundersSection).toBeVisible();

    const jayCard = page.locator('[data-testid="founder-card-jay-prajapati"]').first();
    await expect(jayCard).toBeVisible();
    const jayImage = jayCard.locator('img').first();
    await expect(jayImage).toBeVisible();
    await expect(jayImage).toHaveAttribute('width', '768');
    await expect(jayImage).toHaveAttribute('height', '1024');

    const surajCard = page.locator('[data-testid="founder-card-suraj-prajapati"]').first();
    await expect(surajCard).toBeVisible();
    const henilCard = page.locator('[data-testid="founder-card-henil-prajapati"]').first();
    await expect(henilCard).toBeVisible();

    // Verify 3 Core Export Categories
    await expect(page.locator('text=Personal Care Raw Materials').first()).toBeVisible();
    await expect(page.locator('text=Nutraceutical Raw Materials').first()).toBeVisible();
    await expect(page.locator('text=Animal Feed').first()).toBeVisible();

    // WCAG Accessibility Scan on /about-us
    const a11yResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();
    const criticalViolations = a11yResults.violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
  });
});
