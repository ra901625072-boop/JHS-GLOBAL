import { sequelize, connectDB, disconnectDB } from '../server/src/config/db.js';

const indexes = [
  {
    name: 'idx_categories_active_order',
    sql: 'CREATE INDEX IF NOT EXISTS idx_categories_active_order ON categories (is_active, "order" ASC);',
  },
  {
    name: 'idx_products_active_category',
    sql: 'CREATE INDEX IF NOT EXISTS idx_products_active_category ON products (category_id, is_active);',
  },
  {
    name: 'idx_inquiries_status_created',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries (status, created_at DESC);',
  },
  {
    name: 'idx_products_name_trgm',
    sql: 'CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);',
  },
  {
    name: 'idx_inquiries_assigned_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_status ON inquiries (assigned_to, status);',
  },
  {
    name: 'idx_quotations_customer_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_quotations_customer_status ON quotations (customer_id, status);',
  },
];

async function applyIndexes() {
  await connectDB();
  console.log('Applying targeted non-destructive PostgreSQL indexes...');

  for (const idx of indexes) {
    console.log(`Applying: ${idx.name}`);
    await sequelize.query(idx.sql);
  }

  console.log('All indexes created successfully.');

  // Run ANALYZE to update PostgreSQL optimizer table statistics
  await sequelize.query('ANALYZE categories;');
  await sequelize.query('ANALYZE products;');
  await sequelize.query('ANALYZE inquiries;');
  await sequelize.query('ANALYZE quotations;');
  console.log('Table statistics refreshed (ANALYZE).');

  await disconnectDB();
}

applyIndexes().catch(console.error);
