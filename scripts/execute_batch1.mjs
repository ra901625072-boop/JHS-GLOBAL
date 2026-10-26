import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Product, sequelize } from '../server/src/models/index.js';

const PUBLIC_PRODUCTS_DIR = path.resolve('client', 'public', 'images', 'products');
const SOURCE_PRODUCTS_DIR = path.join(PUBLIC_PRODUCTS_DIR, 'source');

if (!fs.existsSync(SOURCE_PRODUCTS_DIR)) {
  fs.mkdirSync(SOURCE_PRODUCTS_DIR, { recursive: true });
}

const BATCH_1_ITEMS = [
  {
    slug: 'star-anise',
    name: 'Star Anise',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Dried_Star_Anise_Fruit_Seeds.jpg',
  },
  {
    slug: 'cinnamon-cassia',
    name: 'Cinnamon / Cassia',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Cinnamomum_verum_spices.jpg',
  },
  {
    slug: 'flax-seeds',
    name: 'Flax Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Brown_Flax_Seeds.jpg',
  },
  {
    slug: 'chia-seeds',
    name: 'Chia Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Seed_of_chia_%28Salvia_hispanica%29Salvia_hispanica_group.jpg',
  },
  {
    slug: 'chickpeas-split-chickpeas',
    name: 'Chickpeas / Split Chickpeas (Chana Dal)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Chickpea_BNC.jpg',
  },
  {
    slug: 'red-lentils',
    name: 'Red Lentils (Masoor Dal)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Split_Red_Lentil.jpg',
  },
  {
    slug: 'himalayan-pink-salt',
    name: 'Himalayan Pink Salt',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Himalayan_salt_%28coarse%29.jpg',
  },
  {
    slug: 'mung-bean',
    name: 'Mung Bean (Green Gram)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Mung_beans_%28Vigna_radiata%29.jpg',
  },
  {
    slug: 'kidney-beans',
    name: 'Kidney Beans (Rajma)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Dries_red_beans_ready_for_use.jpg',
  },
  {
    slug: 'pigeon-pea-toor-dal',
    name: 'Pigeon Pea (Toor Dal)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Split_pigeon_peas.jpg',
  },
  {
    slug: 'black-lentils-urad',
    name: 'Black Lentils (Urad Dal)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Black_gram.jpg',
  },
  {
    slug: 'peanuts-groundnuts',
    name: 'Peanuts (Groundnuts)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Peanuts_%28Arachis_hypogaea%29_-_in_shell%2C_shell_cracked_open%2C_shelled%2C_peeled.jpg',
  },
  {
    slug: 'ginger-fresh',
    name: 'Fresh Ginger',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Fresh_ginger_rhizome_01.jpg',
  },
  {
    slug: 'onion-fresh',
    name: 'Fresh Onion',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Red_Onion_on_White.JPG',
  },
  {
    slug: 'mango-fresh',
    name: 'Fresh Mango',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Mangos_-_single_and_halved.jpg',
  },
  {
    slug: 'pomegranate-fresh',
    name: 'Fresh Pomegranate',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Pomegranate_fruit_-_whole_and_piece_with_arils.jpg',
  },
  {
    slug: 'drumstick-fresh',
    name: 'Fresh Drumstick (Moringa Pods)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Moringa_oleifera_drumstick_pods.JPG',
  },
  {
    slug: '1509-basmati-rice',
    name: '1509 Basmati Rice',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Basmati_Rice_India%2C_raw.jpg',
  },
  {
    slug: 'fenugreek-seeds',
    name: 'Fenugreek Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Fenugreek_seeds.jpg',
  },
  {
    slug: 'bay-leaf',
    name: 'Bay Leaf',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Dried_bay_leaves.jpg',
  },
  {
    slug: 'black-seed-nigella',
    name: 'Black Seed (Nigella Seeds)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Nigella_sativa_seeds.jpg',
  },
  {
    slug: 'celery-seeds',
    name: 'Celery Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Apium_graveolens_seeds.jpg',
  },
  {
    slug: 'dill-seeds',
    name: 'Dill Seeds',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Anethum_graveolens_seeds.JPG',
  },
  {
    slug: 'oregano',
    name: 'Oregano',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Dried_Oregano.JPG',
  },
  {
    slug: 'green-chilli-fresh',
    name: 'Fresh Green Chilli',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Chili_green.jpg',
  },
  {
    slug: 'curry-powder',
    name: 'Curry Powder',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Curry_powder.jpg',
  },
  {
    slug: 'ajwain-carom-seeds',
    name: 'Ajwain (Carom Seeds)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Trachyspermum_ammi-1-xavier_cottage-yercaud-salem-India.jpg',
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
  console.log('PostgreSQL connected.\nStarting Batch 1 execution (27 items)...');

  let successCount = 0;
  for (const item of BATCH_1_ITEMS) {
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
  console.log(`BATCH 1 INGESTION COMPLETE: ${successCount} of ${BATCH_1_ITEMS.length} successful`);
  console.log(`========================================`);
  await sequelize.close();
}

run().catch(console.error);
