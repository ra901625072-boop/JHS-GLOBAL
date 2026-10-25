import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = path.resolve('jhs-ui-capture');
const VIDEO_DIR = path.join(OUTPUT_DIR, 'video');

const ASSET_MAPPING = [
  // 1. Widescreen 16:9 Timeline (Landscape Reel)
  {
    src: '01-public/home/home__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-01__home-hero__widescreen-16-9.png',
    title: 'Scene 01: Global Storefront & Maritime Ports Hook',
    type: 'widescreen-16-9',
    scene: '01 - Brand Authority',
    durationSec: 2.5,
    cameraMotion: 'Subtle slow push-in (scale 1.0 -> 1.05)',
    description: 'Hero opening establishing JHS GLOBAL as government recognized export merchant with Mundra/Hazira ports and 48h turnaround.',
  },
  {
    src: '01-public/category-personal-care/category-personal-care__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-02__export-divisions__widescreen-16-9.png',
    title: 'Scene 02: 3 Core Export Divisions Triad & Chemical Categories',
    type: 'widescreen-16-9',
    scene: '02 - Commercial Breadth',
    durationSec: 2.0,
    cameraMotion: 'Parallax horizontal glide across the personal care & raw materials grid',
    description: 'Personal Care, Nutraceuticals, and Animal Feed master product lines with chemical pill tags.',
  },
  {
    src: '01-public/products/products__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-03__products-catalogue-filter__widescreen-16-9.png',
    title: 'Scene 03: Faceted B2B Catalogue & Search Architecture',
    type: 'widescreen-16-9',
    scene: '03 - Discoverability',
    durationSec: 1.875,
    cameraMotion: 'Pan down-right from search bar to container product grid',
    description: 'Multi-attribute faceted filter engine with live counters and containerized batch listings.',
  },
  {
    src: '01-public/product-castor-oil/product-castor-oil__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-04__castor-oil-specification-hero__widescreen-16-9.png',
    title: 'Scene 04: Industrial Castor Oil Derivatives Specification',
    type: 'widescreen-16-9',
    scene: '04 - Technical Rigor',
    durationSec: 2.0,
    cameraMotion: 'Zoom focus onto HS Code 1515.30.90 and 200kg drum packaging chips',
    description: 'Flagship industrial chemical detail page showing loadability (16 MT per 20ft FCL) and minimum order metrics.',
  },
  {
    src: '01-public/product-ashwagandha/product-ashwagandha__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-05__ashwagandha-botanical-extract__widescreen-16-9.png',
    title: 'Scene 05: Organic Botanical Extract Active Ingredients',
    type: 'widescreen-16-9',
    scene: '05 - Active Biomarkers',
    durationSec: 1.875,
    cameraMotion: 'Gentle tilt upwards towards organic seal and HPLC assay score',
    description: 'Withanolides standardization profile targeted at European nutraceutical formulators.',
  },
  {
    src: '01-public/quality/quality__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-06__government-certifications-matrix__widescreen-16-9.png',
    title: 'Scene 06: Official Government Accreditation Matrix',
    type: 'widescreen-16-9',
    scene: '06 - Credibility Climax',
    durationSec: 2.5,
    cameraMotion: 'Center-lock zoom with glowing edge vignette highlight',
    description: 'Verified regulatory registrations: FSSAI Central, APEDA RCMC, Spices Board of India, DGFT IEC, and GST.',
  },
  {
    src: '01-public/export-process/export-process__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-07__six-stage-export-roadmap__widescreen-16-9.png',
    title: 'Scene 07: 6-Stage Export Pipeline & Incoterms 2020',
    type: 'widescreen-16-9',
    scene: '07 - Supply Chain Confidence',
    durationSec: 2.0,
    cameraMotion: 'Linear horizontal camera tracking across numbered workflow nodes',
    description: 'Clear procurement lifecycle from proforma quote and NABL testing to customs clearance and ocean vessel dispatch.',
  },
  {
    src: '01-public/blog-detail/blog-detail__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-08__hplc-assay-technical-study__widescreen-16-9.png',
    title: 'Scene 08: Scientific Research & Technical Whitepaper',
    type: 'widescreen-16-9',
    scene: '08 - Thought Leadership',
    durationSec: 1.875,
    cameraMotion: 'Slow editorial pan down reading column',
    description: 'In-depth laboratory assay methodology for Curcumin 95% highlighting rigorous analytical documentation.',
  },
  {
    src: '01-public/contact/contact__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-09__commercial-rfq-portal__widescreen-16-9.png',
    title: 'Scene 09: International B2B RFQ Transaction Portal',
    type: 'widescreen-16-9',
    scene: '09 - High-Conversion CTA',
    durationSec: 2.25,
    cameraMotion: 'Focus zoom onto maritime destination port and container volume dropdowns',
    description: 'Full-featured proforma RFQ gateway designed specifically for overseas procurement managers.',
  },
  {
    src: '01-public/about-us/about-us__desktop__viewport-16-9__hero__02.png',
    folder: '01-widescreen-16-9-showcase',
    destName: 'scene-10__executive-leadership-origin__widescreen-16-9.png',
    title: 'Scene 10: Executive Leadership & Gujarat Heritage',
    type: 'widescreen-16-9',
    scene: '10 - Corporate Identity Outro',
    durationSec: 2.0,
    cameraMotion: 'Pull out to black logo lockup',
    description: 'Corporate lineage rooted in Surat maritime trade with direct director accountability.',
  },

  // 2. UI Micro-Interactions & State Cuts
  {
    src: '02-elements/header/header__desktop__element__navbar-rest__01.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-01a__header-rest__navbar.png',
    title: 'Cut 01A: Sticky Navigation (Rest State)',
    type: 'ui-element',
    scene: 'Micro-Interaction: Header Rest',
    durationSec: 1.0,
    cameraMotion: 'Static center frame before transition cut',
    description: 'Clean white background with pristine brand typography and RFQ action button.',
  },
  {
    src: '02-elements/header/header__desktop__element__navbar-scrolled__02.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-01b__header-scrolled__elevation-blur.png',
    title: 'Cut 01B: Sticky Navigation (Scrolled State)',
    type: 'ui-element',
    scene: 'Micro-Interaction: Header Scrolled',
    durationSec: 1.0,
    cameraMotion: 'Snap match-cut from 01A showing elevation shadow and backdrop blur',
    description: 'Elevated sticky header with active glassmorphism blur and subtle drop shadow.',
  },
  {
    src: '02-elements/quote-basket/quote-basket__desktop__state__drawer-empty__01.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-02a__quote-basket__drawer-empty.png',
    title: 'Cut 02A: Quote Basket Drawer (Empty State)',
    type: 'ui-element',
    scene: 'Micro-Interaction: Basket Empty',
    durationSec: 0.94,
    cameraMotion: 'Slide in from right screen edge',
    description: 'Tactile slide-out drawer prompting overseas buyers to add container items.',
  },
  {
    src: '02-elements/quote-basket/quote-basket__desktop__state__drawer-filled__02.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-02b__quote-basket__drawer-filled-mt.png',
    title: 'Cut 02B: Quote Basket Drawer (Populated with Container Items)',
    type: 'ui-element',
    scene: 'Micro-Interaction: Basket Filled',
    durationSec: 1.5,
    cameraMotion: 'Punch in on Metric Tonne counter and Proforma RFQ button',
    description: 'Populated drawer showing HS codes, packaging tags, volume counters, and direct proforma checkout.',
  },
  {
    src: '02-elements/product-cards/product-cards__desktop__element__card-rest__01.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-03a__product-card__state-rest.png',
    title: 'Cut 03A: Product Card (Rest State)',
    type: 'ui-element',
    scene: 'Micro-Interaction: Card Rest',
    durationSec: 0.94,
    cameraMotion: 'Static focal cut',
    description: 'Standard card presentation with chemical specs and clean border outline.',
  },
  {
    src: '02-elements/product-cards/product-cards__desktop__element__card-hover__02.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-03b__product-card__state-hover-lift.png',
    title: 'Cut 03B: Product Card (Hover Elevation & CTA Lift)',
    type: 'ui-element',
    scene: 'Micro-Interaction: Card Hover',
    durationSec: 1.2,
    cameraMotion: 'Match cut with tactile 4px vertical lift simulation',
    description: 'Elevated hover interaction with rich diffused shadow and active arrow CTA highlight.',
  },
  {
    src: '02-elements/division-cards/division-cards__desktop__element__three-divisions-grid__01.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-04__division-triad__ingredient-cards.png',
    title: 'Cut 04: Three Core Export Divisions Triad Card Grid',
    type: 'ui-element',
    scene: 'Micro-Interaction: Division Cards',
    durationSec: 1.5,
    cameraMotion: 'Parallax horizontal glide across the 3 division cards',
    description: 'Personal Care, Nutraceuticals, and Animal Feed master product lines with chemical pill tags.',
  },
  {
    src: '02-elements/spec-table/spec-table__desktop__element__technical-parameters__01.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-05__technical-spec-table__parameters-grid.png',
    title: 'Cut 05: Laboratory Specification Table Close-Up',
    type: 'ui-element',
    scene: 'Micro-Interaction: Technical Data',
    durationSec: 1.5,
    cameraMotion: 'Slow vertical scan across test methods (USP/EP) and numerical limits',
    description: 'Monospaced numerical precision table inspiring chemical buyer confidence.',
  },
  {
    src: '02-elements/rfq-form/rfq-form__desktop__element__form-filled__03.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-06__commercial-rfq-form__filled-incoterms.png',
    title: 'Cut 06: Proforma RFQ Commercial Form (Filled State)',
    type: 'ui-element',
    scene: 'Micro-Interaction: RFQ Form',
    durationSec: 1.5,
    cameraMotion: 'Smooth focus drift across Incoterms 2020 (CIF/FOB) and port selector',
    description: 'Active filled commercial RFQ with container volume inputs and destination port.',
  },
  {
    src: '02-elements/ai-chat/ai-chat__desktop__state__dialogue-open__02.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-07__ai-trade-assistant__ground-truth-dialogue.png',
    title: 'Cut 07: Ground-Truth AI Trade Assistant Dialogue',
    type: 'ui-element',
    scene: 'Micro-Interaction: AI Assistant',
    durationSec: 1.5,
    cameraMotion: 'Slight zoom-in on conversational response with ingredient chip pills',
    description: 'Intelligent assistant powered by PostgreSQL catalogue specifications answering buyer queries.',
  },
  {
    src: '02-elements/certification-strip/certification-strip__desktop__element__gov-credentials-matrix__01.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-08__government-credentials__verified-emblems.png',
    title: 'Cut 08: Verified Government Emblem Seals Close-Up',
    type: 'ui-element',
    scene: 'Micro-Interaction: Credentials Strip',
    durationSec: 1.5,
    cameraMotion: 'Horizontal glide across official government registration emblems',
    description: 'Official seals for FSSAI Central, APEDA RCMC, Spices Board, and DGFT registration numbers.',
  },
  {
    src: '02-elements/process-timeline/process-timeline__desktop__element__six-step-pipeline__01.png',
    folder: '02-ui-micro-interactions',
    destName: 'cut-09__six-step-pipeline__maritime-infographic.png',
    title: 'Cut 09: 6-Step Maritime Supply Chain Infographic',
    type: 'ui-element',
    scene: 'Micro-Interaction: Export Timeline',
    durationSec: 1.5,
    cameraMotion: 'Continuous pan along the connected step nodes from sample to vessel',
    description: 'Detailed infographic showing testing, stuffing, and bill of lading release.',
  },

  // 3. Mobile Vertical 9:16 Reel (Shorts / Reels / TikTok)
  {
    src: '03-mobile/home__mobile__viewport-9-16__viewport__02.png',
    folder: '03-vertical-9-16-reels',
    destName: 'reel-01__home-hero__mobile-viewport-9-16.png',
    title: 'Reel 01: Home First-Screen Mobile Viewport',
    type: 'mobile-9-16',
    scene: 'Mobile Reel: Hero Intro',
    durationSec: 2.0,
    cameraMotion: 'Vertical gentle push-in on mobile headline and quick RFQ button',
    description: 'High-DPI iPhone 390x844 responsive layout establishing instant brand trust.',
  },
  {
    src: '02-elements/mobile-menu/mobile-menu__mobile__state__drawer-open__01.png',
    folder: '03-vertical-9-16-reels',
    destName: 'reel-02__mobile-menu__drawer-open.png',
    title: 'Reel 02: Full-Screen Mobile Drawer & Category Hierarchy',
    type: 'mobile-9-16',
    scene: 'Mobile Reel: Navigation Action',
    durationSec: 1.5,
    cameraMotion: 'Slide in from left edge matching drawer physics',
    description: 'Comprehensive mobile navigation with division links, trust badges, and direct contact CTAs.',
  },
  {
    src: '03-mobile/products__mobile__viewport-9-16__viewport__02.png',
    folder: '03-vertical-9-16-reels',
    destName: 'reel-03__catalogue-browse__mobile-viewport-9-16.png',
    title: 'Reel 03: Mobile Products Catalogue & Search Bar',
    type: 'mobile-9-16',
    scene: 'Mobile Reel: Catalog Exploration',
    durationSec: 1.8,
    cameraMotion: 'Vertical scroll tilt down through product cards',
    description: 'Stacked mobile catalogue layout with quick filters and clean container packaging photography.',
  },
  {
    src: '03-mobile/product-castor-oil__mobile__viewport-9-16__viewport__02.png',
    folder: '03-vertical-9-16-reels',
    destName: 'reel-04__castor-oil-detail__mobile-viewport-9-16.png',
    title: 'Reel 04: Mobile Product Detail & Loadability Specs',
    type: 'mobile-9-16',
    scene: 'Mobile Reel: Product Detail',
    durationSec: 1.8,
    cameraMotion: 'Focus on 200kg drum specs and instant Quote Drawer CTA',
    description: 'Clean responsive product specification view on mobile device.',
  },
  {
    src: '03-mobile/quality__mobile__viewport-9-16__viewport__02.png',
    folder: '03-vertical-9-16-reels',
    destName: 'reel-05__quality-certifications__mobile-viewport-9-16.png',
    title: 'Reel 05: Mobile Regulatory Quality Credentials',
    type: 'mobile-9-16',
    scene: 'Mobile Reel: Trust Badges',
    durationSec: 1.8,
    cameraMotion: 'Subtle punch-in on government registration card stack',
    description: 'Mobile presentation of APEDA, FSSAI, and Spices Board government registrations.',
  },
  {
    src: '03-mobile/contact__mobile__viewport-9-16__viewport__02.png',
    folder: '03-vertical-9-16-reels',
    destName: 'reel-06__contact-rfq__mobile-viewport-9-16.png',
    title: 'Reel 06: Fast Mobile RFQ & Container Inquiry Submission',
    type: 'mobile-9-16',
    scene: 'Mobile Reel: Final CTA',
    durationSec: 2.0,
    cameraMotion: 'Slow vertical glide settling on Submit Inquiry button',
    description: 'Thumb-friendly mobile commercial form optimized for on-the-go global buyers.',
  },

  // 4. Enterprise Operations & Backoffice (Dark-Mode Tech)
  {
    src: '05-admin/login/admin-login__desktop__viewport-16-9__auth-card__01.png',
    folder: '04-enterprise-admin-suite',
    destName: 'admin-01__auth-portal__secure-login-card.png',
    title: 'Admin 01: Secure Commercial Operations Authentication Portal',
    type: 'admin-16-9',
    scene: 'Backoffice Tech: Security Gateway',
    durationSec: 1.875,
    cameraMotion: 'Center lock on deep forest green #06180E canvas with subtle glow',
    description: 'High-security staff entrance with Government Recognized B2B Export Desk credential badge.',
  },
  {
    src: '05-admin/dashboard/admin-dashboard__desktop__viewport-16-9__table-header__02.png',
    folder: '04-enterprise-admin-suite',
    destName: 'admin-02__command-dashboard__kpi-metrics.png',
    title: 'Admin 02: Operations Command Center & Live Pipeline Metrics',
    type: 'admin-16-9',
    scene: 'Backoffice Tech: Dashboard Overview',
    durationSec: 2.25,
    cameraMotion: 'Split-screen pan across active RFQ counters, sample orders, and dispatch logs',
    description: 'Executive dashboard tracking live overseas container inquiries and order velocity.',
  },
  {
    src: '05-admin/inquiries/admin-inquiries__desktop__viewport-16-9__table-header__02.png',
    folder: '04-enterprise-admin-suite',
    destName: 'admin-03__rfq-manager__inquiries-pipeline.png',
    title: 'Admin 03: Overseas Buyer RFQ & Proforma Pipeline Triage',
    type: 'admin-16-9',
    scene: 'Backoffice Tech: RFQ Triage',
    durationSec: 2.0,
    cameraMotion: 'Horizontal glide across buyer table with status pills (New, Quoted, Dispatched)',
    description: 'Real-time commercial dispatch queue showing European and US buyer requests with Incoterms.',
  },
  {
    src: '05-admin/samples/admin-samples__desktop__viewport-16-9__table-header__02.png',
    folder: '04-enterprise-admin-suite',
    destName: 'admin-04__sample-tracker__dhl-courier.png',
    title: 'Admin 04: International Commercial Sample Request Tracker',
    type: 'admin-16-9',
    scene: 'Backoffice Tech: Sample Logistics',
    durationSec: 1.875,
    cameraMotion: 'Focus on DHL/FedEx tracking number tags and lab approval stamps',
    description: 'Courier tracking pipeline for commercial formulation samples sent to international labs.',
  },
  {
    src: '05-admin/products/admin-products__desktop__viewport-16-9__table-header__02.png',
    folder: '04-enterprise-admin-suite',
    destName: 'admin-05__catalogue-manager__hs-code-registry.png',
    title: 'Admin 05: Product Catalogue & HS Code Classification Engine',
    type: 'admin-16-9',
    scene: 'Backoffice Tech: Product Manager',
    durationSec: 1.875,
    cameraMotion: 'Scan across chemical database records with instant active toggle states',
    description: 'Centralized product and compliance manager with instant live updating.',
  },
  {
    src: '05-admin/command-palette/admin-command-palette__desktop__state__modal-open__01.png',
    folder: '04-enterprise-admin-suite',
    destName: 'admin-06__spotlight-palette__ctrl-k-modal.png',
    title: 'Admin 06: Power-User Quick Command Palette (Ctrl+K Modal)',
    type: 'admin-modal',
    scene: 'Backoffice Tech: Spotlight Palette',
    durationSec: 1.5,
    cameraMotion: 'Instant pop-in with blurred backdrop overlay',
    description: 'High-speed keyboard navigation modal across live inquiries, catalogues, and audit logs.',
  },
];

