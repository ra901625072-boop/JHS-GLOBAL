import fs from 'fs';
import path from 'path';
import { Product, sequelize } from '../server/src/models/index.js';

async function syncImages() {
  await sequelize.authenticate();
  console.log('PostgreSQL connected.');

  const productsDir = path.resolve('client', 'public', 'images', 'products');
  const products = await Product.findAll();

  let updatedCount = 0;

  for (const p of products) {
    const slug = p.slug;
    const imagePath = path.join(productsDir, `${slug}.webp`);
    if (fs.existsSync(imagePath)) {
      const existingImages = p.images || [];
      const hasImageAlready = existingImages.some(img => img.url === `/images/products/${slug}.webp`);
      if (!hasImageAlready || existingImages.length === 0) {
        const newImages = [
          {
            url: `/images/products/${slug}.webp`,
            alt: `${p.name} commercial raw material export sample`,
            is_primary: true,
            width: 800,
            height: 600,
            disclaimer: 'Illustrative commercial raw material image. Replace with verified batch photography - TODO(client)',
          }
        ];
        await p.update({ images: newImages });
        console.log(`Updated images for: ${p.name} (${slug})`);
        updatedCount++;
      }
    }
  }

  console.log(`\nSync completed: ${updatedCount} products updated with new images.`);
  await sequelize.close();
}

syncImages().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
