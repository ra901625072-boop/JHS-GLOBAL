import fs from 'fs';
import path from 'path';
import http from 'http';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PORT = 4173;
const DIST_DIR = path.resolve('client', 'dist');

// Simple SPA static server with HTML5 history fallback
function createSpaServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon',
  };

  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading ' + reqPath);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
}

const VIEWPORTS = [
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'quality', path: '/quality' },
  { name: 'export-process', path: '/export-process' },
  { name: 'contact', path: '/contact' },
  { name: 'about-us', path: '/about-us' },
  { name: 'faq', path: '/faq' },
];

async function run() {
  console.log('Starting SPA static preview server on port ' + PORT);
  const server = createSpaServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log('Server started. Launching Playwright browser...');

  const browser = await chromium.launch({ headless: true });
  const domSnapshots = {};
  const a11ySnapshots = {};

  const baseDir = 'baselines/proof-of-no-change/visual-regression';
  const domDir = 'baselines/proof-of-no-change/dom-snapshots';

  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  if (!fs.existsSync(domDir)) fs.mkdirSync(domDir, { recursive: true });

  for (const vp of VIEWPORTS) {
    const vpDir = `${baseDir}/${vp.name}`;
    if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir, { recursive: true });

    console.log(`\n--- Capturing Viewport: ${vp.name}px (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      console.log(`  Visiting ${route.name} (${route.path})...`);
      await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'networkidle' });
      // Allow GSAP and Lenis to settle
      await page.waitForTimeout(500);

      // Screenshot loaded state
      await page.screenshot({
        path: `${vpDir}/${route.name}-loaded.png`,
        fullPage: true,
      });

      // Capture DOM and A11y structure once per route (at 1440px)
      if (vp.name === '1440') {
        const title = await page.title();
        const headings = await page.$$eval('h1, h2, h3', (elements) =>
          elements.map((el) => ({
            tag: el.tagName.toLowerCase(),
            text: el.innerText.trim(),
            ariaHidden: el.getAttribute('aria-hidden'),
          }))
        );
        const landmarks = await page.$$eval('header, nav, main, footer, [role]', (elements) =>
          elements.map((el) => ({
            tag: el.tagName.toLowerCase(),
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
          }))
        );

        domSnapshots[route.name] = {
          title,
          headings,
          landmarks: landmarks.slice(0, 20), // Top 20 landmark indicators
        };

        try {
          const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();
          a11ySnapshots[route.name] = {
            violationsCount: axeResults.violations.length,
            violations: axeResults.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              description: v.description,
              nodesCount: v.nodes.length,
            })),
          };
        } catch (axeErr) {
          a11ySnapshots[route.name] = { error: axeErr.message };
        }
      }
    }

    // Capture RFQ Drawer Open state on Home
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    // Click basket or trigger quote drawer if available
    const basketTrigger = page.locator('button[aria-label*="Quote"], button[aria-label*="Basket"], header button:has(.lucide-shopping-bag)').first();
    if (await basketTrigger.count() > 0) {
      await basketTrigger.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `${vpDir}/home-open-drawer.png`,
        fullPage: false,
      });
    }

    // Capture Mobile Menu Open state on mobile viewports (<1024px)
    if (vp.width < 1024) {
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      const menuTrigger = page.locator('button[aria-label*="Menu"], header button:has(.lucide-menu)').first();
      if (await menuTrigger.count() > 0) {
        await menuTrigger.click();
        await page.waitForTimeout(400);
        await page.screenshot({
          path: `${vpDir}/home-open-menu.png`,
          fullPage: false,
        });
      }
    }

    await context.close();
  }

  // Capture Reduced-Motion Mode snapshot at 1440px
  console.log('\n--- Capturing Reduced Motion Snapshot (1440px) ---');
  const reducedMotionContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const rmPage = await reducedMotionContext.newPage();
  await rmPage.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(200);
  await rmPage.screenshot({
    path: `${baseDir}/1440/home-reduced-motion.png`,
    fullPage: true,
  });
  await reducedMotionContext.close();

  // Save DOM and A11y baseline
  fs.writeFileSync(
    `${domDir}/dom-a11y-baseline.json`,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        domSnapshots,
        a11ySnapshots,
      },
      null,
      2
    )
  );

  console.log('\nSuccessfully saved visual regression images and DOM/A11y baseline.');

  await browser.close();
  server.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Visual regression error:', err);
  process.exit(1);
});