async function buildVideoSuite() {
  console.log('--- Initializing Professional Video Asset Suite ---');
  await fs.mkdir(VIDEO_DIR, { recursive: true });

  const folders = [
    '01-widescreen-16-9-showcase',
    '02-ui-micro-interactions',
    '03-vertical-9-16-reels',
    '04-enterprise-admin-suite',
  ];

  for (const f of folders) {
    await fs.mkdir(path.join(VIDEO_DIR, f), { recursive: true });
  }

  const videoManifest = [];

  for (const item of ASSET_MAPPING) {
    const srcPath = path.join(OUTPUT_DIR, item.src);
    const destFolder = path.join(VIDEO_DIR, item.folder);
    const destPath = path.join(destFolder, item.destName);

    try {
      await fs.copyFile(srcPath, destPath);
      const meta = await sharp(destPath).metadata();

      const relPath = path.relative(OUTPUT_DIR, destPath).replace(/\\/g, '/');
      const record = {
        file: relPath,
        dest_filename: item.destName,
        title: item.title,
        type: item.type,
        scene: item.scene,
        resolution: `${meta.width}x${meta.height}`,
        duration_seconds: item.durationSec,
        bpm_128_beats: Math.round(item.durationSec / 0.46875),
        camera_motion: item.cameraMotion,
        description: item.description,
        source_original: item.src,
      };
      videoManifest.push(record);
      console.log(`[Video Asset Ready] ${item.folder}/${item.destName} (${record.resolution})`);
    } catch (err) {
      console.error(`Failed to copy ${item.src} -> ${destPath}:`, err.message);
    }
  }

  // Write video manifest JSON
  await fs.writeFile(
    path.join(VIDEO_DIR, 'manifest-video.json'),
    JSON.stringify(videoManifest, null, 2),
    'utf-8'
  );

  // Generate Video Storyboard & Director's EDL Markdown
  const storyboardMd = generateStoryboardMd(videoManifest);
  await fs.writeFile(path.join(VIDEO_DIR, 'STORYBOARD.md'), storyboardMd, 'utf-8');

  console.log(`Successfully curated and organized ${videoManifest.length} perfect video assets in ${VIDEO_DIR}`);
}

