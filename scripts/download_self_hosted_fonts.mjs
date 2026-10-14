import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const fontsDir = path.resolve(rootDir, 'client/public/fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontRequests = [
  {
    family: 'Playfair Display',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&display=swap',
  },
  {
    family: 'Plus Jakarta Sans',
    url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
  },
  {
    family: 'JetBrains Mono',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
  },
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

async function downloadFonts() {
  console.log('Downloading fonts from Google Fonts API...');
  let cssRules = [];

  for (const item of fontRequests) {
    console.log(`Fetching CSS for ${item.family}...`);
    const res = await fetch(item.url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch ${item.url}: ${res.statusText}`);
    const cssText = await res.text();

    // Parse font-face blocks
    const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g;
    let match;
    while ((match = fontFaceRegex.exec(cssText)) !== null) {
      const block = match[1];
      const fontStyleMatch = block.match(/font-style:\s*([^;]+);/);
      const fontWeightMatch = block.match(/font-weight:\s*([^;]+);/);
      const urlMatch = block.match(/url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/);
      const unicodeRangeMatch = block.match(/unicode-range:\s*([^;]+);/);
      const commentMatch = cssText.substring(Math.max(0, match.index - 50), match.index).match(/\/\*\s*([^*]+)\s*\*\//);

      const subset = commentMatch ? commentMatch[1].trim() : 'latin';

      // Only save latin and latin-ext subsets to keep font bundle tiny
      if (!['latin', 'latin-ext'].includes(subset)) {
        continue;
      }

      if (urlMatch && fontWeightMatch) {
        const fontUrl = urlMatch[1];
        const weight = fontWeightMatch[1].trim();
        const style = fontStyleMatch ? fontStyleMatch[1].trim() : 'normal';
        const range = unicodeRangeMatch ? unicodeRangeMatch[1].trim() : '';

        const slugFamily = item.family.toLowerCase().replace(/\s+/g, '-');
        const filename = `${slugFamily}-${subset}-${weight}-${style}.woff2`;
        const localPath = path.join(fontsDir, filename);

        if (!fs.existsSync(localPath)) {
          console.log(`Downloading ${filename} from ${fontUrl}...`);
          const fontRes = await fetch(fontUrl);
          if (!fontRes.ok) throw new Error(`Failed to download ${fontUrl}`);
          const buffer = Buffer.from(await fontRes.arrayBuffer());
          fs.writeFileSync(localPath, buffer);
        } else {
          console.log(`Using existing ${filename}`);
        }

        cssRules.push(`/* ${item.family} - ${weight} ${style} (${subset}) */
@font-face {
  font-family: '${item.family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('/fonts/${filename}') format('woff2');
  unicode-range: ${range};
}`);
      }
    }
  }

  // Add metric-matched fallbacks for zero CLS
  const metricFallbacks = `
/* Metric-matched fallbacks for zero Cumulative Layout Shift (CLS) */
@font-face {
  font-family: 'Plus Jakarta Sans Fallback';
  src: local('Arial'), local('Helvetica');
  ascent-override: 96%;
  descent-override: 24%;
  line-gap-override: 0%;
  size-adjust: 102%;
}

@font-face {
  font-family: 'Playfair Display Fallback';
  src: local('Georgia'), local('Times New Roman');
  ascent-override: 100%;
  descent-override: 28%;
  line-gap-override: 0%;
  size-adjust: 100%;
}
`;

  const fontsCssPath = path.resolve(rootDir, 'client/src/styles/fonts.css');
  fs.writeFileSync(fontsCssPath, cssRules.join('\n\n') + '\n' + metricFallbacks, 'utf-8');
  console.log(`Generated fonts stylesheet at ${fontsCssPath}`);
}

downloadFonts().catch(err => {
  console.error(err);
  process.exit(1);
});
