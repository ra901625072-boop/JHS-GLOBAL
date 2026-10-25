import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const BASE_DIR = path.resolve('jhs-ui-capture');

async function cleanBadCrops() {
  console.log('--- Starting Removal of Defective Crop Images ---');
  
  // 1. Read existing manifest
  const manifestPath = path.join(BASE_DIR, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  console.log(`Original manifest records: ${manifest.length}`);

  let deletedCount = 0;
  let renamedCount = 0;

  // 2. Scan and delete crop-1-1 and crop-4-5 from disk
  const publicDir = path.join(BASE_DIR, '01-public');
  const pages = await fs.readdir(publicDir);

  for (const pageSlug of pages) {
    const pageDir = path.join(publicDir, pageSlug);
    const stat = await fs.stat(pageDir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(pageDir);
    for (const f of files) {
      if (f.includes('crop-1-1') || f.includes('crop-4-5')) {
        const fullPath = path.join(pageDir, f);
        await fs.unlink(fullPath);
        deletedCount++;
        console.log(`[Deleted] ${path.relative(BASE_DIR, fullPath)}`);
      } else if (f.includes('crop-9-16')) {
        // Rename mobile viewport to avoid "crop" misnomer
        const oldPath = path.join(pageDir, f);
        const newFileName = f.replace('crop-9-16', 'viewport-9-16');
        const newPath = path.join(pageDir, newFileName);
        await fs.rename(oldPath, newPath);
        renamedCount++;
        console.log(`[Renamed Mobile Viewport] ${f} -> ${newFileName}`);
      }
    }
  }

  // Also rename in 03-mobile
  const mobileDir = path.join(BASE_DIR, '03-mobile');
  if (await fs.access(mobileDir).then(() => true).catch(() => false)) {
    const mobFiles = await fs.readdir(mobileDir);
    for (const f of mobFiles) {
      if (f.includes('crop-9-16')) {
        const oldPath = path.join(mobileDir, f);
        const newFileName = f.replace('crop-9-16', 'viewport-9-16');
        const newPath = path.join(mobileDir, newFileName);
        await fs.rename(oldPath, newPath);
        console.log(`[Renamed 03-mobile] ${f} -> ${newFileName}`);
      }
    }
  }

  console.log(`Total defective crop files deleted from disk: ${deletedCount}`);
  console.log(`Total mobile viewport files renamed to clear misnomer: ${renamedCount}`);

  // 3. Filter and update manifest records
  const updatedManifest = [];
  for (const r of manifest) {
    // Exclude crop-1-1 and crop-4-5
    if (r.file.includes('crop-1-1') || r.file.includes('crop-4-5')) {
      continue;
    }

    // Update crop-9-16 references to viewport-9-16
    if (r.file.includes('crop-9-16')) {
      r.file = r.file.replace('crop-9-16', 'viewport-9-16');
      r.shape_and_aspect_ratio = 'vertical 9:16 (390x844 mobile viewport)';
      r.element_or_section = 'Mobile Landing Viewport (Natural Screen)';
      r.description = r.description.replace('crop', 'screen');
      r.notes = 'Un-cropped natural mobile screen at 780x1688 physical pixels (390x844 @2x)';
    }

    updatedManifest.push(r);
  }

  console.log(`Updated manifest records count: ${updatedManifest.length}`);

  // 4. Save updated manifest.json
  await fs.writeFile(manifestPath, JSON.stringify(updatedManifest, null, 2), 'utf-8');

  // 5. Save updated manifest.csv
  const csvHeaders = [
    'file',
    'page',
    'route',
    'device',
    'viewport',
    'shape_and_aspect_ratio',
    'pixel_size',
    'element_or_section',
    'state',
    'description',
    'quality_score',
    'recommended_use',
    'notes',
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [
    csvHeaders.join(','),
    ...updatedManifest.map((r) =>
      csvHeaders.map((h) => escapeCsv(r[h])).join(',')
    ),
  ];

  const csvPath = path.join(BASE_DIR, 'manifest.csv');
  await fs.writeFile(csvPath, csvRows.join('\n'), 'utf-8');
  console.log(`Manifests updated successfully.`);

  // 6. Regenerate contact sheets without the bad crops
  console.log('\n--- Regenerating Contact Sheets ---');
  await regenerateContactSheets(updatedManifest);

  console.log('--- Cleanup Complete ---');
}

async function regenerateContactSheets(records) {
  const contactSheetsDir = path.join(BASE_DIR, 'contact-sheets');
  await fs.mkdir(contactSheetsDir, { recursive: true });

  const groups = {};
  for (const rec of records) {
    if (!groups[rec.page]) groups[rec.page] = [];
    groups[rec.page].push(rec);
  }

  for (const [pageName, recs] of Object.entries(groups)) {
    if (recs.length < 2) continue;
    const cleanName = pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const sheetFile = path.join(contactSheetsDir, `contact-sheet__${cleanName}.png`);

    const sample = recs.slice(0, 6);
    const thumbWidth = 480;
    const thumbHeight = 300;
    const padding = 20;
    const cols = Math.min(3, sample.length);
    const rows = Math.ceil(sample.length / cols);

    const totalWidth = cols * thumbWidth + (cols + 1) * padding;
    const totalHeight = rows * thumbHeight + (rows + 1) * padding + 60;

    const composites = [];
    for (let i = 0; i < sample.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (thumbWidth + padding);
      const y = 60 + padding + row * (thumbHeight + padding);

      const fullImgPath = path.join(BASE_DIR, sample[i].file);
      try {
        const thumbBuf = await sharp(fullImgPath)
          .resize(thumbWidth, thumbHeight, { fit: 'cover', position: 'top' })
          .png()
          .toBuffer();

        composites.push({ input: thumbBuf, top: y, left: x });
      } catch (err) {
        console.warn(`Could not include ${sample[i].file} in contact sheet:`, err.message);
      }
    }

    if (composites.length > 0) {
      await sharp({
        create: {
          width: totalWidth,
          height: totalHeight,
          channels: 4,
          background: { r: 13, g: 32, b: 64, alpha: 1 },
        },
      })
        .composite(composites)
        .png()
        .toFile(sheetFile);

      console.log(`[Contact Sheet Regenerated] ${path.relative(BASE_DIR, sheetFile)}`);
    }
  }
}

cleanBadCrops().catch((err) => {
  console.error('Failed to clean bad crops:', err);
  process.exit(1);
});