function generateStoryboardMd(assets) {
  const widescreen = assets.filter(a => a.type === 'widescreen-16-9');
  const elements = assets.filter(a => a.type === 'ui-element');
  const reels = assets.filter(a => a.type === 'mobile-9-16');
  const admin = assets.filter(a => a.type.startsWith('admin'));

  return `# JHS GLOBAL — Motion Design & Video Production Storyboard

**Director Roles:** Senior Video Editor & Senior UI/UX Designer  
**Target Video Formats:**
- **Master Showcase (16:9 Landscape):** 4K UHD (3840×2160) / 1080p (1920×1080) @ 60 FPS
- **Shorts / Reels / TikTok (9:16 Vertical):** 1080×1920 @ 60 FPS
- **Target Tempo:** 128 BPM (1 Beat = \`0.46875s\` | 1 Bar / 4 Beats = \`1.875s\`)
- **Asset Directory:** \`jhs-ui-capture/video/\`

---

## 1. Executive Master Showcase (16:9 Landscape Timeline)

Total Curated Runtime: **~21 Seconds** (44 Beats @ 128 BPM).  
Designed for corporate brand teasers, investor presentations, YouTube bumpers, and international trade fair booth displays.

| Scene | Timeline Timecode | Beat Count | Asset Filename | Visual Focus & UI Element | Recommended Motion & Camera Grammar |
|---|---|---|---|---|---|
${widescreen
  .map(
    (w, idx) =>
      `| **${idx + 1}** | \`00:${String(idx * 2).padStart(2, '0')}:00\` | ${w.bpm_128_beats} beats | \`${w.dest_filename}\` | **${w.title}**<br>${w.description} | **${w.camera_motion}**<br>Ease: \`expo.out\` |`
  )
  .join('\n')}

