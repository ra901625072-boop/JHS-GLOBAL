import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const BRAIN_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/05aea797-5f1c-457c-a561-00336179e76f';

const TARGETS = [
  { slug: 'banana-fresh', path: '/products/banana-fresh' },
  { slug: 'dehydrated-banana', path: '/products/dehydrated-banana' },
  { slug: 'red-chilli', path: '/products/red-chilli' },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const t of TARGETS) {
      const url = `${BASE_URL}${t.path}`;
      console.log(`Navigating to ${t.slug} (${vp.name}): ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        const filename = `product-${t.slug}_${vp.name}.png`;
        const brainPath = path.join(BRAIN_DIR, filename);
        await page.screenshot({ path: brainPath, fullPage: false });
        console.log(`✓ Saved screenshot: ${brainPath}`);
      } catch (e) {
        console.error(`✗ Error on ${t.slug}:`, e.message);
      }
    }
    await context.close();
  }

  await browser.close();
}

capture().catch(console.error);
