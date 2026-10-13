import connectDB, { disconnectDB } from '../src/config/db.js';
import {
  sequelize,
  Category,
  Product,
  ProductImage,
  ProductSpec,
  ProductPackingOption,
  ProductCertificate,
  Embedding,
} from '../src/models/index.js';
import cacheService from '../src/services/cache.service.js';
import logger from '../src/utils/logger.js';

async function migrateRemoveLegacyData() {
  const transaction = await sequelize.transaction();
  try {
    logger.info('Starting legacy catalogue data removal...');
    await connectDB();

    console.log('1. Checking child tables and references...');
    // Delete product child table entries if any
    await ProductImage.destroy({ where: {}, truncate: false, transaction });
    await ProductSpec.destroy({ where: {}, truncate: false, transaction });
    await ProductPackingOption.destroy({ where: {}, truncate: false, transaction });
    await ProductCertificate.destroy({ where: {}, truncate: false, transaction });

    console.log('2. Deleting legacy products...');
    const deletedProductsCount = await Product.destroy({
      where: {},
      truncate: false,
      transaction,
    });
    console.log(`Deleted ${deletedProductsCount} legacy products.`);

    console.log('3. Deleting legacy categories...');
    // Delete child categories first (level 2) to respect self-referencing FK
    const deletedSubCats = await Category.destroy({
      where: { level: 2 },
      truncate: false,
      transaction,
    });
    console.log(`Deleted ${deletedSubCats} subcategories.`);

    // Delete root categories (level 1)
    const deletedRootCats = await Category.destroy({
      where: {},
      truncate: false,
      transaction,
    });
    console.log(`Deleted ${deletedRootCats} root categories.`);

    console.log('4. Clearing legacy embeddings & vector indexes...');
    const deletedEmbeddingsCount = await Embedding.destroy({
      where: {},
      truncate: false,
      transaction,
    });
    console.log(`Deleted ${deletedEmbeddingsCount} legacy embeddings.`);

    await transaction.commit();
    logger.info('Database transaction committed successfully.');

    console.log('5. Flushing application and query cache...');
    await cacheService.flush();
    console.log('Cache flushed.');

    console.log('--- MIGRATION REMOVAL COMPLETE ---');
    console.log(`Products remaining in DB:   ${await Product.count()}`);
    console.log(`Categories remaining in DB: ${await Category.count()}`);
    console.log(`Embeddings remaining in DB: ${await Embedding.count()}`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    logger.error('Migration removal failed, transaction rolled back:', error);
    console.error('Migration removal failed, transaction rolled back:', error);
    process.exit(1);
  }
}

migrateRemoveLegacyData();
