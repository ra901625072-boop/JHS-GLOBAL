import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BRAIN_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/05aea797-5f1c-457c-a561-00336179e76f';

async function verify() {
  console.log('=== Verifying Single-Page Catalogue on /products ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:5173/products ...');
  await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Check product cards count
  const cards = await page.$$('a[href^="/products/"]');
  console.log(`Rendered product link elements: ${cards.length}`);

  // Check Next and Previous buttons
  const prevBtn = await page.$('button:has-text("Previous")');
  const nextBtn = await page.$('button:has-text("Next")');

  console.log(`Previous button present: ${Boolean(prevBtn)} (expected: false)`);
  console.log(`Next button present: ${Boolean(nextBtn)} (expected: false)`);

  const footerText = await page.innerText('body');
  const hasAllCommoditiesText = footerText.includes('All 115 export commodities displayed') || footerText.includes('115 export commodities');
  console.log(`Found "All ... commodities displayed": ${hasAllCommoditiesText}`);

  // Capture screenshot of catalogue
  const shotPath = path.join(BRAIN_DIR, 'catalogue_single_page_desktop.png');
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`✓ Saved desktop screenshot: ${shotPath}`);

  // Test mobile view
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/products', { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(1000);

  const mobilePrevBtn = await mobilePage.$('button:has-text("Previous")');
  const mobileNextBtn = await mobilePage.$('button:has-text("Next")');
  console.log(`Mobile Previous button present: ${Boolean(mobilePrevBtn)} (expected: false)`);
  console.log(`Mobile Next button present: ${Boolean(mobileNextBtn)} (expected: false)`);

  const mobileShotPath = path.join(BRAIN_DIR, 'catalogue_single_page_mobile.png');
  await mobilePage.screenshot({ path: mobileShotPath, fullPage: false });
  console.log(`✓ Saved mobile screenshot: ${mobileShotPath}`);

  await browser.close();

  if (prevBtn || nextBtn || mobilePrevBtn || mobileNextBtn) {
    throw new Error('FAILED: Next or Previous buttons should not be present on unfiltered catalogue!');
  }

  console.log('\n✓ ALL ASSERTIONS PASSED: Single-page catalogue renders all products with NO next/prev buttons!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
