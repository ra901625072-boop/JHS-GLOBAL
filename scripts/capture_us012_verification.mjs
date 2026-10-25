import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('artifacts/verification-screenshots');
const BRAIN_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/05aea797-5f1c-457c-a561-00336179e76f';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const PAGES = [
  { slug: 'home', path: '/' },
  { slug: 'products', path: '/products' },
  { slug: 'category-food', path: '/categories/food-food-ingredients' },
  { slug: 'product-cumin-seeds', path: '/products/cumin-seeds' },
  { slug: 'product-personal-care', path: '/products/castor-oil-ethoxylates' },
  { slug: 'quality', path: '/quality' },
  { slug: 'about', path: '/about' },
  { slug: 'export-process', path: '/export-process' },
  { slug: 'faq', path: '/faq' },
  { slug: 'contact', path: '/contact' },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Capturing ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const p of PAGES) {
      const url = `${BASE_URL}${p.path}`;
      console.log(`Navigating to ${p.slug}: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000); // Allow animations & fonts to settle

        const filename = `${p.slug}_${vp.name}.png`;
        const localPath = path.join(OUTPUT_DIR, filename);
        await page.screenshot({ path: localPath, fullPage: false });

        if (fs.existsSync(BRAIN_DIR)) {
          const brainPath = path.join(BRAIN_DIR, filename);
          fs.copyFileSync(localPath, brainPath);
        }

        results.push({ slug: p.slug, viewport: vp.name, filename });
        console.log(`✓ Saved ${filename}`);
      } catch (err) {
        console.error(`✗ Failed to capture ${p.slug} on ${vp.name}:`, err.message);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log(`\nAll screenshots captured successfully. Total: ${results.length}`);
}

capture().catch((err) => {
  console.error('Fatal screenshot error:', err);
  process.exit(1);
});