---

## 2. Dynamic UI Micro-Interactions (Quick Action Cuts)

High-energy cutaways and split-screen components for rapid pacing, feature highlights, and interactive product credibility:

| Action Cut | Asset Filename | Interaction State | Video Editor Transition / VFX Cue |
|---|---|---|---|
${elements
  .map(
    (e, idx) =>
      `| **Cut ${idx + 1}** | \`${e.dest_filename}\` | **${e.scene}**<br>${e.description} | **${e.camera_motion}**<br>Audio SFX: *Subtle UI click & kinetic whoosh* |`
  )
  .join('\n')}

---

## 3. Mobile Vertical Reel (9:16 Shorts / Reels / TikTok Format)

Curated sequence for mobile-first audiences, showing touch ergonomics, smooth drawer navigation, and instant proforma RFQ:

| Reel Scene | Asset Filename | Handheld Layout | Motion & Pacing Guide |
|---|---|---|---|
${reels
  .map(
    (r, idx) =>
      `| **Reel ${idx + 1}** | \`${r.dest_filename}\` | **${r.title}**<br>${r.description} | **${r.camera_motion}**<br>Duration: \`${r.duration_seconds}s\` |`
  )
  .join('\n')}

---

## 4. Enterprise Operations & Backoffice Command Suite

