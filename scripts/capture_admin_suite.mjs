import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('jhs-ui-capture');

const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 2 };

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function preparePage(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

async function run() {
  console.log('--- Launching Browser for Admin Capture ---');
  const browser = await chromium.launch({ headless: true });

  // 1. Admin Login View
  const adminLoginDir = path.join(OUTPUT_DIR, '05-admin', 'login');
  await ensureDir(adminLoginDir);

  const loginContext = await browser.newContext({
    viewport: { width: VIEWPORT.width, height: VIEWPORT.height },
    deviceScaleFactor: VIEWPORT.deviceScaleFactor,
  });
  const loginPage = await loginContext.newPage();
  await loginPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  await preparePage(loginPage);

  const loginPath = path.join(adminLoginDir, 'admin-login__desktop__viewport-16-9__auth-card__01.png');
  await loginPage.screenshot({ path: loginPath });
  console.log(`Captured: ${loginPath}`);
  await loginContext.close();

  // 2. Authenticated Admin Views
  const authContext = await browser.newContext({
    viewport: { width: VIEWPORT.width, height: VIEWPORT.height },
    deviceScaleFactor: VIEWPORT.deviceScaleFactor,
  });
  const authPage = await authContext.newPage();

  console.log('Logging in to Admin Suite...');
  await authPage.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  await authPage.locator('input[type="email"]').fill('admin@exportb2b.com');
  await authPage.locator('input[type="password"]').fill('Admin@Export2026!');
  await authPage.locator('button[type="submit"]').click();
  await authPage.waitForURL('**/admin', { timeout: 10000 });
  await authPage.waitForLoadState('networkidle');
  await authPage.waitForTimeout(800);

  const adminViews = [
    { slug: 'dashboard', name: 'Admin Command Dashboard', pathSuffix: '' },
    { slug: 'inquiries', name: 'Inquiry & RFQ Manager', pathSuffix: '/inquiries' },
    { slug: 'samples', name: 'Sample Request Tracker', pathSuffix: '/samples' },
    { slug: 'products', name: 'Product Catalogue Manager', pathSuffix: '/products' },
    { slug: 'categories', name: 'Category Hierarchy Manager', pathSuffix: '/categories' },
    { slug: 'certificates', name: 'Certificates Compliance Suite', pathSuffix: '/certificates' },
    { slug: 'company-knowledge', name: 'Company Knowledge Base (RAG)', pathSuffix: '/company-knowledge' },
    { slug: 'blog', name: 'Blog Editorial CMS', pathSuffix: '/blog' },
    { slug: 'faqs', name: 'Procurement FAQ Manager', pathSuffix: '/faqs' },
    { slug: 'users', name: 'Staff Users & Role Matrix', pathSuffix: '/users' },
    { slug: 'settings', name: 'Global Platform Settings', pathSuffix: '/settings' },
  ];

  for (const admView of adminViews) {
    console.log(`Capturing Admin View: ${admView.name}`);
    const targetUrl = `${BASE_URL}/admin${admView.pathSuffix}`;
    await authPage.goto(targetUrl, { waitUntil: 'networkidle' });
    await preparePage(authPage);

    const admDir = path.join(OUTPUT_DIR, '05-admin', admView.slug);
    await ensureDir(admDir);

    // Fullpage admin view
    const fullAdmPath = path.join(admDir, `admin-${admView.slug}__desktop__fullpage__overview__01.png`);
    await authPage.screenshot({ path: fullAdmPath, fullPage: true });
    console.log(`Captured fullpage: ${fullAdmPath}`);

    // Viewport 16:9
    const vpAdmPath = path.join(admDir, `admin-${admView.slug}__desktop__viewport-16-9__table-header__02.png`);
    await authPage.screenshot({ path: vpAdmPath, fullPage: false });
    console.log(`Captured viewport: ${vpAdmPath}`);
  }

  // 3. Command Palette (Ctrl+K)
  console.log('Capturing Admin Command Palette (Ctrl+K)...');
  await authPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await preparePage(authPage);
  await authPage.keyboard.press('Control+KeyK');
  await authPage.waitForTimeout(600);

  const cmdDir = path.join(OUTPUT_DIR, '05-admin', 'command-palette');
  await ensureDir(cmdDir);

  const cmdPath = path.join(cmdDir, 'admin-command-palette__desktop__state__modal-open__01.png');
  await authPage.screenshot({ path: cmdPath, fullPage: false });
  console.log(`Captured command palette: ${cmdPath}`);

  await authContext.close();
  await browser.close();
  console.log('Admin suite capture complete!');
}

run().catch(err => {
  console.error('Admin capture error:', err);
  process.exit(1);
});
