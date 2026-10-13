import connectDB, { disconnectDB } from '../config/db.js';
import '../models/index.js';
import logger from '../utils/logger.js';
import seedCategories from './category.seed.js';
import seedProducts from './product.seed.js';
import seedCertificates from './certificate.seed.js';
import seedTrustData from './trust.seed.js';
import seedAdminUsers from './admin.seed.js';
import seedBlogPosts from './blog.seed.js';
import seedCompanyFacts from './companyFact.seed.js';

export const runSeeds = async () => {
  try {
    logger.info('Starting database seeding...');
    await connectDB();

    const categoryMap = await seedCategories();
    await seedProducts(categoryMap);
    await seedCertificates();
    await seedTrustData();
    await seedAdminUsers();
    await seedBlogPosts();
    await seedCompanyFacts();

    logger.info('All seed tasks completed successfully.');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

const isMainScript =
  import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` ||
  process.argv[1]?.replace(/\\/g, '/').endsWith('seeds/index.js');

if (isMainScript) {
  runSeeds()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export default runSeeds;
