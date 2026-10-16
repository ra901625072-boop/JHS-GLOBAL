import { Sequelize } from 'sequelize';
import env from './env.js';
import logger from '../utils/logger.js';

const isCloudDB =
  env.DATABASE_URL.includes('sslmode=require') ||
  (!env.DATABASE_URL.includes('localhost') &&
    !env.DATABASE_URL.includes('127.0.0.1') &&
    !env.DATABASE_URL.includes('@postgres:'));

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: env.NODE_ENV === 'test' ? 3 : 10,
    min: 0,
    acquire: 30000,
    idle: 5000,
  },
  define: {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  },
  dialectOptions: {
    statement_timeout: 15000,
    ...(isCloudDB && {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }),
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`PostgreSQL connected: ${sequelize.config.host}/${sequelize.config.database}`);

    // Ensure PostgreSQL extensions exist if user has permission
    try {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm";');
    } catch (extErr) {
      logger.debug(`PostgreSQL extension check notice: ${extErr.message}`);
    }

    // Sync all models (create tables if they don't exist in development)
    if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') {
      try {
        await sequelize.query(`
          ALTER TABLE faqs ADD COLUMN IF NOT EXISTS slug VARCHAR(150);
          ALTER TABLE faqs ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT false;
          ALTER TABLE faqs ADD COLUMN IF NOT EXISTS home_order INTEGER DEFAULT 0;
        `);
      } catch (migErr) {
        logger.debug(`Faq table migration note: ${migErr.message}`);
      }
      await sequelize.sync();
      logger.info('Database tables synced');

      // Idempotently add high-performance database indexes
      try {
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS idx_products_is_active_category_id ON products (is_active, category_id);
          CREATE INDEX IF NOT EXISTS idx_products_is_active_sub_category_id ON products (is_active, sub_category_id);
          CREATE INDEX IF NOT EXISTS idx_products_is_active_is_featured ON products (is_active, is_featured);
          CREATE INDEX IF NOT EXISTS idx_products_is_active_created_at ON products (is_active, created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products (hs_code);
          CREATE INDEX IF NOT EXISTS idx_categories_is_active_parent_id_order ON categories (is_active, parent_id, "order");
          CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
          CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON blog_posts (status, published_at DESC);
          CREATE INDEX IF NOT EXISTS idx_certificates_is_active_order ON certificates (is_active, "order");
        `);
      } catch (idxErr) {
        logger.debug(`Index initialization note: ${idxErr.message}`);
      }
    }

    return sequelize;
  } catch (error) {
    const detail = error.parent?.message || error.original?.message || error.message || error.name;
    logger.error(`PostgreSQL connection error: ${detail}`);
    logger.error(`Target database: ${env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
    logger.error('Please verify that your PostgreSQL service is running on port 5432 or update DATABASE_URL in server/.env.');
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await sequelize.close();
    logger.info('PostgreSQL connection closed gracefully');
  } catch (error) {
    logger.error(`Error closing PostgreSQL connection: ${error.message}`);
  }
};

export { sequelize };
export default connectDB;
