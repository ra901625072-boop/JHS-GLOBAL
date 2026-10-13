import fs from 'fs';
import { sequelize, connectDB, disconnectDB } from '../server/src/config/db.js';

async function run() {
  console.log('Connecting to PostgreSQL for database baseline analysis...');
  await connectDB();

  // 1. Table and Index Sizes
  const [tableSizes] = await sequelize.query(`
    SELECT
      relname AS table_name,
      pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
      pg_size_pretty(pg_relation_size(relid)) AS table_size,
      pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size,
      pg_total_relation_size(relid) AS total_bytes
    FROM pg_catalog.pg_statio_user_tables
    ORDER BY pg_total_relation_size(relid) DESC;
  `);

  // 2. Index Usage and Unused Indexes
  const [indexStats] = await sequelize.query(`
    SELECT
      relname AS table_name,
      indexrelname AS index_name,
      idx_scan AS number_of_scans,
      idx_tup_read AS tuples_read,
      idx_tup_fetch AS tuples_fetched
    FROM pg_stat_user_indexes
    ORDER BY idx_scan ASC, relname ASC;
  `);

  // 3. EXPLAIN (ANALYZE, BUFFERS) for key queries
  const queryPlans = {};

  const sampleQueries = [
    {
      name: 'categories_active_order',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM categories WHERE is_active = true ORDER BY "order" ASC;`,
    },
    {
      name: 'products_catalogue_list',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id, title, slug, is_active FROM products WHERE is_active = true LIMIT 12;`,
    },
    {
      name: 'product_detail_by_slug',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM products WHERE slug = 'castor-oil' LIMIT 1;`,
    },
    {
      name: 'inquiries_recent_list',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id, reference_no, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 10;`,
    },
  ];

  for (const q of sampleQueries) {
    try {
      const [res] = await sequelize.query(q.sql);
      queryPlans[q.name] = res[0]['QUERY PLAN'];
    } catch (err) {
      queryPlans[q.name] = { error: err.message };
    }
  }

  // 4. pg_stat_statements check
  let statStatements = [];
  try {
    const [res] = await sequelize.query(`
      SELECT query, calls, total_exec_time, mean_exec_time, rows
      FROM pg_stat_statements
      ORDER BY total_exec_time DESC
      LIMIT 10;
    `);
    statStatements = res;
  } catch (err) {
    statStatements = [{ note: 'pg_stat_statements not enabled in this database role', error: err.message }];
  }

  if (!fs.existsSync('baselines/database')) fs.mkdirSync('baselines/database', { recursive: true });

  fs.writeFileSync(
    'baselines/database/storage-stats.json',
    JSON.stringify({ timestamp: new Date().toISOString(), tableSizes, indexStats }, null, 2)
  );

  fs.writeFileSync(
    'baselines/database/query-plans.json',
    JSON.stringify({ timestamp: new Date().toISOString(), queryPlans, statStatements }, null, 2)
  );

  console.log('Successfully recorded baselines/database/storage-stats.json and query-plans.json');
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('Database measurement error:', err);
  process.exit(1);
});
