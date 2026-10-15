import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'client', 'dist');
const INDEX_HTML_PATH = path.resolve(DIST_DIR, 'index.html');

console.log('\n======================================================');
console.log('  CI PERFORMANCE BUDGET AUDITOR & GATING ASSERTIONS   ');
console.log('======================================================\n');

if (!fs.existsSync(DIST_DIR) || !fs.existsSync(INDEX_HTML_PATH)) {
  console.error('ERROR: client/dist/index.html does not exist. Run "npm run build:client" first.');
  process.exit(1);
}

// 1. Audit Initial Route JS and CSS by inspecting index.html entry script and modulepreloads
const indexHtmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

// Match script src and modulepreload href
const jsMatches = [
  ...indexHtmlContent.matchAll(/<script[^>]+src=["']\/assets\/([^"']+)["']/g),
  ...indexHtmlContent.matchAll(/<link[^>]+rel=["']modulepreload["'][^>]+href=["']\/assets\/([^"']+)["']/g),
];

const cssMatches = [
  ...indexHtmlContent.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']\/assets\/([^"']+)["']/g),
];

let initialRouteJsBytesGzip = 0;
const loadedJsFiles = [];

for (const match of jsMatches) {
  const fileName = match[1];
  const filePath = path.join(DIST_DIR, 'assets', fileName);
  if (fs.existsSync(filePath)) {
    const rawBuffer = fs.readFileSync(filePath);
    const gzipBuffer = zlib.gzipSync(rawBuffer);
    initialRouteJsBytesGzip += gzipBuffer.length;
    loadedJsFiles.push({
      file: fileName,
      rawKb: (rawBuffer.length / 1024).toFixed(2),
      gzipKb: (gzipBuffer.length / 1024).toFixed(2),
    });
  }
}

let initialRouteCssBytesGzip = 0;
const loadedCssFiles = [];
for (const match of cssMatches) {
  const fileName = match[1];
  const filePath = path.join(DIST_DIR, 'assets', fileName);
  if (fs.existsSync(filePath)) {
    const rawBuffer = fs.readFileSync(filePath);
    const gzipBuffer = zlib.gzipSync(rawBuffer);
    initialRouteCssBytesGzip += gzipBuffer.length;
    loadedCssFiles.push({
      file: fileName,
      rawKb: (rawBuffer.length / 1024).toFixed(2),
      gzipKb: (gzipBuffer.length / 1024).toFixed(2),
    });
  }
}

const initialJsKbGzip = (initialRouteJsBytesGzip / 1024).toFixed(2);
const initialCssKbGzip = (initialRouteCssBytesGzip / 1024).toFixed(2);

// 2. Audit Above-The-Fold image payloads (Commodity Marquee Thumbnails)
const marqueeImages = [
  'client/public/images/products/turmeric-curcumin-extract-176w.avif',
  'client/public/images/products/ashwagandha-extract-176w.avif',
  'client/public/images/products/amla-extract-176w.avif',
  'client/public/images/products/bacopa-monnieri-extract-176w.avif',
  'client/public/images/products/moringa-oleifera-extract-176w.avif',
  'client/public/images/products/pea-protein-isolate-176w.avif',
  'client/public/images/products/cottonseed-meal-176w.avif',
  'client/public/images/products/xanthan-gum-176w.avif',
];

let aboveTheFoldImageBytes = 0;
const loadedImageFiles = [];
for (const imgRel of marqueeImages) {
  const p = path.resolve(ROOT_DIR, imgRel);
  if (fs.existsSync(p)) {
    const sz = fs.statSync(p).size;
    aboveTheFoldImageBytes += sz;
    loadedImageFiles.push({
      file: path.basename(imgRel),
      kb: (sz / 1024).toFixed(2),
    });
  }
}
const aboveTheFoldImageKb = (aboveTheFoldImageBytes / 1024).toFixed(2);

// 3. Define strict CI Performance Budgets
const BUDGETS = {
  initialJsMaxKbGzip: 150.0,
  initialCssMaxKbGzip: 50.0,
  aboveTheFoldImageMaxKb: 150.0,
};

let violations = 0;

console.log(`[CHECK 1] Initial Route JavaScript (gzipped) for Home Route (/):`);
console.log(`          Budget: < ${BUDGETS.initialJsMaxKbGzip} KB | Actual: ${initialJsKbGzip} KB`);
console.table(loadedJsFiles);
if (parseFloat(initialJsKbGzip) > BUDGETS.initialJsMaxKbGzip) {
  console.error(`          ❌ FAILED: Exceeded JS budget by ${(initialJsKbGzip - BUDGETS.initialJsMaxKbGzip).toFixed(2)} KB`);
  violations++;
} else {
  console.log(`          ✅ PASSED: Within budget (Margin: ${(BUDGETS.initialJsMaxKbGzip - initialJsKbGzip).toFixed(2)} KB)`);
}

console.log(`\n[CHECK 2] Critical CSS (gzipped):`);
console.log(`          Budget: < ${BUDGETS.initialCssMaxKbGzip} KB | Actual: ${initialCssKbGzip} KB`);
console.table(loadedCssFiles);
if (parseFloat(initialCssKbGzip) > BUDGETS.initialCssMaxKbGzip) {
  console.error(`          ❌ FAILED: Exceeded CSS budget`);
  violations++;
} else {
  console.log(`          ✅ PASSED: Within budget (Margin: ${(BUDGETS.initialCssMaxKbGzip - initialCssKbGzip).toFixed(2)} KB)`);
}

console.log(`\n[CHECK 3] Above-The-Fold Images Payload (AVIF Variants):`);
console.log(`          Budget: < ${BUDGETS.aboveTheFoldImageMaxKb} KB | Actual: ${aboveTheFoldImageKb} KB`);
console.table(loadedImageFiles);
if (parseFloat(aboveTheFoldImageKb) > BUDGETS.aboveTheFoldImageMaxKb) {
  console.error(`          ❌ FAILED: Exceeded Above-the-fold Image budget`);
  violations++;
} else {
  console.log(`          ✅ PASSED: Within budget (Margin: ${(BUDGETS.aboveTheFoldImageMaxKb - aboveTheFoldImageKb).toFixed(2)} KB)`);
}

console.log('\n------------------------------------------------------');
if (violations > 0) {
  console.error(`❌ CI Performance Budget Gate FAILED with ${violations} violation(s).`);
  process.exit(1);
} else {
  console.log(`🏆 All CI Performance Budgets PASSED! High-speed compliance strictly verified.`);
  process.exit(0);
}
