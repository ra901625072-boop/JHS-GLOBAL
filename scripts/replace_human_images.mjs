import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const PUBLIC_PRODUCTS_DIR = path.resolve('client', 'public', 'images', 'products');
const SOURCE_PRODUCTS_DIR = path.join(PUBLIC_PRODUCTS_DIR, 'source');

const REPLACEMENTS = [
  {
    slug: 'ir64-non-basmati-rice',
    name: 'IR64 Non-Basmati Rice',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Mushqbudji_rice_grains_close-up.jpg'
  },
  {
    slug: 'green-chilli-fresh',
    name: 'Fresh Green Chilli',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Green_Chili.jpg'
  },
  {
    slug: 'curry-powder',
    name: 'Curry Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Curry-spice.jpg'
  },
  {
    slug: 'fennel-seeds',
    name: 'Fennel Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Foeniculum_vulgare_MHNT.BOT.2005.0.1058.jpg'
  }
];

const USER_AGENT = 'JHSGlobalExporterBot/1.0 (info@exportb2b.com; commercial-catalogue-curation)';

async function downloadAndProcess(item) {
  console.log(`\nProcessing replacement for: ${item.slug} (${item.name})`);
  console.log(`URL: ${item.url}`);

  const cleanUrl = item.url.split('?')[0];
  const res = await fetch(cleanUrl, {
    headers: { 'User-Agent': USER_AGENT }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${cleanUrl}: HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // 1. Save uncompressed source
  const sourcePath = path.join(SOURCE_PRODUCTS_DIR, `${item.slug}.webp`);
  await sharp(inputBuffer).webp({ quality: 90 }).toFile(sourcePath);

  // 2. Master 800x600 WebP
  const masterPath = path.join(PUBLIC_PRODUCTS_DIR, `${item.slug}.webp`);
  await sharp(inputBuffer)
    .resize(800, 600, { fit: 'cover', position: 'center' })
    .webp({ quality: 84 })
    .toFile(masterPath);

  // 3. Responsive variants
  const SIZES = [
    { w: 176, h: 132 },
    { w: 380, h: 285 },
    { w: 640, h: 480 },
    { w: 800, h: 600 }
  ];

  for (const s of SIZES) {
    const webpPath = path.join(PUBLIC_PRODUCTS_DIR, `${item.slug}-${s.w}w.webp`);
    await sharp(inputBuffer)
      .resize(s.w, s.h, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(webpPath);

    const avifPath = path.join(PUBLIC_PRODUCTS_DIR, `${item.slug}-${s.w}w.avif`);
    await sharp(inputBuffer)
      .resize(s.w, s.h, { fit: 'cover', position: 'center' })
      .avif({ quality: 65, effort: 4 })
      .toFile(avifPath);
  }

  console.log(`  ✓ Generated master & responsive WebP/AVIF variants for ${item.slug}`);

  // 4. Update Database
  const imagesPayload = [
    {
      url: `/images/products/${item.slug}.webp`,
      alt: `${item.name} commercial export grade - JHS GLOBAL`,
      width: 800,
      height: 600,
      isHero: true,
      aiGenerated: false,
      disclaimer: 'Commercial raw material photograph. Export quality.'
    }
  ];

  await pool.query(
    'UPDATE products SET images = $1, "updated_at" = NOW() WHERE slug = $2',
    [JSON.stringify(imagesPayload), item.slug]
  );
  console.log(`  ✓ Updated PostgreSQL record for ${item.slug}`);
}

async function run() {
  for (const item of REPLACEMENTS) {
    await downloadAndProcess(item);
  }
  await pool.end();
  console.log('\n=== ALL HUMAN-CONTAINING IMAGES SUCCESSFULLY REPLACED ===\n');
}

run().catch(err => {
  console.error('Fatal error:', err);
  pool.end();
  process.exit(1);
});
