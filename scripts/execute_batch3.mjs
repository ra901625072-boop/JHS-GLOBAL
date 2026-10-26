import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Product, sequelize } from '../server/src/models/index.js';

const PUBLIC_PRODUCTS_DIR = path.resolve('client', 'public', 'images', 'products');
const SOURCE_PRODUCTS_DIR = path.join(PUBLIC_PRODUCTS_DIR, 'source');

if (!fs.existsSync(SOURCE_PRODUCTS_DIR)) {
  fs.mkdirSync(SOURCE_PRODUCTS_DIR, { recursive: true });
}

const BATCH_3_ITEMS = [
  {
    slug: 'rose-petal-powder',
    name: 'Rose Petal Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Dry_Rose_Petals.jpg',
  },
  {
    slug: 'chamomile-powder',
    name: 'Chamomile Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Chamomillae_romanae_flos_dried.jpg',
  },
  {
    slug: 'hibiscus-powder',
    name: 'Hibiscus Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Bissap.jpg',
  },
  {
    slug: 'moringa-powder',
    name: 'Moringa Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Moringa_leaves_powder.jpg',
  },
  {
    slug: 'indigo-henna-powder',
    name: 'Indigo / Henna Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Henna_for_hair.jpg',
  },
  {
    slug: 'aloe-vera-powder',
    name: 'Aloe Vera Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Cut_Aloe_Vera_Leaf.jpg',
  },
  {
    slug: 'amla-powder',
    name: 'Amla Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Indian_Gooseberry_%28Amla%29.jpg',
  },
  {
    slug: 'neem-powder',
    name: 'Neem Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Azadirachta_indica%2C_leaves_%26_fruits.JPG',
  },
  {
    slug: 'tulsi-holy-basil-powder',
    name: 'Tulsi (Holy Basil) Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/%28Ocimum_tenuiflorum%29_Tulasi_foliage_01.jpg',
  },
  {
    slug: 'wheatgrass-powder',
    name: 'Wheatgrass Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Wheatgrass_%28Triticum_aestivum%29.jpg',
  },
  {
    slug: 'alfalfa-powder',
    name: 'Alfalfa Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Alfalfa_%28Medicago_sativa%29_I.jpg',
  },
  {
    slug: 'animal-feed-millet',
    name: 'Animal Feed Millet',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Panicum_miliaceum_seeds%2C_by_Omar_Hoftun.jpg',
  },
  {
    slug: 'corn-grits-feed',
    name: 'Corn Grits (Animal Feed)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Polenta_uncooked.jpg',
  },
  {
    slug: 'green-millet-feed',
    name: 'Green Millet (Feed Bajra)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Pennisetum_glaucum_MHNT.BOT.2013.22.56.jpg',
  },
  {
    slug: 'safflower-feed',
    name: 'Safflower Meal / Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Carthamus_tinctorius_MHNT.BOT.2011.3.34.jpg',
  },
  {
    slug: 'soya-feed-grain',
    name: 'Soya (Feed Grain / Meal)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Grains_and_raw_food_shop.jpg',
  },
  {
    slug: 'chemical-raw-materials-cosmetic',
    name: 'Chemical Raw Materials (Cosmetic Grade)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Reagent_bottle.jpg',
  },
  {
    slug: 'essential-oils-cosmetic',
    name: 'Essential Oils (Cosmetic Grade)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Bottle%2C_castor_oil_%28AM_1969.210-4%29.jpg',
  },
  {
    slug: 'guar-gum',
    name: 'Guar Gum (Cosmetic / Technical Grade)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Cyamopsis_tetragonoloba%2C_a_valuable_crop._A.J.T.Johnsingh.DSCN1576.jpg',
  },
  {
    slug: 'isopropyl-alcohol',
    name: 'Isopropyl Alcohol (IPA)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Reagent_bottle.jpg',
  },
  {
    slug: 'vegetable-oils-cosmetic',
    name: 'Vegetable Oils (Cosmetic Grade)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Bottle%2C_castor_oil_%28AM_1969.210-5%29.jpg',
  },
  {
    slug: 'aseptic-fruit-pulp',
    name: 'Aseptic Fruit Pulp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Mango_and_Douglas_Fir_Puree.jpg',
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
  console.log('PostgreSQL connected.\nStarting Batch 3 execution (22 items)...');

  let successCount = 0;
  for (const item of BATCH_3_ITEMS) {
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
  console.log(`BATCH 3 INGESTION COMPLETE: ${successCount} of ${BATCH_3_ITEMS.length} successful`);
  console.log(`========================================`);
  await sequelize.close();
}

run().catch(console.error);
