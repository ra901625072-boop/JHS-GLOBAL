import fs from 'fs';
import path from 'path';
import http from 'http';
import { chromium } from '@playwright/test';

const PORT = 4173;
const DIST_DIR = path.resolve('client', 'dist');

function createSpaServer() {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon',
  };

  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading ' + reqPath);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
}

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];

const ADMIN_PAGES = [
  { slug: 'login', path: '/admin/login' },
  { slug: 'dashboard', path: '/admin' },
  { slug: 'inquiries', path: '/admin/inquiries' },
  { slug: 'samples', path: '/admin/samples' },
  { slug: 'products', path: '/admin/products' },
  { slug: 'categories', path: '/admin/categories' },
  { slug: 'certificates', path: '/admin/certificates' },
  { slug: 'company-knowledge', path: '/admin/company-knowledge' },
  { slug: 'blog', path: '/admin/blog' },
  { slug: 'faqs', path: '/admin/faqs' },
  { slug: 'users', path: '/admin/users' },
  { slug: 'settings', path: '/admin/settings' },
];

const MOCK_DATA = {
  me: {
    id: 1,
    email: 'admin@exportb2b.com',
    name: 'Global Export Administrator',
    role: 'admin',
    department: 'Commercial Operations',
  },
  dashboard: {
    stats: {
      totalRfqs: 142,
      activeQuotes: 28,
      dispatchPending: 6,
      slaBreaches: 0,
      rfqChangePercent: 12.4,
      quoteChangePercent: 5.1,
      dispatchChangePercent: -2.0,
      slaStatus: 'healthy',
    },
    pipeline: {
      newInquiries: 14,
      underReview: 18,
      quoted: 24,
      contracted: 9,
      totalVolumeTons: 1420,
    },
    destinations: [
      { country: 'United States', code: 'US', inquiries: 42, volumeTons: 480, sharePercent: 34 },
      { country: 'Germany', code: 'DE', inquiries: 28, volumeTons: 310, sharePercent: 22 },
      { country: 'United Arab Emirates', code: 'AE', inquiries: 24, volumeTons: 260, sharePercent: 18 },
      { country: 'Japan', code: 'JP', inquiries: 16, volumeTons: 190, sharePercent: 14 },
      { country: 'Australia', code: 'AU', inquiries: 12, volumeTons: 180, sharePercent: 12 },
    ],
    recentDossiers: [
      {
        id: 'RFQ-2026-0891',
        buyerName: 'Nordic Pharma Supplies ApS',
        country: 'Denmark',
        productName: 'Castor Oil USP / EP Grade',
        quantity: '40 MT FCL',
        status: 'new',
        priority: 'urgent',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        slaHoursLeft: 6,
      },
      {
        id: 'RFQ-2026-0890',
        buyerName: 'EuroChem Specialties GmbH',
        country: 'Germany',
        productName: '12-Hydroxystearic Acid Flakes',
        quantity: '18 MT 20ft',
        status: 'in_review',
        priority: 'normal',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        slaHoursLeft: 14,
      },
      {
        id: 'RFQ-2026-0889',
        buyerName: 'Gulf Feed Solutions LLC',
        country: 'UAE',
        productName: 'Guar Meal Korma 50% Protein',
        quantity: '100 MT Breakbulk',
        status: 'quoted',
        priority: 'high',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        slaHoursLeft: 22,
      },
    ],
    expiringCertificates: [
      { id: 1, name: 'GMP+ Feed Safety Assurance B2', standard: 'GMP+ FSA', expiresAt: '2026-11-30', daysRemaining: 43 },
      { id: 2, name: 'HALAL Certification (JAKIM / MUI Recognised)', standard: 'JAKIM', expiresAt: '2026-12-15', daysRemaining: 58 },
    ],
  },
  inquiries: [
    {
      id: 'RFQ-2026-0891',
      buyer_name: 'Lars Mikkelsen',
      company_name: 'Nordic Pharma Supplies ApS',
      email: 'lars@nordicpharma.dk',
      country: 'Denmark',
      phone: '+45 32 10 99 88',
      product_name: 'Castor Oil USP / EP Grade',
      quantity: '40 MT FCL',
      destination_port: 'Port of Copenhagen (DKCPH)',
      incoterms: 'CIF Copenhagen',
      status: 'new',
      priority: 'urgent',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      message: 'Urgent spot enquiry for pharmaceutical grade castor oil. Need CoA and batch traceability documentation.',
      history: [
        { date: '2026-10-18 10:14', actor: 'Commercial Desk API', action: 'Inquiry received via B2B buyer portal' }
      ]
    },
    {
      id: 'RFQ-2026-0890',
      buyer_name: 'Dr. Klaus Becker',
      company_name: 'EuroChem Specialties GmbH',
      email: 'klaus.becker@eurochem.de',
      country: 'Germany',
      phone: '+49 40 88 12 34',
      product_name: '12-Hydroxystearic Acid Flakes',
      quantity: '18 MT 20ft',
      destination_port: 'Port of Hamburg (DEHAM)',
      incoterms: 'FOB Nhava Sheva',
      status: 'in_review',
      priority: 'normal',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      message: 'Looking for annual contract pricing on 12-HSA flakes in 25kg bags with palletisation.',
      history: [
        { date: '2026-10-18 07:30', actor: 'Commercial Desk API', action: 'Inquiry received' },
        { date: '2026-10-18 09:00', actor: 'Global Export Administrator', action: 'Assigned to European Sales Desk' }
      ]
    },
    {
      id: 'RFQ-2026-0889',
      buyer_name: 'Tariq Al-Mansoor',
      company_name: 'Gulf Feed Solutions LLC',
      email: 'tariq@gulffeed.ae',
      country: 'United Arab Emirates',
      phone: '+971 4 230 4567',
      product_name: 'Guar Meal Korma 50% Protein',
      quantity: '100 MT Breakbulk',
      destination_port: 'Jebel Ali (AEJEA)',
      incoterms: 'CIF Jebel Ali',
      status: 'quoted',
      priority: 'high',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      message: 'Spot shipment required before end of month for poultry feed mill blend.',
      history: [
        { date: '2026-10-17 18:00', actor: 'Commercial Desk API', action: 'Inquiry received' },
        { date: '2026-10-18 00:30', actor: 'Global Export Administrator', action: 'Formal pro-forma quotation dispatched' }
      ]
    }
  ],
  products: [
    {
      id: 1,
      name: 'Castor Oil First Special Grade (FSG)',
      slug: 'castor-oil-fsg',
      category: 'Oleochemicals & Derivatives',
      hs_code: '1515.30.90',
      purity: 'Min 99.0%',
      packaging: '200kg HDPE Drums / ISO Tanks / Flexitanks',
      moq: '20 Metric Tons (1x20ft FCL)',
      status: 'published',
      updated_at: '2026-10-16T12:00:00Z',
    },
    {
      id: 2,
      name: '12-Hydroxystearic Acid (12-HSA)',
      slug: '12-hydroxystearic-acid',
      category: 'Oleochemicals & Derivatives',
      hs_code: '2918.19.00',
      purity: 'Min 85.0% Hydroxyl Value',
      packaging: '25kg Paper Bags on Heat-Treated Pallets',
      moq: '18 Metric Tons',
      status: 'published',
      updated_at: '2026-10-15T09:30:00Z',
    },
    {
      id: 3,
      name: 'Guar Meal Korma 50% Roasted',
      slug: 'guar-meal-korma-50',
      category: 'Animal Feed Ingredients',
      hs_code: '2306.90.90',
      purity: 'Min 50.0% Crude Protein',
      packaging: '50kg HDPE / PP Bags',
      moq: '25 Metric Tons',
      status: 'published',
      updated_at: '2026-10-14T14:15:00Z',
    },
  ],
  categories: [
    {
      id: 1,
      name: 'Oleochemicals & Derivatives',
      slug: 'oleochemicals-and-derivatives',
      description: 'Industrial bio-based fatty acids, castor derivatives, and specialty esters.',
      product_count: 8,
      status: 'active',
    },
    {
      id: 2,
      name: 'Personal Care Raw Materials',
      slug: 'personal-care-raw-materials',
      description: 'USP / EP compliant cosmetic emollients, stabilizers, and natural waxes.',
      product_count: 12,
      status: 'active',
    },
    {
      id: 3,
      name: 'Animal Feed Ingredients',
      slug: 'animal-feed-ingredients',
      description: 'High-protein vegetable meals and grain derivatives for livestock and poultry.',
      product_count: 6,
      status: 'active',
    },
  ],
  certificates: [
    {
      id: 1,
      title: 'ISO 9001:2015 Quality Management',
      body: 'TUV SUD Certified',
      cert_number: 'QM-2024-8841',
      valid_from: '2024-01-01',
      valid_to: '2027-01-01',
      status: 'active',
    },
    {
      id: 2,
      title: 'GMP+ Feed Safety Assurance B2',
      body: 'GMP+ International Standard',
      cert_number: 'GMP-NL-2023-109',
      valid_from: '2023-11-30',
      valid_to: '2026-11-30',
      status: 'active',
    },
    {
      id: 3,
      title: 'HALAL Certification (MUI / JAKIM Compliant)',
      body: 'Halal Quality Control',
      cert_number: 'HQC-IND-2025-412',
      valid_from: '2025-01-15',
      valid_to: '2027-01-15',
      status: 'active',
    },
  ],
  knowledge: [
    {
      id: 1,
      title: 'Commercial Incoterms 2020 Standards & Maritime Logistics',
      category: 'Export Compliance',
      word_count: 1840,
      embedding_status: 'synced',
      last_synced: '2026-10-17T14:00:00Z',
    },
    {
      id: 2,
      title: 'Castor Oil FSG Technical Specifications & CoA Parameters',
      category: 'Product Specifications',
      word_count: 1250,
      embedding_status: 'synced',
      last_synced: '2026-10-16T11:30:00Z',
    },
    {
      id: 3,
      title: 'EU REACH Compliance & Safety Data Sheet Dossier',
      category: 'Regulatory Standards',
      word_count: 2420,
      embedding_status: 'synced',
      last_synced: '2026-10-15T18:20:00Z',
    },
  ],
  faqs: [
    {
      id: 1,
      question: 'What are your standard export payment and credit terms for international buyers?',
      answer: 'Standard export terms are Irrevocable Letter of Credit at sight (LC at Sight) confirmed by a first-class international bank, or 30% advance T/T with balance against copy of Bill of Lading.',
      category: 'Commercial & Payment',
      order: 1,
      status: 'published',
    },
    {
      id: 2,
      question: 'Which ports of dispatch do you operate from in India?',
      answer: 'Our principal containerized and ISO tank shipments dispatch through Port of Nhava Sheva (JNPT, Mumbai) and Port of Mundra (Gujarat).',
      category: 'Shipping & Logistics',
      order: 2,
      status: 'published',
    },
  ],
  blog: [
    {
      id: 1,
      title: 'Global Bio-Lubricant Demand & India Castor Derivatives Supply Outlook 2026',
      slug: 'global-castor-derivatives-outlook-2026',
      status: 'published',
      published_at: '2026-10-12T08:00:00Z',
      views: 1420,
    },
    {
      id: 2,
      title: 'Sustainable Packaging Innovations for Bulk Marine Export of Oleochemicals',
      slug: 'sustainable-bulk-packaging-export-2026',
      status: 'published',
      published_at: '2026-09-28T10:00:00Z',
      views: 980,
    },
  ],
  samples: [
    {
      id: 'SMP-2026-0042',
      buyer_name: 'Nordic Pharma Supplies ApS',
      product_name: 'Castor Oil USP Grade (Sample 500ml)',
      destination: 'Copenhagen, Denmark',
      courier_tracking: 'DHL-EXPRESS-99882211',
      status: 'dispatched',
      created_at: '2026-10-16T08:30:00Z',
    },
    {
      id: 'SMP-2026-0041',
      buyer_name: 'Kyoto Chemical Industries',
      product_name: '12-HSA Flakes (Sample 250g)',
      destination: 'Osaka, Japan',
      courier_tracking: 'FEDEX-INTL-44118822',
      status: 'delivered',
      created_at: '2026-10-14T11:00:00Z',
    },
  ],
  users: [
    {
      id: 1,
      name: 'Global Export Administrator',
      email: 'admin@exportb2b.com',
      role: 'admin',
      status: 'active',
      last_login: '2026-10-18T07:45:00Z',
    },
    {
      id: 2,
      name: 'Rajesh Varma (Commercial Desk Lead)',
      email: 'rvarma@exportb2b.com',
      role: 'sales',
      status: 'active',
      last_login: '2026-10-18T06:12:00Z',
    },
    {
      id: 3,
      name: 'Elena Rostova (Compliance & Catalog Editor)',
      email: 'erostova@exportb2b.com',
      role: 'editor',
      status: 'active',
      last_login: '2026-10-17T15:20:00Z',
    },
  ],
  settings: {
    brand_name: 'JHS GLOBAL',
    corporate_legal_name: 'JHS GLOBAL EXPORTS PRIVATE LIMITED',
    gstin: '24AAACJ1234F1Z8',
    iec_code: '0308012345',
    corporate_email: 'exports@jshglobal.com',
    corporate_phone: '+91 22 2840 1234',
    headquarters_address: '704 Corporate Park, Bandra-Kurla Complex, Mumbai 400051, India',
    timezone: 'Asia/Kolkata (IST)',
    currency: 'USD',
  },
};

