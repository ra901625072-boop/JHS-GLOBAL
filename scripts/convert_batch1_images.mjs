import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/05aea797-5f1c-457c-a561-00336179e76f';
const PUBLIC_PRODUCTS_DIR = path.resolve('client', 'public', 'images', 'products');
const SOURCE_PRODUCTS_DIR = path.join(PUBLIC_PRODUCTS_DIR, 'source');

const BATCH1_MAPPINGS = [
  { slug: 'cumin-seeds', pattern: /cumin_seeds.*\.jpe?g$/i },
  { slug: 'turmeric-whole-ground', pattern: /turmeric_whole_ground.*\.jpe?g$/i },
  { slug: 'black-pepper', pattern: /black_pepper.*\.jpe?g$/i },
  { slug: 'psyllium-husk-powder', pattern: /psyllium_husk_powder.*\.jpe?g$/i },
  { slug: 'ashwagandha-powder', pattern: /ashwagandha_powder.*\.jpe?g$/i },
  { slug: 'dehydrated-onion', pattern: /dehydrated_onion.*\.jpe?g$/i },
  { slug: 'dehydrated-garlic', pattern: /dehydrated_garlic.*\.jpe?g$/i },
  { slug: '1121-golden-sella-raw-basmati-rice', pattern: /(?:1121_golden_sella|basmati_rice).*\.jpe?g$/i },
  { slug: 'yellow-corn-feed', pattern: /(?:yellow_corn|corn_feed).*\.jpe?g$/i },
  { slug: 'pure-natural-honey', pattern: /(?:pure_natural_honey|honey).*\.jpe?g$/i },
];

async function convert() {
  const artifactFiles = fs.readdirSync(ARTIFACT_DIR);
  console.log(`Scanning artifact directory (${artifactFiles.length} files)...`);

  let convertedCount = 0;

  for (const item of BATCH1_MAPPINGS) {
    // Find matching files in artifact dir, pick newest
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

  console.log(`\nBatch 1 Conversion Summary: ${convertedCount} of ${BATCH1_MAPPINGS.length} converted.`);
  return convertedCount;
}

convert().catch(console.error);
