import { sequelize, connectDB, disconnectDB } from '../server/src/config/db.js';

const queries = [
  {
    name: 'categories_active_order',
    sql: 'EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM categories WHERE is_active = true ORDER BY "order" ASC;',
  },
  {
    name: 'products_by_category',
    sql: 'EXPLAIN (ANALYZE, BUFFERS) SELECT id, name, slug, is_active FROM products WHERE is_active = true AND category_id = 1;',
  },
  {
    name: 'inquiries_status_created',
    sql: "EXPLAIN (ANALYZE, BUFFERS) SELECT id, reference_no, status, created_at FROM inquiries WHERE status = 'new' ORDER BY created_at DESC LIMIT 20;",
  },
  {
    name: 'products_trgm_search',
    sql: "EXPLAIN (ANALYZE, BUFFERS) SELECT id, name, slug FROM products WHERE name ILIKE '%oil%';",
  },
];

async function measure(phase) {
  console.log(`\n=== Measuring Query Plans (${phase}) ===`);
  const results = {};
  for (const q of queries) {
    try {
      const [rows] = await sequelize.query(q.sql);
      const planText = rows.map((r) => r['QUERY PLAN']).join('\n');
      console.log(`\n--- ${q.name} ---`);
      console.log(planText);
      results[q.name] = planText;
    } catch (err) {
      console.error(`Error in ${q.name}:`, err.message);
      results[q.name] = { error: err.message };
    }
  }
  return results;
}

async function main() {
  await connectDB();
  await measure('BEFORE INDEXES');
  await disconnectDB();
}

main().catch(console.error);
