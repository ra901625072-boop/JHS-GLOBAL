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
  ...(isCloudDB && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
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

    // Sync all models (create tables if they don't exist)
    if (env.NODE_ENV !== 'production') {
      await sequelize.sync();
      logger.info('Database tables synced');
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
