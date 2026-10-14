import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { optimize } from 'svgo';

const PUBLIC_DIR = path.resolve('client', 'public');
const MAP_DIR = path.join(PUBLIC_DIR, 'images', 'map');
const CERTS_DIR = path.join(PUBLIC_DIR, 'images', 'certifications');
const PRODUCTS_DIR = path.join(PUBLIC_DIR, 'images', 'products');
const MANIFEST_PATH = path.resolve('client', 'src', 'data', 'imageManifest.json');

// Ensure source preservation directories exist
function ensureSourceDir(dir) {
  const srcDir = path.join(dir, 'source');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  return srcDir;
}

// 1. Optimize World Map SVG
async function optimizeWorldMap() {
  console.log('\n--- 1. Optimizing World Trade Map SVG ---');
  const svgPath = path.join(MAP_DIR, 'world-blue.svg');
  const srcDir = ensureSourceDir(MAP_DIR);
  const srcPath = path.join(srcDir, 'world-blue.svg');

  if (!fs.existsSync(srcPath)) {
    fs.copyFileSync(svgPath, srcPath);
    console.log(`Preserved pristine source: ${srcPath}`);
  }

  const rawSvg = fs.readFileSync(srcPath, 'utf8');
  const originalSize = Buffer.byteLength(rawSvg);

  const svgoResult = optimize(rawSvg, {
    multipass: true,
    floatPrecision: 2,
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'cleanupAttrs',
      'mergeStyles',
      'inlineStyles',
      'minifyStyles',
      'cleanupIds',
      'removeUselessDefs',
      'cleanupNumericValues',
      'convertColors',
      'removeUnknownsAndDefaults',
      'removeNonInheritableGroupAttrs',
      'removeUselessStrokeAndFill',
      'cleanupEnableBackground',
      'removeHiddenElems',
      'removeEmptyText',
      'convertShapeToPath',
      'moveElemsAttrsToGroup',
      'moveGroupAttrsToElems',
      'collapseGroups',
      'convertPathData',
      'convertTransform',
      'removeEmptyAttrs',
      'removeEmptyContainers',
      'mergePaths',
      'removeUnusedNS',
      'sortDefsChildren',
    ],
  });

  fs.writeFileSync(svgPath, svgoResult.data, 'utf8');
  const optimizedSize = Buffer.byteLength(svgoResult.data);
  const savedPercent = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
  console.log(`Optimized world-blue.svg: ${originalSize} -> ${optimizedSize} bytes (${savedPercent}% saved)`);
}

// 2. Process Certificate Scans (PNG -> AVIF & WebP multi-width)
async function processCertificates() {
  console.log('\n--- 2. Processing Certificate Scans (AVIF & WebP) ---');
  const srcDir = ensureSourceDir(CERTS_DIR);
  const pngFiles = fs.readdirSync(CERTS_DIR).filter((f) => f.endsWith('.png'));

  const widths = [480, 768, 1024];

  for (const file of pngFiles) {
    const baseName = path.basename(file, '.png');
    const inputPath = path.join(CERTS_DIR, file);
    const srcPath = path.join(srcDir, file);

    if (!fs.existsSync(srcPath)) {
      fs.copyFileSync(inputPath, srcPath);
    }

    const originalSize = fs.statSync(srcPath).size;
    console.log(`Processing certificate: ${file} (${(originalSize / 1024).toFixed(1)} KB)`);

    for (const w of widths) {
      // High visual fidelity (85 quality for crisp government typography)
      const webpOut = path.join(CERTS_DIR, `${baseName}-${w}w.webp`);
      const avifOut = path.join(CERTS_DIR, `${baseName}-${w}w.avif`);

      await sharp(srcPath)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: 85, effort: 6 })
        .toFile(webpOut);

      await sharp(srcPath)
        .resize(w, null, { withoutEnlargement: true })
        .avif({ quality: 82, effort: 6 })
        .toFile(avifOut);
    }
  }
}

// 3. Process Product Photographs
async function processProducts() {
  console.log('\n--- 3. Processing Product Master Images ---');
  const srcDir = ensureSourceDir(PRODUCTS_DIR);
  const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.webp') && !f.match(/-\d+w\.(webp|avif)$/));

  // Widths: 176 (marquee 2x), 380 (mobile card), 640 (desktop card 2x), 800 (pdp), 1200 (zoom)
  const widths = [176, 380, 640, 800, 1200];
  const manifest = {
    products: {},
    certificates: {},
  };

  for (const file of files) {
    const baseName = path.basename(file, '.webp');
    const inputPath = path.join(PRODUCTS_DIR, file);
    const srcPath = path.join(srcDir, file);

    if (!fs.existsSync(srcPath)) {
      fs.copyFileSync(inputPath, srcPath);
    }

    const meta = await sharp(srcPath).metadata();
    console.log(`Processing product: ${file} (${meta.width}x${meta.height})`);

    const generatedWidths = [];

    for (const w of widths) {
      if (w > meta.width && w > 800) continue; // Don't upscale past original if small

      const webpOut = path.join(PRODUCTS_DIR, `${baseName}-${w}w.webp`);
      const avifOut = path.join(PRODUCTS_DIR, `${baseName}-${w}w.avif`);

      await sharp(srcPath)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(webpOut);

      await sharp(srcPath)
        .resize(w, null, { withoutEnlargement: true })
        .avif({ quality: 78, effort: 6 })
        .toFile(avifOut);

      generatedWidths.push(w);
    }

    manifest.products[baseName] = {
      baseSrc: `/images/products/${file}`,
      width: meta.width,
      height: meta.height,
      aspectRatio: `${meta.width}/${meta.height}`,
      widths: generatedWidths,
      srcSetWebp: generatedWidths.map((w) => `/images/products/${baseName}-${w}w.webp ${w}w`).join(', '),
      srcSetAvif: generatedWidths.map((w) => `/images/products/${baseName}-${w}w.avif ${w}w`).join(', '),
      thumb176Webp: `/images/products/${baseName}-176w.webp`,
      thumb176Avif: `/images/products/${baseName}-176w.avif`,
    };
  }

  // Populate certificates in manifest
  const certFiles = fs.readdirSync(CERTS_DIR).filter((f) => f.endsWith('.png'));
  for (const cFile of certFiles) {
    const cBase = path.basename(cFile, '.png');
    manifest.certificates[cBase] = {
      baseSrc: `/images/certifications/${cFile}`,
      srcSetWebp: `/images/certifications/${cBase}-480w.webp 480w, /images/certifications/${cBase}-768w.webp 768w, /images/certifications/${cBase}-1024w.webp 1024w`,
      srcSetAvif: `/images/certifications/${cBase}-480w.avif 480w, /images/certifications/${cBase}-768w.avif 768w, /images/certifications/${cBase}-1024w.avif 1024w`,
    };
  }

  const manifestDir = path.dirname(MANIFEST_PATH);
  if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Saved image manifest to: ${MANIFEST_PATH}`);
}

async function run() {
  await optimizeWorldMap();
  await processCertificates();
  await processProducts();
  console.log('\n=== Image Pipeline Processing Finished Successfully ===');
}

run().catch((err) => {
  console.error('Image pipeline error:', err);
  process.exit(1);
});
