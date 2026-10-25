import { chromium } from '@playwright/test';
import path from 'path';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('jhs-ui-capture');

async function fixAiChat() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  console.log('Navigating to home...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Click AI Trigger button
  const aiTrigger = page.locator('button[aria-label*="Trade Assistant"]').first();
  await aiTrigger.click();
  await page.waitForTimeout(800);

  // Find real chat dialog
  const chatDialog = page.locator('div[role="dialog"][aria-label="Export Intelligence Assistant"]').first();
  const destPath = path.join(OUTPUT_DIR, '02-elements', 'ai-chat', 'ai-chat__desktop__state__dialogue-open__02.png');
  
  await chatDialog.screenshot({ path: destPath });
  const meta = await sharp(destPath).metadata();
  console.log(`Captured real chat dialog: ${destPath} (${meta.width}x${meta.height})`);

  // Also copy to video folder
  const videoDest = path.join(OUTPUT_DIR, 'video', '02-ui-micro-interactions', 'cut-06__ai-trade-assistant__ground-truth-dialogue.png');
  await chatDialog.screenshot({ path: videoDest });
  console.log(`Updated video asset: ${videoDest}`);

  await browser.close();
}

fixAiChat().catch(console.error);
