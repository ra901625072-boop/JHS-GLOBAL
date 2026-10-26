import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Product, sequelize } from '../server/src/models/index.js';

const PUBLIC_PRODUCTS_DIR = path.resolve('client', 'public', 'images', 'products');
const SOURCE_PRODUCTS_DIR = path.join(PUBLIC_PRODUCTS_DIR, 'source');

const UPGRADE_ITEMS = [
  {
    slug: 'soya-feed-grain',
    name: 'Soya (Feed Grain / Meal)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Soybean.USDA.jpg',
  },
  {
    slug: 'dehydrated-spinach',
    name: 'Dehydrated Spinach',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Spinach_leaves.jpg',
  },
  {
    slug: 'dehydrated-mango',
    name: 'Dehydrated Mango',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Heap_of_Sun-dried_mango_slices.jpg',
  },
  {
    slug: 'aseptic-fruit-pulp',
    name: 'Aseptic Fruit Pulp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Glass_of_Mango_Juice.jpg',
  },
  {
    slug: 'dehydrated-carrot',
    name: 'Dehydrated Carrot',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Slices_of_carrot.jpg',
  },
  {
    slug: 'dehydrated-potato',
    name: 'Dehydrated Potato',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Dehydrated_shredded_potatoes.jpg',
  },
  {
    slug: 'essential-oils-cosmetic',
    name: 'Essential Oils (Cosmetic Grade)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/94/2_oz_-_60_ml_Amber_Glass_Boston_Round_Bottles_with_Gold_Metal_and_Glass_Droppers.jpg',
  },
  {
    slug: 'vegetable-oils-cosmetic',
    name: 'Vegetable Oils (Cosmetic Grade)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Optical_caustic_Cosmetic_oil_bottle_in_the_sun_mj.jpg',
  },
];

async function processItem(item) {
  console.log(`Upgrading image for: ${item.name} (${item.slug})...`);
  try {
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'JHSGlobalExporterBot/1.0 (info@exportb2b.com; commercial-catalogue-curation)',
      },
    });
    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status} fetching ${item.url}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    const masterPath = path.join(PUBLIC_PRODUCTS_DIR, `${item.slug}.webp`);
    const sourcePath = path.join(SOURCE_PRODUCTS_DIR, `${item.slug}.webp`);

    // Master 800x600 WebP
    await sharp(buffer)
      .resize(800, 600, { fit: 'cover', position: 'center' })
      .webp({ quality: 84 })
      .toFile(masterPath);
    fs.copyFileSync(masterPath, sourcePath);

    // Multi-width responsive versions
    const widths = [176, 380, 640, 800];
    for (const w of widths) {
      const h = Math.round((w * 3) / 4);
      await sharp(buffer)
        .resize(w, h, { fit: 'cover', position: 'center' })
        .webp({ quality: 82 })
        .toFile(path.join(PUBLIC_PRODUCTS_DIR, `${item.slug}-${w}w.webp`));

      await sharp(buffer)
        .resize(w, h, { fit: 'cover', position: 'center' })
        .avif({ quality: 78 })
        .toFile(path.join(PUBLIC_PRODUCTS_DIR, `${item.slug}-${w}w.avif`));
    }

    console.log(`  ✓ Master 800x600 + responsive WebP/AVIF created`);
    return true;
  } catch (err) {
    console.error(`  ✗ Error upgrading ${item.name}:`, err.message);
    return false;
  }
}

async function run() {
  await sequelize.authenticate();
  console.log('PostgreSQL connected.\nStarting Studio Quality Upgrades (8 items)...');

  let successCount = 0;
  for (const item of UPGRADE_ITEMS) {
    const ok = await processItem(item);
    if (ok) {
      const p = await Product.findOne({ where: { slug: item.slug } });
      if (p) {
        await p.update({
          images: [
            {
              url: `/images/products/${item.slug}.webp`,
              alt: `${item.name} commercial raw material export consignment`,
              is_primary: true,
              width: 800,
              height: 600,
              disclaimer: 'Illustrative commercial raw material image. Replace with verified batch photography - TODO(client)',
            },
          ],
        });
        console.log(`  ✓ Database updated for ${item.name}\n`);
        successCount++;
      }
    }
  }

  console.log(`========================================`);
  console.log(`QUALITY UPGRADES COMPLETE: ${successCount} of ${UPGRADE_ITEMS.length} successful`);
  console.log(`========================================`);
  await sequelize.close();
}

run().catch(console.error);
