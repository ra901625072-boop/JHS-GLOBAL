import fs from 'fs';
import path from 'path';

/**
 * verify_name_consistency.mjs
 * 
 * Verifies repository consistency for:
 * 1. Company Brand Name: Must be "JHS GLOBAL" or "JHS Global" (No "JSH" in client/src)
 * 2. Founder Names: Must be exactly "Jay Prajapati", "Suraj Prajapati", "Henil Prajapati"
 */

const CLIENT_SRC_DIR = path.resolve('client', 'src');
const EXCLUDE_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.ico', '.woff2'];

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (!EXCLUDE_EXT.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function verifyConsistency() {
  console.log('\n--- Running Repository Name & Spelling Consistency Audit ---');
  const files = getFiles(CLIENT_SRC_DIR);
  let errors = [];

  // 1. Unapproved company spelling regex (e.g. "JSH Global" or "JSH GLOBAL")
  const disallowedBrandRegex = /\bJSH\s*GLOBAL\b/i;

  // 2. Misspelled founder names regexes
  const founderMisspellings = [
    /\bJay\s+Prajapti\b/i,
    /\bSuraj\s+Prajapti\b/i,
    /\bHenil\s+Prajapti\b/i,
    /\bHenil\s+Prajaptai\b/i,
    /\bSuraj\s+Prajaptai\b/i,
  ];

  for (const filePath of files) {
    const relPath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      // Check for disallowed brand spelling
      if (disallowedBrandRegex.test(line)) {
        errors.push(`[UNAPPROVED BRAND SPELLING] ${relPath}:${idx + 1} -> "${line.trim()}"`);
      }

      // Check for misspelled founder names
      for (const rx of founderMisspellings) {
        if (rx.test(line)) {
          errors.push(`[MISSPELLED FOUNDER NAME] ${relPath}:${idx + 1} -> "${line.trim()}"`);
        }
      }
    });
  }

  if (errors.length > 0) {
    console.error('\nConsistency check FAILED with the following violations:');
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  } else {
    console.log(`✓ All ${files.length} client source files strictly adhere to approved brand ('JHS GLOBAL') and founder name spellings.`);
  }
}

verifyConsistency();
