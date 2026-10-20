import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];

const ADMIN_ROUTES = [
  { slug: 'login', path: '/admin/login', requiresAuth: false },
  { slug: 'dashboard', path: '/admin', requiresAuth: true },
  { slug: 'sales-desk', path: '/admin/sales-desk', requiresAuth: true },
  { slug: 'inquiries', path: '/admin/inquiries', requiresAuth: true },
  { slug: 'samples', path: '/admin/samples', requiresAuth: true },
  { slug: 'quotations', path: '/admin/quotations', requiresAuth: true },
  { slug: 'customers', path: '/admin/customers', requiresAuth: true },
  { slug: 'orders', path: '/admin/orders', requiresAuth: true },
  { slug: 'products', path: '/admin/products', requiresAuth: true },
  { slug: 'categories', path: '/admin/categories', requiresAuth: true },
  { slug: 'certificates', path: '/admin/certificates', requiresAuth: true },
  { slug: 'blog', path: '/admin/blog', requiresAuth: true },
  { slug: 'faqs', path: '/admin/faqs', requiresAuth: true },
  { slug: 'company-knowledge', path: '/admin/company-knowledge', requiresAuth: true },
  { slug: 'ai-inquiries', path: '/admin/ai-inquiries', requiresAuth: true },
  { slug: 'users', path: '/admin/users', requiresAuth: true },
  { slug: 'audit-logs', path: '/admin/audit-logs', requiresAuth: true },
  { slug: 'settings', path: '/admin/settings', requiresAuth: true },
];

async function main() {
  const outputBase = path.resolve('baselines', 'admin-before');
  console.log(`Ensuring baseline screenshot dir at: ${outputBase}`);
  fs.mkdirSync(outputBase, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Starting Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const vpDir = path.join(outputBase, vp.name);
    fs.mkdirSync(vpDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // First handle login page
    console.log(`Capturing Login page at ${vp.name}px...`);
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(vpDir, 'login.png'), fullPage: true });

    // Login for authenticated pages
    console.log('Logging in with admin credentials...');
    await page.fill('input[type="email"]', 'admin@exportb2b.com');
    await page.fill('input[type="password"]', 'Admin@Export2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 15000 });
    await page.waitForTimeout(1500);

    for (const route of ADMIN_ROUTES) {
      if (route.slug === 'login') continue;
      console.log(`Capturing [${route.slug}] at ${route.path} (${vp.name}px)...`);
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(vpDir, `${route.slug}.png`), fullPage: true });

        // If on dashboard, also try to screenshot command palette or mobile menu if on 390
        if (route.slug === 'dashboard' && vp.name === '1440') {
          // Open command palette
          await page.keyboard.press('Control+k');
          await page.waitForTimeout(500);
          await page.screenshot({ path: path.join(vpDir, `${route.slug}-command-palette.png`) });
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }

        if (route.slug === 'dashboard' && vp.name === '390') {
          // Open mobile menu
          const menuBtn = page.locator('button[aria-label="Toggle Navigation Menu"]');
          if (await menuBtn.isVisible()) {
            await menuBtn.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(vpDir, `${route.slug}-mobile-menu.png`) });
            await menuBtn.click();
            await page.waitForTimeout(300);
          }
        }
      } catch (err) {
        console.error(`Failed capturing ${route.slug} at ${vp.name}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nAll baseline screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Screenshot capture script failed:', err);
  process.exit(1);
});
