import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

const ADMIN_ROUTES = [
  '/admin',
  '/admin/sales-desk',
  '/admin/inquiries',
  '/admin/samples',
  '/admin/quotations',
  '/admin/customers',
  '/admin/orders',
  '/admin/products',
  '/admin/categories',
  '/admin/certificates',
  '/admin/blog',
  '/admin/faqs',
  '/admin/company-knowledge',
  '/admin/ai-inquiries',
  '/admin/users',
  '/admin/audit-logs',
  '/admin/settings',
];

async function runDiagnostics() {
  console.log('Launching browser for Admin diagnostics...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (err) => {
    errors.push({ type: 'pageerror', url: page.url(), message: err.message, stack: err.stack });
    console.error(`[PAGEERROR] at ${page.url()}:`, err.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({ type: 'console.error', url: page.url(), message: msg.text() });
      console.error(`[CONSOLE ERROR] at ${page.url()}:`, msg.text());
    }
  });

  try {
    console.log(`1. Navigating to login page: ${BASE_URL}/admin/login`);
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    console.log('2. Submitting login credentials...');
    await page.fill('input[type="email"]', 'admin@exportb2b.com');
    await page.fill('input[type="password"]', 'Admin@Export2026!');
    await page.click('button[type="submit"]');

    // Wait for redirect to /admin
    await page.waitForURL('**/admin', { timeout: 15000 });
    console.log('Successfully logged in! Current URL:', page.url());

    // Give layout 1.5s to render completely
    await page.waitForTimeout(1500);

    const report = [];

    for (const route of ADMIN_ROUTES) {
      const targetUrl = `${BASE_URL}${route}`;
      console.log(`\nTesting route: ${route}`);
      const beforeErrorsCount = errors.length;

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000); // Wait for React lazy components and data fetching

      // Check DOM for error boundary message
      const bodyText = await page.innerText('body');
      const hasErrorText =
        bodyText.includes('Unexpected Application Error!') ||
        bodyText.includes('ReferenceError') ||
        bodyText.includes('is not defined');

      const newErrors = errors.slice(beforeErrorsCount);

      if (hasErrorText || newErrors.length > 0) {
        console.log(`❌ ERROR DETECTED ON ${route}!`);
        report.push({
          route,
          status: 'ERROR',
          errorText: hasErrorText ? bodyText.slice(0, 500) : null,
          newErrors,
        });
      } else {
        console.log(`✅ ${route} rendered smoothly with 0 errors`);
        report.push({
          route,
          status: 'OK',
        });
      }
    }

    console.log('\n========================================');
    console.log('ADMIN DIAGNOSTIC SUMMARY REPORT');
    console.log('========================================');
    console.log(JSON.stringify(report, null, 2));

    if (errors.length > 0) {
      console.log('\nAll captured errors:');
      console.log(JSON.stringify(errors, null, 2));
    }
  } catch (err) {
    console.error('Diagnostic script exception:', err);
  } finally {
    await browser.close();
  }
}

runDiagnostics();
