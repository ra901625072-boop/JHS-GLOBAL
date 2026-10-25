import { chromium } from '@playwright/test';

async function testAdmin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  
  console.log('Navigating to admin/login...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
  console.log('Filling credentials...');
  await page.locator('input[type="email"]').fill('admin@exportb2b.com');
  await page.locator('input[type="password"]').fill('Admin@Export2026!');
  await page.locator('button[type="submit"]').click();
  console.log('Clicked submit. Waiting for URL...');
  await page.waitForURL('**/admin', { timeout: 10000 });
  console.log('Successfully navigated to:', page.url());
  await browser.close();
}

testAdmin().then(() => console.log('Admin test passed')).catch(err => console.error('Admin test failed:', err));
