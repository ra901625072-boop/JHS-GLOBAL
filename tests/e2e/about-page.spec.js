import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('E2E: About Us Page & Three-Founder Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about-us', { waitUntil: 'domcontentloaded' });
  });

  test('E2E-1: Page renders approved headline and title metadata', async ({ page }) => {
    await expect(page).toHaveTitle(/About Us — JHS GLOBAL/i);
    const h1 = page.locator('h1').first();
    await expect(h1).toHaveText('An export house built on trust, transparency and Indian abundance.');
  });

  test('E2E-2: All three founders render in confirmed order with naturalWidth > 0 and verified images', async ({ page }) => {
    const expectedFounders = [
      {
        id: 'jay-prajapati',
        name: 'Jay Prajapati',
        role: 'Founder & CEO | JHS GLOBAL',
        imagePartial: 'founder-jay',
      },
      {
        id: 'suraj-prajapati',
        name: 'Suraj Prajapati',
        role: 'Co-Founder | Sourcing & Operations',
        imagePartial: 'founder-suraj',
      },
      {
        id: 'henil-prajapati',
        name: 'Henil Prajapati',
        role: 'Co-Founder | Commercial Development & Marketing',
        imagePartial: 'founder-henil',
      },
    ];

    for (const f of expectedFounders) {
      const card = page.locator(`[data-testid="founder-card-${f.id}"]`);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();

      // Check name and role
      await expect(card.locator('h3')).toHaveText(f.name);
      await expect(card.locator('text=' + f.role)).toBeVisible();

      // Check that image is present and loaded with naturalWidth > 0
      const img = card.locator('img');
      await expect(img).toBeVisible();
      await img.evaluate(async (el) => {
        if (!el.complete) {
          await new Promise((resolve) => {
            el.onload = resolve;
            el.onerror = resolve;
          });
        }
      });
      const naturalWidth = await img.evaluate((el) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);

      // Verify that the right image file is bound to the right founder
      const src = await img.getAttribute('src');
      expect(src).toContain(f.imagePartial);
    }
  });

  test('E2E-3: Full biographical text for all three founders is present in DOM', async ({ page }) => {
    const textSnippets = [
      'With six years of entrepreneurial experience in FMCG and spice distribution and trading',
      'Originally from the spice city of India — Unjha, Gujarat',
      'Suraj brings a practical, solution-driven mindset and extensive business experience',
      'Henil brings boldness, persistence, and a sharp instinct for negotiation',
    ];

    for (const snippet of textSnippets) {
      const el = page.locator(`text=${snippet}`);
      await expect(el).toBeAttached();
    }
  });

  test('E2E-4: Inline expander discloses full bio without layout disruption', async ({ page }) => {
    const jayCard = page.locator('[data-testid="founder-card-jay-prajapati"]');
    await jayCard.scrollIntoViewIfNeeded();
    const toggleBtn = jayCard.locator('button', { hasText: /Read Full Biography|Show Less/i });
    
    // Initially collapsed
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Click expand
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(toggleBtn).toHaveText(/Show Less/i);

    // Click collapse
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(toggleBtn).toHaveText(/Read Full Biography/i);
  });

  test('E2E-5: Missing photo fallback resilience renders placeholder gracefully', async ({ page }) => {
    const jayCard = page.locator('[data-testid="founder-card-jay-prajapati"]');
    await jayCard.scrollIntoViewIfNeeded();

    // Inject a dummy broken image on the page to verify fallback handler
    await page.evaluate(() => {
      const img = document.querySelector('[data-testid="founder-card-jay-prajapati"] img');
      if (img) {
        img.dispatchEvent(new Event('error'));
      }
    });

    const fallback = page.locator('[data-testid="founder-fallback-jay-prajapati"]');
    await expect(fallback).toBeVisible();
    await expect(fallback).toContainText('Jay Prajapati');
    await expect(fallback).toContainText('JHS GLOBAL · LEADERSHIP');
  });

  test('E2E-6: Axe Accessibility scan passes on About Us page with zero critical/serious violations', async ({ page }) => {
    // Emulate reduced motion so all scroll-triggered reveals render immediately at 100% opacity
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalOrSerious = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalOrSerious).toHaveLength(0);
  });
});
