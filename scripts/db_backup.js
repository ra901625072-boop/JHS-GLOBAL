import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sequelize } from '../server/src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupDir = path.resolve(__dirname, '../backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function runBackup() {
  console.log('--- Starting PostgreSQL Verified Backup ---');
  await sequelize.authenticate();
  console.log('Connected to database.');

  const [tables] = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  for (const { table_name } of tables) {
    const [rows] = await sequelize.query(`SELECT * FROM "${table_name}";`);
    backupData.tables[table_name] = rows;
    console.log(`  Backed up table ${table_name}: ${rows.length} rows`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `db_backup_${timestamp}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✓ Backup successfully written to ${backupFilePath}`);
  console.log(`✓ Total tables backed up: ${Object.keys(backupData.tables).length}`);
  process.exit(0);
}

runBackup().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
