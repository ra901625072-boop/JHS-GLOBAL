import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const VIDEO_DIR = path.resolve('jhs-ui-capture/video');

async function createVideoContactSheet() {
  const jsonPath = path.join(VIDEO_DIR, 'manifest-video.json');
  const assets = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

  // We will create a poster-style contact sheet for the 10 master widescreen scenes + 6 admin views
  const widescreenAndAdmin = assets.filter(a => a.type === 'widescreen-16-9' || a.type === 'admin-16-9');

  const thumbWidth = 480;
  const thumbHeight = 300;
  const padding = 24;
  const cols = 4;
  const rows = Math.ceil(widescreenAndAdmin.length / cols);

  const totalWidth = cols * thumbWidth + (cols + 1) * padding;
  const totalHeight = rows * thumbHeight + (rows + 1) * padding + 80;

  const composites = [];
  for (let i = 0; i < widescreenAndAdmin.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (thumbWidth + padding);
    const y = 80 + padding + row * (thumbHeight + padding);

    const fullPath = path.join('jhs-ui-capture', widescreenAndAdmin[i].file);
    try {
      const thumbBuf = await sharp(fullPath)
        .resize(thumbWidth, thumbHeight, { fit: 'cover', position: 'top' })
        .png()
        .toBuffer();
      composites.push({ input: thumbBuf, top: y, left: x });
    } catch (err) {
      console.warn(`Error on ${fullPath}:`, err.message);
    }
  }

  const sheetPath = path.join(VIDEO_DIR, 'contact-sheet__video-showcase.png');
  await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 13, g: 32, b: 64, alpha: 1 }, // Deep Navy #0D2040
    },
  })
    .composite(composites)
    .png()
    .toFile(sheetPath);

  console.log(`Created video contact sheet at: ${sheetPath} (${totalWidth}x${totalHeight})`);
}

createVideoContactSheet().catch(console.error);
