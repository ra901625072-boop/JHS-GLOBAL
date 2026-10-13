import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB, { disconnectDB } from '../src/config/db.js';
import {
  Category,
  Product,
  Certificate,
  BlogPost,
  Faq,
  Testimonial,
} from '../src/models/index.js';
import logger from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBackup() {
  try {
    logger.info('Starting full pre-migration catalogue backup...');
    await connectDB();

    const [categories, products, certificates, blogPosts, faqs, testimonials] =
      await Promise.all([
        Category.findAll({ raw: true }),
        Product.findAll({ raw: true }),
        Certificate.findAll({ raw: true }),
        BlogPost.findAll({ raw: true }),
        Faq.findAll({ raw: true }),
        Testimonial.findAll({ raw: true }),
      ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      metadata: {
        description: 'Complete backup of legacy 10-category, 84-commodity catalogue before migration to 3-category 20-product raw materials catalogue.',
        counts: {
          categories: categories.length,
          products: products.length,
          certificates: certificates.length,
          blogPosts: blogPosts.length,
          faqs: faqs.length,
          testimonials: testimonials.length,
        },
      },
      categories,
      products,
      certificates,
      blogPosts,
      faqs,
      testimonials,
    };

    const backupDir = path.resolve(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(
      backupDir,
      `catalogue-backup-pre-migration-${Date.now()}.json`
    );
    const latestPath = path.join(
      backupDir,
      'catalogue-backup-pre-migration-latest.json'
    );

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
    fs.writeFileSync(latestPath, JSON.stringify(backupData, null, 2), 'utf8');

    logger.info(`Backup written successfully to: ${backupPath}`);
    logger.info(`Latest symlink/copy written to: ${latestPath}`);
    console.log('--- BACKUP SUMMARY ---');
    console.log(`Categories:   ${categories.length}`);
    console.log(`Products:     ${products.length}`);
    console.log(`Certificates: ${certificates.length}`);
    console.log(`Blog Posts:   ${blogPosts.length}`);
    console.log(`FAQs:         ${faqs.length}`);
    console.log(`Testimonials: ${testimonials.length}`);
    console.log(`Saved to: ${backupPath} (${(fs.statSync(backupPath).size / 1024).toFixed(1)} KB)`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Backup failed:', error);
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

runBackup();
