const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.resolve(__dirname, '..', 'client', 'dist');
const BASELINE_PATH = path.resolve(__dirname, '..', 'baselines', 'build', 'build-audit.json');

console.log('Building client with optimized Rollup code splitting chunks...');
const t0 = Date.now();
execSync('npm run build --workspace=client', { stdio: 'inherit' });
const buildDurationMs = Date.now() - t0;

function getDirectorySize(dirPath) {
  let total = 0;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      total += getDirectorySize(filePath);
    } else {
      total += stat.size;
    }
  }
  return total;
}

const assetsDir = path.join(DIST_DIR, 'assets');
const assetFiles = fs.readdirSync(assetsDir);
const chunks = assetFiles.map((file) => {
  const stat = fs.statSync(path.join(assetsDir, file));
  return {
    file,
    sizeBytes: stat.size,
    sizeKb: Number((stat.size / 1024).toFixed(2)),
  };
}).sort((a, b) => b.sizeBytes - a.sizeBytes);

const distSizeBytes = getDirectorySize(DIST_DIR);

let baselineData = null;
if (fs.existsSync(BASELINE_PATH)) {
  baselineData = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

const comparison = {
  timestamp: new Date().toISOString(),
  buildDurationMs,
  distSizeBytes,
  distSizeKb: Number((distSizeBytes / 1024).toFixed(2)),
  chunks,
  comparison: baselineData ? {
    baselineDurationMs: baselineData.buildDurationMs,
    durationChangeMs: buildDurationMs - baselineData.buildDurationMs,
    baselineDistKb: baselineData.distSizeKb,
    optimizedDistKb: Number((distSizeBytes / 1024).toFixed(2)),
    topChunks: chunks.slice(0, 8),
  } : null,
};

fs.writeFileSync(
  path.resolve(__dirname, '..', 'baselines', 'build', 'optimization-comparison.json'),
  JSON.stringify(comparison, null, 2)
);

console.log('\n=== Build Optimization Comparison ===');
console.log(`Build Duration: ${buildDurationMs} ms (Baseline: ${baselineData ? baselineData.buildDurationMs : 'N/A'} ms)`);
console.log(`Dist Total Size: ${(distSizeBytes / 1024).toFixed(2)} KB`);
console.log('\nTop Chunks:');
console.table(chunks.slice(0, 10));
