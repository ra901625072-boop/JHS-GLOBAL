import fs from 'fs';
import path from 'path';
import { Product, sequelize } from '../server/src/models/index.js';

function createArtDirectedPrompt(product) {
  const name = product.name;
  const forms = product.forms || [];
  const formDesc = forms.length > 0 ? forms.slice(0, 3).join(', ') : 'raw export grade';

  return {
    slug: product.slug,
    name: product.name,
    category: product.category ? product.category.name : 'Export Commodity',
    forms: forms,
    prompt: `A professional commercial studio product photograph of premium export-grade ${name} (${formDesc}). The clean, pure raw commodity is artfully presented in a minimalist handcrafted matte off-white ceramic dish or shallow bowl resting on an elegant warm travertine stone slab and neutral folded natural linen fabric. Directional soft natural daylight studio lighting from 45 degrees, clean diffused shadows, ultra-sharp macro focus highlighting authentic raw natural textures and rich earthy tones. Pure raw commercial export commodity presentation, strictly no text, no labels, no packaging, no branding, no typography, no fruit stickers, no graphics, no artificial glow.`,
    aspectRatio: '4:3',
    imageName: product.slug
  };
}

async function generateManifest() {
  await sequelize.authenticate();
  const products = await Product.findAll({
    where: { isActive: true },
    include: ['category', 'subCategory']
  });

  const withoutImages = products.filter(p => !p.images || p.images.length === 0 || !p.images[0].url);
  console.log(`Generating studio prompt manifest for ${withoutImages.length} products without images...`);

  const manifest = withoutImages.map(createArtDirectedPrompt);

  const outPath = path.resolve('scripts', 'nano_banana_product_prompts.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✓ Saved ${manifest.length} art-directed prompts to: ${outPath}`);

  await sequelize.close();
}

generateManifest().catch(console.error);
