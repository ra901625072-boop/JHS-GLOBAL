import fs from 'fs';
import http from 'http';
import app from '../server/src/app.js';
import connectDB, { disconnectDB } from '../server/src/config/db.js';
import '../server/src/models/index.js';

const PORT = 5056;

async function run() {
  console.log('Connecting DB and launching server for API contract recording...');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const endpoints = [
    { name: 'health', method: 'GET', path: '/api/v1/health' },
    { name: 'categories_list', method: 'GET', path: '/api/v1/categories' },
    { name: 'category_detail', method: 'GET', path: '/api/v1/categories/personal-care-raw-materials' },
    { name: 'products_list', method: 'GET', path: '/api/v1/products' },
    { name: 'products_featured', method: 'GET', path: '/api/v1/products/featured' },
    { name: 'product_detail', method: 'GET', path: '/api/v1/products/castor-oil' },
    { name: 'product_related', method: 'GET', path: '/api/v1/products/castor-oil/related' },
    { name: 'search_suggest', method: 'GET', path: '/api/v1/search/suggest?q=oil' },
    { name: 'certificates_list', method: 'GET', path: '/api/v1/certificates' },
    { name: 'testimonials_list', method: 'GET', path: '/api/v1/testimonials' },
    { name: 'market_regions_list', method: 'GET', path: '/api/v1/market-regions' },
    { name: 'faqs_list', method: 'GET', path: '/api/v1/faqs' },
    { name: 'blog_list', method: 'GET', path: '/api/v1/blog' },
    { name: 'company_facts', method: 'GET', path: '/api/v1/company-facts' },
    {
      name: 'inquiry_validation_error',
      method: 'POST',
      path: '/api/v1/inquiries',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
    {
      name: 'sample_validation_error',
      method: 'POST',
      path: '/api/v1/samples',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
    {
      name: 'auth_unauthorized_dashboard',
      method: 'GET',
      path: '/api/v1/admin/dashboard',
    },
  ];

  const contracts = {};

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}${ep.path}`, {
        method: ep.method,
        headers: ep.headers || {},
        body: ep.body || undefined,
      });

      const bodyText = await res.text();
      let bodyJson = null;
      try {
        bodyJson = JSON.parse(bodyText);
      } catch {
        bodyJson = bodyText;
      }

      contracts[ep.name] = {
        endpoint: `${ep.method} ${ep.path}`,
        statusCode: res.status,
        contentType: res.headers.get('content-type'),
        responseShape: typeof bodyJson === 'object' && bodyJson !== null ? Object.keys(bodyJson) : typeof bodyJson,
        sampleResponse: bodyJson,
      };
    } catch (err) {
      contracts[ep.name] = { error: err.message };
    }
  }

  const targetDir = 'baselines/proof-of-no-change/api-contracts';
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  fs.writeFileSync(
    `${targetDir}/api-contracts.json`,
    JSON.stringify({ timestamp: new Date().toISOString(), contracts }, null, 2)
  );
  console.log('Successfully recorded baselines/proof-of-no-change/api-contracts/api-contracts.json');

  server.close();
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('API contract recording failed:', err);
  process.exit(1);
});
