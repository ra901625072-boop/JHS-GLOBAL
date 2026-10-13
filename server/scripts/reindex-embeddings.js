import connectDB, { disconnectDB } from '../src/config/db.js';
import { reindexAllCatalogue } from '../src/modules/ai/rag/embedding.service.js';
import Embedding from '../src/modules/ai/embedding.model.js';
import logger from '../src/utils/logger.js';

async function run() {
  await connectDB();
  logger.info('Starting full catalogue embedding re-indexing...');
  const result = await reindexAllCatalogue();
  console.log('Reindexing result:', JSON.stringify(result, null, 2));
  const total = await Embedding.count();
  console.log(`Total embeddings now stored in database: ${total}`);
  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Reindexing error:', err);
  try {
    await disconnectDB();
  } catch (_) {}
  process.exit(1);
});
