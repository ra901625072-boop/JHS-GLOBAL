import fs from 'fs';
import path from 'path';
import http from 'http';
import app from '../server/src/app.js';
import connectDB, { disconnectDB } from '../server/src/config/db.js';
// Explicitly import models/index.js so associations are wired
import '../server/src/models/index.js';

const PORT = 5055;

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function run() {
  console.log('Connecting to DB for API baseline measurement...');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test API server running on port ${PORT}`);

  const endpoints = [
    { method: 'GET', path: '/api/v1/health' },
    { method: 'GET', path: '/api/v1/categories' },
    { method: 'GET', path: '/api/v1/categories/personal-care-raw-materials' },
    { method: 'GET', path: '/api/v1/products' },
    { method: 'GET', path: '/api/v1/products?limit=12&page=1' },
    { method: 'GET', path: '/api/v1/products/featured' },
    { method: 'GET', path: '/api/v1/products/castor-oil' },
    { method: 'GET', path: '/api/v1/certificates' },
    { method: 'GET', path: '/api/v1/testimonials' },
    { method: 'GET', path: '/api/v1/market-regions' },
    { method: 'GET', path: '/api/v1/faqs' },
    { method: 'GET', path: '/api/v1/blog' },
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: JSON.stringify({ email: 'sales@exportb2b.com', password: 'Sales@Export2026!' }),
      headers: { 'Content-Type': 'application/json' },
    },
  ];

  const results = [];
  const payloadSizes = [];

  for (const ep of endpoints) {
    console.log(`Profiling ${ep.method} ${ep.path}...`);
    const latencies = [];
    let payloadSizeBytes = 0;
    let statusCode = 200;
    let errors = 0;
    const iterations = 15; // 15 requests to compute realistic p50/p95/p99

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      try {
        const res = await fetch(`http://127.0.0.1:${PORT}${ep.path}`, {
          method: ep.method,
          headers: ep.headers || {},
          body: ep.body || undefined,
        });
        const duration = performance.now() - t0;
        latencies.push(parseFloat(duration.toFixed(2)));
        statusCode = res.status;
        const text = await res.text();
        payloadSizeBytes = Buffer.byteLength(text, 'utf8');
        if (!res.ok && res.status !== 401 && res.status !== 400) {
          errors++;
        }
      } catch (err) {
        errors++;
        latencies.push(parseFloat((performance.now() - t0).toFixed(2)));
      }
    }

    const p50 = percentile(latencies, 50);
    const p95 = percentile(latencies, 95);
    const p99 = percentile(latencies, 99);
    const mean = parseFloat((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2));
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);

    results.push({
      endpoint: `${ep.method} ${ep.path}`,
      statusCode,
      samples: iterations,
      errorRate: `${((errors / iterations) * 100).toFixed(1)}%`,
      latencyMs: { min, max, mean, p50, p95, p99 },
      payloadSizeBytes,
      payloadSizeKb: parseFloat((payloadSizeBytes / 1024).toFixed(2)),
    });

    payloadSizes.push({
      endpoint: `${ep.method} ${ep.path}`,
      statusCode,
      payloadSizeBytes,
      payloadSizeKb: parseFloat((payloadSizeBytes / 1024).toFixed(2)),
    });
  }

  if (!fs.existsSync('baselines/api')) fs.mkdirSync('baselines/api', { recursive: true });

  fs.writeFileSync('baselines/api/latency-profiles.json', JSON.stringify({ timestamp: new Date().toISOString(), endpoints: results }, null, 2));
  fs.writeFileSync('baselines/api/payload-sizes.json', JSON.stringify({ timestamp: new Date().toISOString(), endpoints: payloadSizes }, null, 2));

  console.log('Successfully recorded baselines/api/latency-profiles.json and payload-sizes.json');

  server.close();
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('Profiling error:', err);
  process.exit(1);
});
