import fs from 'fs';
import path from 'path';
import http from 'http';
import app from '../server/src/app.js';
import connectDB, { disconnectDB } from '../server/src/config/db.js';
import '../server/src/models/index.js';

const PORT = 5056;

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function run() {
  console.log('Connecting to DB for API optimization profiling...');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Optimization profiling API server running on port ${port}`);

  const endpoints = [
    { method: 'GET', path: '/api/v1/health' },
    { method: 'GET', path: '/api/v1/categories' },
    { method: 'GET', path: '/api/v1/products' },
    { method: 'GET', path: '/api/v1/products?limit=12&page=1' },
    { method: 'GET', path: '/api/v1/products/featured' },
    { method: 'GET', path: '/api/v1/certificates' },
    { method: 'GET', path: '/api/v1/testimonials' },
    { method: 'GET', path: '/api/v1/market-regions' },
    { method: 'GET', path: '/api/v1/faqs' },
  ];

  const results = [];
  const baselinePayloads = JSON.parse(fs.readFileSync('baselines/api/payload-sizes.json', 'utf8'));

  for (const ep of endpoints) {
    const latencies = [];
    let compressedSizeBytes = 0;
    let cacheStatus = 'NONE';
    const iterations = 15;

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      await new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: 'localhost',
            port: port,
            path: ep.path,
            method: ep.method,
            headers: {
              'Accept-Encoding': 'gzip, deflate',
            },
          },
          (res) => {
            const chunks = [];
            cacheStatus = res.headers['x-cache'] || 'NONE';
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
              latencies.push(performance.now() - t0);
              compressedSizeBytes = Buffer.concat(chunks).length;
              resolve();
            });
          }
        );
        req.on('error', reject);
        req.end();
      });
    }

    const baselineEntry = (baselinePayloads.endpoints || []).find((b) => b.endpoint === `${ep.method} ${ep.path}`);
    const originalSize = baselineEntry ? baselineEntry.payloadSizeBytes : compressedSizeBytes;

    results.push({
      endpoint: ep.path,
      method: ep.method,
      originalSizeBytes: originalSize,
      compressedSizeBytes,
      bytesSavedRatio: `${(((originalSize - compressedSizeBytes) / originalSize) * 100).toFixed(1)}%`,
      p50LatencyMs: Number(percentile(latencies, 50).toFixed(2)),
      p95LatencyMs: Number(percentile(latencies, 95).toFixed(2)),
      cacheStatus,
    });
  }

  server.close();
  await disconnectDB();

  console.log('\n=== API Optimization Results ===');
  console.table(results);

  fs.writeFileSync(
    'baselines/api/optimization-comparison.json',
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );
  console.log('Saved comparison to baselines/api/optimization-comparison.json');
}

run().catch(console.error);
