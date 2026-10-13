const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Measuring client build time and bundle assets...');
const startTime = Date.now();
const buildOutput = execSync('npm run build --workspace=client', { encoding: 'utf-8' });
const clientBuildDurationMs = Date.now() - startTime;

console.log(`Build output captured in ${clientBuildDurationMs}ms`);

// Read dist directory files and sizes
const distDir = path.resolve('client', 'dist');
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push({
        file: path.relative(distDir, fullPath).replace(/\\/g, '/'),
        sizeBytes: stat.size,
        sizeKb: parseFloat((stat.size / 1024).toFixed(2)),
      });
    }
  });
  return results;
}

const files = getFiles(distDir);
const totalSizeBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);

// Dependency audits
let auditSummary = {};
try {
  const auditRaw = execSync('npm audit --json', { encoding: 'utf-8' });
  const auditParsed = JSON.parse(auditRaw);
  auditSummary = auditParsed.metadata || auditParsed;
} catch (e) {
  try {
    const auditParsed = JSON.parse(e.stdout || '{}');
    auditSummary = auditParsed.metadata || auditParsed;
  } catch (err) {
    auditSummary = { error: e.message };
  }
}

const baselineBuild = {
  timestamp: new Date().toISOString(),
  clientBuildDurationMs,
  totalDistSizeBytes: totalSizeBytes,
  totalDistSizeKb: parseFloat((totalSizeBytes / 1024).toFixed(2)),
  assets: files.sort((a, b) => b.sizeBytes - a.sizeBytes),
  auditSummary,
};

if (!fs.existsSync('baselines')) fs.mkdirSync('baselines');
if (!fs.existsSync('baselines/build')) fs.mkdirSync('baselines/build', { recursive: true });

fs.writeFileSync('baselines/build/build-audit.json', JSON.stringify(baselineBuild, null, 2));
console.log('Written baselines/build/build-audit.json successfully.');