Dark-mode technical showcase demonstrating enterprise reliability, automated quotation triage, and courier tracking:

| Backoffice View | Asset Filename | Administrative Module | Video Scene Role |
|---|---|---|---|
${admin
  .map(
    (a, idx) =>
      `| **Admin ${idx + 1}** | \`${a.dest_filename}\` | **${a.title}**<br>${a.description} | **${a.camera_motion}**<br>Visual Mood: *High-security enterprise dark theme* |`
  )
  .join('\n')}

---

## 5. Video Editor Implementation Instructions

1. **Importing into NLE (Premiere Pro, DaVinci Resolve, After Effects, Final Cut Pro):**
   - Import \`jhs-ui-capture/video/\` as separate bins: \`01-widescreen-16-9-showcase\`, \`02-ui-micro-interactions\`, \`03-vertical-9-16-reels\`, and \`04-enterprise-admin-suite\`.
   - The assets are captured at high retina resolution (\`2880×1800\` and \`780×1688\`), allowing **125% to 150% punch-ins and pans in 4K/1080p timelines with zero pixelation**.
2. **Pacing with Audio Track:**
   - Align scene transitions with musical downbeats (quantized to 128 BPM or 120 BPM).
   - Use match-cuts between corresponding states (e.g., \`cut-01a\` to \`cut-01b\` on a beat drop to show the sticky elevation blur).
3. **Typography & Lower Thirds:**
   - Complement the visuals using brand font pairings: **Playfair Display** (Headings / Serif) and **Plus Jakarta Sans** (Data Callouts / Clean Sans-Serif).
`;
}

buildVideoSuite().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
