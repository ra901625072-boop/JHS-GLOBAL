import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/05aea797-5f1c-457c-a561-00336179e76f';
const PUBLIC_PRODUCTS_DIR = path.resolve('client', 'public', 'images', 'products');
const SOURCE_PRODUCTS_DIR = path.join(PUBLIC_PRODUCTS_DIR, 'source');

const BATCH2_MAPPINGS = [
  { slug: 'banana-fresh', pattern: /banana_fresh.*\.jpe?g$/i },
  { slug: 'dehydrated-banana', pattern: /dehydrated_banana.*\.jpe?g$/i },
  { slug: 'red-chilli', pattern: /red_chilli.*\.jpe?g$/i },
  { slug: 'green-cardamom', pattern: /green_cardamom.*\.jpe?g$/i },
  { slug: 'coriander-seeds', pattern: /coriander_seeds.*\.jpe?g$/i },
  { slug: 'moringa-powder', pattern: /moringa_powder.*\.jpe?g$/i },
  { slug: 'peanuts-groundnuts', pattern: /peanuts_groundnuts.*\.jpe?g$/i },
  { slug: 'mango-fresh', pattern: /mango_fresh.*\.jpe?g$/i },
  { slug: 'chickpeas-split-chickpeas', pattern: /chickpeas_split_chickpeas.*\.jpe?g$/i },
  { slug: 'chia-seeds', pattern: /chia_seeds.*\.jpe?g$/i },
];

async function convert() {
  const artifactFiles = fs.readdirSync(ARTIFACT_DIR);
  console.log(`Scanning artifact directory (${artifactFiles.length} files)...`);

  let convertedCount = 0;

  for (const item of BATCH2_MAPPINGS) {
    const matching = artifactFiles
      .filter((f) => item.pattern.test(f))
      .map((f) => ({
        name: f,
        path: path.join(ARTIFACT_DIR, f),
        mtime: fs.statSync(path.join(ARTIFACT_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (matching.length === 0) {
      console.log(`[WAITING] Image not found yet for slug: ${item.slug}`);
      continue;
    }

    const srcFile = matching[0].path;
    const destSourceWebp = path.join(SOURCE_PRODUCTS_DIR, `${item.slug}.webp`);
    const destPublicWebp = path.join(PUBLIC_PRODUCTS_DIR, `${item.slug}.webp`);

    await sharp(srcFile)
      .resize(800, 600, { fit: 'cover', position: 'centre' })
      .webp({ quality: 84, effort: 6 })
      .toFile(destSourceWebp);

    fs.copyFileSync(destSourceWebp, destPublicWebp);
    console.log(`[CONVERTED] ${item.slug}.webp from ${matching[0].name} (800x600 WebP)`);
    convertedCount++;
  }

  console.log(`\nBatch 2 Conversion Summary: ${convertedCount} of ${BATCH2_MAPPINGS.length} converted.`);
  return convertedCount;
}

convert().catch(console.error);
