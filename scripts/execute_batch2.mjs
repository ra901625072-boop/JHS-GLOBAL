import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Product, sequelize } from '../server/src/models/index.js';

const PUBLIC_PRODUCTS_DIR = path.resolve('client', 'public', 'images', 'products');
const SOURCE_PRODUCTS_DIR = path.join(PUBLIC_PRODUCTS_DIR, 'source');

if (!fs.existsSync(SOURCE_PRODUCTS_DIR)) {
  fs.mkdirSync(SOURCE_PRODUCTS_DIR, { recursive: true });
}

const BATCH_2_ITEMS = [
  {
    slug: 'dehydrated-lemon',
    name: 'Dehydrated Lemon',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Dried_lemon_slices_%2820240122%29.jpg',
  },
  {
    slug: 'dehydrated-mango',
    name: 'Dehydrated Mango',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Dry_Mango_Slices_%28Mango_Orugulu%29.jpg',
  },
  {
    slug: 'dehydrated-pineapple',
    name: 'Dehydrated Pineapple',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Delicious_Dried_Pineapple.jpg',
  },
  {
    slug: 'dehydrated-strawberry',
    name: 'Dehydrated Strawberry',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Freeze-dried_strawberries.jpg',
  },
  {
    slug: 'dehydrated-tomato',
    name: 'Dehydrated Tomato',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Sun-dried_tomatoes.jpg',
  },
  {
    slug: 'dehydrated-ginger',
    name: 'Dehydrated Ginger',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dry_Ginger_1.jpg',
  },
  {
    slug: 'dehydrated-beetroot',
    name: 'Dehydrated Beetroot',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Dried_beetroot.jpg',
  },
  {
    slug: 'dehydrated-carrot',
    name: 'Dehydrated Carrot',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Joint_venture_dehydrated_dried_vegetables.jpg',
  },
  {
    slug: 'dehydrated-potato',
    name: 'Dehydrated Potato',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Potato_-_dehydrated_and_sliced.jpg',
  },
  {
    slug: 'dehydrated-spinach',
    name: 'Dehydrated Spinach',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Dried_Spinach_Dealer_%285324594514%29.jpg',
  },
  {
    slug: 'fried-crispy-onion',
    name: 'Fried Crispy Onion',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Bawang_Goreng.jpg',
  },
  {
    slug: 'jaggery',
    name: 'Jaggery (Cane Sugar / Blocks / Powder)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Sa-indian-gud.jpg',
  },
  {
    slug: 'makhana-fox-nuts',
    name: 'Makhana (Fox Nuts)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Makhana_%28Foxnut%29_roasted_with_masala_and_ghee.jpg',
  },
  {
    slug: 'millets-sorghum-ragi-pearl',
    name: 'Millets (Sorghum, Ragi, Pearl Millet)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Ragi_%28Eleusine_coracana%29_BNC.jpg',
  },
  {
    slug: 'quinoa',
    name: 'Quinoa',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Quinoa_closeup.jpg',
  },
  {
    slug: 'gram-flour-besan',
    name: 'Gram Flour (Besan)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Gram_flour_AvL.jpg',
  },
  {
    slug: 'refined-wheat-flour-maida',
    name: 'Refined Wheat Flour (Maida)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Maida_flour.jpg',
  },
  {
    slug: 'rice-flour',
    name: 'Rice Flour',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Rice_flour.jpg',
  },
  {
    slug: 'wheat-flour-atta',
    name: 'Wheat Flour (Atta)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Atta_flour.jpg',
  },
  {
    slug: 'sesame-seeds',
    name: 'Sesame Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Sa_white_sesame_seeds.jpg',
  },
  {
    slug: 'watermelon-seeds',
    name: 'Watermelon Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Roasted_watermelon_seeds_1.jpg',
  },
  {
    slug: 'basil-seeds',
    name: 'Basil Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Basilseeds.jpg',
  },
  {
    slug: 'coconut-husked-desiccated',
    name: 'Husked Coconut / Desiccated Coconut',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Coconuts_-_single_and_cracked_open.jpg',
  },
  {
    slug: 'pusa-basmati-rice',
    name: 'Pusa Basmati Rice',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Grano_de_arroz_basmati_integral%2C_2020-06-12%2C_DD_01-11_FS.jpg',
  },
  {
    slug: 'ir64-non-basmati-rice',
    name: 'IR64 Non-Basmati Rice',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Rice_processing_in_South_East_Nigeria18.jpg',
  },
  {
    slug: 'non-basmati-rice',
    name: 'Non-Basmati Rice',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Raw_rice_%28white%29.jpg',
  },
];

async function processItem(item) {
  console.log(`Processing: ${item.name} (${item.slug})...`);
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
    console.error(`  ✗ Error processing ${item.name}:`, err.message);
    return false;
  }
}

async function run() {
  await sequelize.authenticate();
  console.log('PostgreSQL connected.\nStarting Batch 2 execution (26 items)...');

  let successCount = 0;
  for (const item of BATCH_2_ITEMS) {
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
  console.log(`BATCH 2 INGESTION COMPLETE: ${successCount} of ${BATCH_2_ITEMS.length} successful`);
  console.log(`========================================`);
  await sequelize.close();
}

run().catch(console.error);