async function main() {
  const outputBase = path.resolve('baselines', 'admin-after');
  console.log(`Ensuring admin-after baseline dir: ${outputBase}`);
  fs.mkdirSync(outputBase, { recursive: true });

  const server = createSpaServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Preview static server listening on port ${PORT}`);

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Capturing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const vpDir = path.join(outputBase, vp.name);
    fs.mkdirSync(vpDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    // Mock API requests so that admin pages render realistic populated states
    await context.route('**/api/v1/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/auth/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_DATA.me }),
        });
      }
      if (url.includes('/auth/login')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { accessToken: 'mock_jwt_token_admin', user: MOCK_DATA.me },
          }),
        });
      }
      if (url.includes('/admin/dashboard')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_DATA.dashboard }),
        });
      }
      if (url.includes('/admin/inquiries')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.inquiries,
            meta: { total: MOCK_DATA.inquiries.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/samples')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.samples,
            meta: { total: MOCK_DATA.samples.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/products')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.products,
            meta: { total: MOCK_DATA.products.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/categories')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.categories,
            meta: { total: MOCK_DATA.categories.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/certificates')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.certificates,
            meta: { total: MOCK_DATA.certificates.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/company-knowledge')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.knowledge,
            meta: { total: MOCK_DATA.knowledge.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/faqs')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.faqs,
            meta: { total: MOCK_DATA.faqs.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/blog')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.blog,
            meta: { total: MOCK_DATA.blog.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/users')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.users,
            meta: { total: MOCK_DATA.users.length, page: 1, limit: 20, pages: 1 },
          }),
        });
      }
      if (url.includes('/admin/settings')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: MOCK_DATA.settings,
          }),
        });
      }

      // Default fallback for any other admin api endpoint
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // Seed session token
    await context.addInitScript(() => {
      window.sessionStorage.setItem('admin_token', 'mock_jwt_token_admin');
    });

    const page = await context.newPage();

    for (const r of ADMIN_PAGES) {
      console.log(`  Capturing [${r.slug}] at ${r.path} (${vp.name}px)...`);
      try {
        await page.goto(`http://localhost:${PORT}${r.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(vpDir, `${r.slug}.png`), fullPage: true });

        // On 1440px dashboard, also test command palette
        if (r.slug === 'dashboard' && vp.name === '1440') {
          const cmdTrigger = page.locator('button:has-text("Search commands"), button:has-text("Ctrl+K")').first();
          if (await cmdTrigger.isVisible()) {
            await cmdTrigger.click();
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(vpDir, 'dashboard-command-palette.png') });
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
          }
        }

        // On 390px dashboard, also test mobile navigation drawer
        if (r.slug === 'dashboard' && vp.name === '390') {
          const menuBtn = page.locator('button[aria-label="Toggle Navigation Menu"]');
          if (await menuBtn.isVisible()) {
            await menuBtn.click();
            await page.waitForTimeout(400);
            await page.screenshot({ path: path.join(vpDir, 'dashboard-mobile-menu.png') });
            await menuBtn.click();
            await page.waitForTimeout(200);
          }
        }
      } catch (err) {
        console.error(`  Error capturing ${r.slug} at ${vp.name}px:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();
  server.close();
  console.log('\nAll Phase 2 "After" screenshots captured successfully in baselines/admin-after/!');
}

main().catch((err) => {
  console.error('Fatal error during after-screenshot capture:', err);
  process.exit(1);
});
