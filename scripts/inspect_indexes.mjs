import { sequelize, connectDB, disconnectDB } from '../server/src/config/db.js';

async function main() {
  await connectDB();
  const [indexes] = await sequelize.query(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename IN ('products', 'inquiries', 'categories', 'quotations')
    ORDER BY tablename, indexname;
  `);
  console.log(JSON.stringify(indexes, null, 2));
  await disconnectDB();
}

main().catch(console.error);
