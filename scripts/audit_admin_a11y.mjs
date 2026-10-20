import fs from 'fs';
import path from 'path';
import http from 'http';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PORT = 4173;
const DIST_DIR = path.resolve('client', 'dist');

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
        res.end('Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
}

async function auditAdminA11y() {
  const server = createSpaServer();
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  await context.addInitScript(() => {
    window.sessionStorage.setItem('admin_token', 'mock_jwt_token_admin');
  });

  const page = await context.newPage();

  // Route mock
  await context.route('**/api/v1/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 1,
          email: 'admin@exportb2b.com',
          name: 'Global Export Administrator',
          role: 'admin',
          stats: { totalRfqs: 142, activeQuotes: 28, dispatchPending: 6, slaBreaches: 0 },
          pipeline: { newInquiries: 14, underReview: 18, quoted: 24, contracted: 9 },
          destinations: [],
          recentDossiers: [],
          expiringCertificates: []
        }
      })
    });
  });

  const routes = ['/admin', '/admin/inquiries', '/admin/products', '/admin/login'];
  let totalCritical = 0;

  for (const r of routes) {
    await page.goto(`http://localhost:${PORT}${r}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const axeResults = await new AxeBuilder({ page }).analyze();
    const critical = axeResults.violations.filter(v => v.impact === 'critical');
    console.log(`[A11y Audit] ${r} -> Violations: ${axeResults.violations.length}, Critical: ${critical.length}`);
    if (critical.length > 0) {
      console.log('Critical violations:', JSON.stringify(critical, null, 2));
      totalCritical += critical.length;
    }
  }

  await browser.close();
  server.close();

  if (totalCritical === 0) {
    console.log('✓ PASS: Zero critical accessibility violations found across admin routes.');
  } else {
    console.error(`✗ FAIL: ${totalCritical} critical accessibility violations found.`);
    process.exit(1);
  }
}

auditAdminA11y().catch(err => {
  console.error(err);
  process.exit(1);
});
