import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5173';
const JWT_SECRET = 'dev_jwt_access_secret_export_b2b_super_secure_key_32bytes_min';

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
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

const targetSlug = process.argv[2];

function getAdminToken() {
  return jwt.sign(
    {
      id: 1,
      email: 'admin@exportb2b.com',
      role: 'admin',
      name: 'Global Export Administrator',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

async function main() {
  const outputBase = path.resolve('baselines', 'admin-after');
  console.log(`Ensuring after screenshot dir at: ${outputBase}`);
  fs.mkdirSync(outputBase, { recursive: true });

  const routesToCapture = targetSlug
    ? ADMIN_ROUTES.filter((r) => r.slug === targetSlug)
    : ADMIN_ROUTES;

  if (routesToCapture.length === 0) {
    console.error(`Route slug "${targetSlug}" not found in routes.`);
    process.exit(1);
  }

  const token = getAdminToken();

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

    await context.addInitScript((jwtToken) => {
      window.sessionStorage.setItem('admin_token', jwtToken);
    }, token);

    const page = await context.newPage();

    for (const route of routesToCapture) {
      console.log(`Capturing [${route.slug}] at ${route.path} (${vp.name}px)...`);
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(vpDir, `${route.slug}.png`), fullPage: true });

        if (route.slug === 'dashboard' && vp.name === '390') {
          const menuBtn = page.locator('button[aria-label="Toggle Navigation Menu"]');
          if (await menuBtn.isVisible()) {
            await menuBtn.click();
            await page.waitForTimeout(400);
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
  console.log(`\nScreenshots for [${targetSlug || 'all'}] captured successfully in baselines/admin-after/!`);
}

main().catch((err) => {
  console.error('Screenshot capture script failed:', err);
  process.exit(1);
});
