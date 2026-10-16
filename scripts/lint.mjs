import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('=== Running Static Analysis & Code Linting ===');

let hasError = false;

// 1. Check JS syntax across server/src
console.log('\n[1/3] Checking server module syntax with node --check...');
function getJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsFiles(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(fullPath);
    }
  }
  return results;
}

const serverFiles = getJsFiles(path.resolve('server', 'src'));
let checkedCount = 0;
for (const file of serverFiles) {
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
    checkedCount++;
  } catch (err) {
    console.error(`Syntax error in ${file}:`, err.message);
    hasError = true;
  }
}
console.log(`✓ Checked ${checkedCount} server source files. All syntax valid.`);

// 2. Run Name & Brand Consistency Linter
console.log('\n[2/3] Checking Brand & Founder Name Consistency...');
try {
  execSync('node scripts/verify_name_consistency.mjs', { stdio: 'inherit' });
} catch {
  hasError = true;
}

// 3. Check for leftover developer TODO(client) markers in client & server source
console.log('\n[3/3] Checking for unhandled developer placeholder markers...');
const forbiddenMarkers = [
  { pattern: /TODO\(client:/i, label: 'Unresolved client TODO placeholder' }
];

function scanDirForMarkers(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === 'dist' || item === 'build' || item.startsWith('.')) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirForMarkers(fullPath);
    } else if (/\.(js|jsx|json|html|css)$/.test(item)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      forbiddenMarkers.forEach(({ pattern, label }) => {
        if (pattern.test(content)) {
          console.error(`[LINT VIOLATION] ${label} found in ${path.relative(process.cwd(), fullPath)}`);
          hasError = true;
        }
      });
    }
  }
}

scanDirForMarkers(path.resolve('client', 'src'));
scanDirForMarkers(path.resolve('server', 'src'));

if (hasError) {
  console.error('\n❌ Linting failed with errors.');
  process.exit(1);
} else {
  console.log('✓ All code quality & placeholder scans passed cleanly!');
  console.log('\n=== Static Analysis & Code Linting Complete: 0 ERRORS ===');
}
