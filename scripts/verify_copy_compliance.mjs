import fs from 'fs';
import path from 'path';

const forbiddenMarketingRegexes = [
  { name: 'Mundra Port', pattern: /\bmundra\b/i },
  { name: 'Hazira Port', pattern: /\bhazira\b/i },
  { name: 'Pipavav Port', pattern: /\bpipavav\b/i },
  { name: 'JNPT Port', pattern: /\bjnpt\b/i },
  { name: 'Surat-based marketing', pattern: /\bsurat[\s-]based\b/i },
  { name: 'NABL accreditation claims', pattern: /\bnabl\b/i },
  { name: 'SGS inspection claims', pattern: /\bsgs\b/i },
  { name: 'Bureau Veritas claims', pattern: /\bbureau\s+veritas\b/i },
  { name: 'Intertek claims', pattern: /\bintertek\b/i },
  { name: 'Sortex claims', pattern: /\bsortex\b/i },
  { name: 'Phytosanitary claims', pattern: /\bphytosanitary\b/i },
  { name: 'Fumigation claims', pattern: /\bfumigation\b/i },
  { name: 'Clean on board', pattern: /\bclean\s+on\s+board\b/i },
  { name: 'ICEGATE', pattern: /\bicegate\b/i }
];

const publicDirs = [
  'client/src/pages',
  'client/src/components',
  'client/src/data'
];

let totalHits = 0;
const results = [];

for (const dir of publicDirs) {
  function scanDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          for (const rule of forbiddenMarketingRegexes) {
            if (rule.pattern.test(line)) {
              totalHits++;
              results.push({
                file: fullPath,
                line: index + 1,
                rule: rule.name,
                text: line.trim()
              });
            }
          }
        });
      }
    }
  }
  scanDir(dir);
}

console.log(`\n=== Public Site Forbidden Marketing Terms Audit ===`);
console.log(`Total Violations Found: ${totalHits}`);
if (totalHits > 0) {
  console.table(results);
  process.exit(1);
} else {
  console.log(`✓ 100% CLEAN: Zero forbidden marketing terms found across public pages, components, and data!`);
}
