import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_DIR = path.resolve('jhs-ui-capture');
const CONTACT_SHEETS_DIR = path.join(OUTPUT_DIR, 'contact-sheets');

async function main() {
  const jsonPath = path.join(OUTPUT_DIR, 'manifest.json');
  const rawManifest = await fs.readFile(jsonPath, 'utf8');
  let records = JSON.parse(rawManifest);

  console.log(`Initial records in manifest.json: ${records.length}`);

  // Filter out any record that no longer exists on disk or was an old crop
  const validRecords = [];
  for (const rec of records) {
    if (rec.file.includes('crop-1-1') || rec.file.includes('crop-4-5')) {
      console.log(`Skipping removed crop: ${rec.file}`);
      continue;
    }
    const fullPath = path.join(OUTPUT_DIR, rec.file);
    try {
      const stat = await fs.stat(fullPath);
      if (stat.size > 0) {
        // Update pixel dimensions dynamically from file
        const meta = await sharp(fullPath).metadata();
        rec.pixel_size = `${meta.width}x${meta.height}`;
        validRecords.push(rec);
      } else {
        console.warn(`Empty file: ${rec.file}`);
      }
    } catch {
      console.warn(`File missing on disk: ${rec.file}`);
    }
  }

  console.log(`Valid verified records on disk: ${validRecords.length}`);

  // Write updated manifest.json
  await fs.writeFile(jsonPath, JSON.stringify(validRecords, null, 2), 'utf8');

  // Write updated manifest.csv
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
    ...validRecords.map((r) => csvHeaders.map((h) => escapeCsv(r[h])).join(',')),
  ];
  await fs.writeFile(path.join(OUTPUT_DIR, 'manifest.csv'), csvRows.join('\n'), 'utf8');
  console.log('Updated manifest.csv and manifest.json');

  // Generate Contact Sheets
  await fs.mkdir(CONTACT_SHEETS_DIR, { recursive: true });

  // Group by page name
  const groups = {};
  for (const rec of validRecords) {
    if (!groups[rec.page]) groups[rec.page] = [];
    groups[rec.page].push(rec);
  }

  // Also include 02-elements as a grouped contact sheet if possible
  const elemRecords = validRecords.filter(r => r.file.startsWith('02-elements'));
  if (elemRecords.length > 0) {
    groups['Key UI Elements & Micro-States'] = elemRecords;
  }

  let sheetsCreated = 0;
  for (const [pageName, pageRecs] of Object.entries(groups)) {
    if (pageRecs.length === 0) continue;

    const cleanName = pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const sheetFile = path.join(CONTACT_SHEETS_DIR, `contact-sheet__${cleanName}.png`);

    // Use up to 8 representative images
    const sample = pageRecs.slice(0, 8);
    const thumbWidth = 480;
    const thumbHeight = 300;
    const padding = 20;
    const cols = Math.min(3, sample.length);
    const rows = Math.ceil(sample.length / cols);

    const totalWidth = cols * thumbWidth + (cols + 1) * padding;
    const totalHeight = rows * thumbHeight + (rows + 1) * padding + 60; // 60px header banner

    const composites = [];
    for (let i = 0; i < sample.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (thumbWidth + padding);
      const y = 60 + padding + row * (thumbHeight + padding);

      const fullImgPath = path.join(OUTPUT_DIR, sample[i].file);
      try {
        const thumbBuf = await sharp(fullImgPath)
          .resize(thumbWidth, thumbHeight, { fit: 'cover', position: 'top' })
          .png()
          .toBuffer();

        composites.push({ input: thumbBuf, top: y, left: x });
      } catch (err) {
        console.warn(`Could not process thumb for ${sample[i].file}: ${err.message}`);
      }
    }

    if (composites.length > 0) {
      await sharp({
        create: {
          width: totalWidth,
          height: totalHeight,
          channels: 4,
          background: { r: 13, g: 32, b: 64, alpha: 1 }, // Brand Deep Navy #0D2040
        },
      })
        .composite(composites)
        .png()
        .toFile(sheetFile);

      sheetsCreated++;
      console.log(`[Contact Sheet] Generated: contact-sheet__${cleanName}.png (${composites.length} thumbnails)`);
    }
  }

  console.log(`Contact sheet generation finished! Created ${sheetsCreated} sheets.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
