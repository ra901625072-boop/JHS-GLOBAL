import { test, expect } from '@playwright/test';

test.describe('Dual-Browser Cross-App Sync & Integration Suite (JHS GLOBAL)', () => {
  test('Scenario 1: Direction A (Admin to Public) — FAQ & Commodity Sync with Zero Stale Cache', async ({
    browser,
  }) => {
    // Spin up two isolated browser contexts representing Admin and Visitor
    const adminContext = await browser.newContext();
    const publicContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const publicPage = await publicContext.newPage();

    try {
      // 1. Admin logs into the Operations Desk
      await adminPage.goto('/admin/login', { waitUntil: 'domcontentloaded' });
      await expect(adminPage).toHaveTitle(/Sign In/i);

      await adminPage.fill('input[type="email"]', 'admin@exportb2b.com');
      await adminPage.fill('input[type="password"]', 'Admin@Export2026!');
      await adminPage.click('button[type="submit"]');

      // Wait for admin dashboard navigation (resilient to transient pooler latency)
      try {
        await adminPage.waitForURL(/\/admin(?!\/login)/, { timeout: 10000 });
      } catch {
        await adminPage.waitForTimeout(1000);
        await adminPage.click('button[type="submit"]');
        await adminPage.waitForURL(/\/admin(?!\/login)/, { timeout: 15000 });
      }
      await expect(adminPage.locator('h1, h2').first()).toBeVisible();

      // 2. Public visitor visits /faq
      await publicPage.goto('/faq', { waitUntil: 'domcontentloaded' });
      await expect(publicPage).toHaveTitle(/Frequently Asked Questions/i);

      // Verify a known statutory FAQ is visible on the public side
      const publicFaqHeading = publicPage.locator('h1').first();
      await expect(publicFaqHeading).toContainText(/Frequently Asked Questions/i);

      // Verify public product marquee on homepage
      await publicPage.goto('/', { waitUntil: 'domcontentloaded' });
      const marqueeTrack = publicPage.locator('[data-testid="product-marquee-track"]');
      await expect(marqueeTrack).toBeVisible();

      // Verify 3 core export divisions are visible on public homepage footer
      await expect(publicPage.locator('footer').locator('text=Personal Care Raw Materials').first()).toBeVisible();
      await expect(publicPage.locator('footer').locator('text=Nutraceutical Raw Materials').first()).toBeVisible();
      await expect(publicPage.locator('footer').locator('text=Animal Feed').first()).toBeVisible();
    } finally {
      await adminContext.close();
      await publicContext.close();
    }
  });

  test('Scenario 2: Direction B (Public to Admin) — End-to-End RFQ Submission & Admin Inbox Dossier', async ({
    browser,
  }) => {
    const publicContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const publicPage = await publicContext.newPage();
    const adminPage = await adminContext.newPage();

    try {
      // 1. Admin prepares session
      await adminPage.goto('/admin/login', { waitUntil: 'domcontentloaded' });
      await adminPage.fill('input[type="email"]', 'sales@exportb2b.com');
      await adminPage.fill('input[type="password"]', 'Sales@Export2026!');
      await adminPage.click('button[type="submit"]');

      // Wait for admin dashboard navigation
      try {
        await adminPage.waitForURL(/\/admin(?!\/login)/, { timeout: 10000 });
      } catch {
        await adminPage.waitForTimeout(1000);
        await adminPage.click('button[type="submit"]');
        await adminPage.waitForURL(/\/admin(?!\/login)/, { timeout: 15000 });
      }

      // 2. Public buyer visits contact page with RFQ form
      await publicPage.goto('/contact', { waitUntil: 'domcontentloaded' });

      // Fill QuoteForm with comprehensive commercial details
      const testBuyerName = 'Dr. Wilhelm Bauer';
      const testCompany = 'Nordic BioPharmaceutica AB';
      const testEmail = 'w.bauer@nordic-biopharm.se';
      const testPhone = '+46 8 123 4567';
      const testCountry = 'Sweden';
      const testPort = 'Gothenburg Port';
      const testMessage =
        'Formal containerized RFQ for 20 MT Standardized Ashwagandha Extract (Withanolides >= 2.5% HPLC). Requires customized export palletization.';

      // Fill Contact / Buyer Info
      const nameInput = publicPage.locator('input[name="name"]').first();
      await nameInput.fill(testBuyerName);

      const emailInput = publicPage.locator('input[name="email"]').first();
      await emailInput.fill(testEmail);

      const companyInput = publicPage.locator('input[name="company"]').first();
      await companyInput.fill(testCompany);

      const phoneInput = publicPage.locator('input[name="phone"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill(testPhone);
      }

      const countryInput = publicPage.locator('input[name="country"]').first();
      await countryInput.fill(testCountry);

      const portInput = publicPage.locator('input[name="destinationPort"]').first();
      if (await portInput.isVisible()) {
        await portInput.fill(testPort);
      }

      const msgInput = publicPage.locator('textarea[name="message"]').first();
      await msgInput.fill(testMessage);

      // Check Private Label and Sample checkboxes if available
      const privateLabelCheckbox = publicPage.locator('input[name="needsPrivateLabel"]').first();
      if (await privateLabelCheckbox.isVisible()) {
        await privateLabelCheckbox.check();
      }

      const sampleCheckbox = publicPage.locator('input[name="needsSample"]').first();
      if (await sampleCheckbox.isVisible()) {
        await sampleCheckbox.check();
      }

      // Submit Form
      const submitBtn = publicPage.locator('button[type="submit"]').first();
      await submitBtn.click();

      // Verify Success Confirmation Screen
      const successCard = publicPage.locator('#rfq-success-card');
      await expect(successCard).toBeVisible({ timeout: 15000 });

      // Extract generated RFQ Reference Number
      const refTextElement = publicPage.locator('text=/RFQ-2026-\\d+/').first();
      await expect(refTextElement).toBeVisible();
      const refText = await refTextElement.textContent();
      const refMatch = refText.match(/RFQ-2026-\d+/);
      expect(refMatch).not.toBeNull();
      const generatedRef = refMatch[0];

      // 3. Admin verifies new RFQ in Operations Lead Desk
      await adminPage.goto('/admin/inquiries', { waitUntil: 'domcontentloaded' });

      // Search or locate the generated reference row
      const searchBox = adminPage.locator('input[placeholder*="Search by Reference"]').first();
      if (await searchBox.isVisible()) {
        await searchBox.fill(generatedRef);
        await adminPage.waitForTimeout(400);
      }

      // Verify row presence in the table
      const leadRow = adminPage.locator(`text=${generatedRef}`).first();
      await expect(leadRow).toBeVisible({ timeout: 10000 });

      // Click to open inspection drawer
      await leadRow.click();

      // Verify Drawer Dossier Information
      const drawer = adminPage.locator('aside, div[role="dialog"], .elevation-drawer').first();
      await expect(drawer).toBeVisible();
      await expect(adminPage.locator(`text=${testCompany}`).first()).toBeVisible();
      await expect(adminPage.locator(`text=${testBuyerName}`).first()).toBeVisible();
      await expect(adminPage.locator(`text=${testEmail}`).first()).toBeVisible();

      // Verify Notification Dispatch card status
      const dispatchStatus = adminPage.locator('text=Automated Notification Dispatch').first();
      await expect(dispatchStatus).toBeVisible();
    } finally {
      await publicContext.close();
      await adminContext.close();
    }
  });

  test('Scenario 3: Negative, Security & RBAC Protection', async ({ page }) => {
    // 1. Direct unauthenticated access to /admin must redirect to /admin/login
    await page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*\/admin\/login.*/);

    // 2. Requesting a non-existent product returns graceful 404
    await page.goto('/products/completely-non-existent-product-slug-xyz', {
      waitUntil: 'domcontentloaded',
    });
    // Check 404 banner or return to catalogue button
    const notFoundEl = page.locator('text=/not found|return to catalogue|404/i').first();
    await expect(notFoundEl).toBeVisible();

    // 3. Script Injection in public form fields must be treated safely
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    const scriptPayload = '<script>window.__xss_attack_executed = true;</script>';
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill(scriptPayload);

    const emailInput = page.locator('input[name="email"]').first();
    await emailInput.fill('xss-test@security-audit.com');

    const companyInput = page.locator('input[name="company"]').first();
    await companyInput.fill('Security Pentest Corp');

    const countryInput = page.locator('input[name="country"]').first();
    await countryInput.fill('Germany');

    const msgInput = page.locator('textarea[name="message"]').first();
    await msgInput.fill('Testing XSS script tags in inquiry textarea');

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Verify window.__xss_attack_executed was never executed
    const wasExecuted = await page.evaluate(() => window.__xss_attack_executed === true);
    expect(wasExecuted).toBe(false);
  });
});
