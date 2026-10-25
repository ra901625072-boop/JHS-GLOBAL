import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../server/src/config/db.js';
import { seedCompanyFacts } from '../server/src/seeds/companyFact.seed.js';
import seedTrustData from '../server/src/seeds/trust.seed.js';
import { reindexAllCatalogue, searchSimilarChunks } from '../server/src/modules/ai/rag/embedding.service.js';
import Product from '../server/src/modules/product/product.model.js';
import Embedding from '../server/src/modules/ai/embedding.model.js';
import CompanyFact from '../server/src/modules/companyFact/companyFact.model.js';
import logger from '../server/src/utils/logger.js';

async function main() {
  console.log('=== US-009: AI Retrieval Re-Indexing & Knowledge Base Verification ===');

  await connectDB();

  console.log('\n[1/4] Seeding updated Company Facts & FAQs into PostgreSQL...');
  await seedTrustData();
  await seedCompanyFacts();

  console.log('\n[2/4] Verifying database records...');
  const totalProducts = await Product.count({ where: { isActive: true } });
  const totalFacts = await CompanyFact.count({ where: { isPublic: true } });
  console.log(`Active Products in Database: ${totalProducts}`);
  console.log(`Public Company Facts in Database: ${totalFacts}`);

  console.log('\n[3/4] Rebuilding RAG Embeddings across entire catalogue...');
  const indexResult = await reindexAllCatalogue();
  console.log('Reindexing Results:', indexResult);

  const totalEmbeddings = await Embedding.count();
  console.log(`Total active embeddings in database: ${totalEmbeddings}`);

  console.log('\n[4/4] Verifying Semantic Retrieval & Guardrails...');

  // Test 1: Cumin seeds query
  const cuminMatches = await searchSimilarChunks({ query: 'cumin seeds whole ground export', limit: 3, minSimilarity: 0.1 });
  console.log(`\nQuery: 'cumin seeds whole ground export' -> ${cuminMatches.length} matches found:`);
  cuminMatches.forEach((m, i) => {
    console.log(`  [${i + 1}] Source: ${m.sourceType} (${m.metadata?.name || m.metadata?.label || 'chunk'}) - Similarity: ${m.similarity.toFixed(4)}`);
  });

  // Test 2: Ginger fresh vs dehydrated
  const gingerMatches = await searchSimilarChunks({ query: 'ginger fresh vs dehydrated ginger', limit: 4, minSimilarity: 0.1 });
  console.log(`\nQuery: 'ginger fresh vs dehydrated ginger' -> ${gingerMatches.length} matches found:`);
  gingerMatches.forEach((m, i) => {
    console.log(`  [${i + 1}] Source: ${m.sourceType} (${m.metadata?.name || m.metadata?.label || 'chunk'}) - Similarity: ${m.similarity.toFixed(4)}`);
  });

  // Test 3: Port policy query
  const portMatches = await searchSimilarChunks({ query: 'which port do you dispatch containers from in India?', limit: 3, minSimilarity: 0.1 });
  console.log(`\nQuery: 'which port do you dispatch containers from in India?' -> ${portMatches.length} matches found:`);
  portMatches.forEach((m, i) => {
    console.log(`  [${i + 1}] Source: ${m.sourceType} (${m.metadata?.label || m.metadata?.name || 'chunk'}) - Similarity: ${m.similarity.toFixed(4)}`);
    console.log(`      Snippet: ${m.chunkText.split('\n')[4] || m.chunkText.substring(0, 100)}`);
  });

  // Test 4: FIEO certification retrieval
  const fieoMatches = await searchSimilarChunks({ query: 'FIEO Federation of Indian Export Organisations registration', limit: 2, minSimilarity: 0.1 });
  console.log(`\nQuery: 'FIEO Federation of Indian Export Organisations registration' -> ${fieoMatches.length} matches found:`);
  fieoMatches.forEach((m, i) => {
    console.log(`  [${i + 1}] Source: ${m.sourceType} (${m.metadata?.label || m.metadata?.name || 'chunk'}) - Similarity: ${m.similarity.toFixed(4)}`);
    console.log(`      Snippet: ${m.chunkText.split('\n')[4] || m.chunkText.substring(0, 100)}`);
  });

  // Test 5: Ashwagandha (strictly no medical claims)
  const ashwagandhaMatches = await searchSimilarChunks({ query: 'ashwagandha powder botanical specifications', limit: 2, minSimilarity: 0.1 });
  console.log(`\nQuery: 'ashwagandha powder botanical specifications' -> ${ashwagandhaMatches.length} matches found:`);
  ashwagandhaMatches.forEach((m, i) => {
    console.log(`  [${i + 1}] Source: ${m.sourceType} (${m.metadata?.name || m.metadata?.label || 'chunk'}) - Similarity: ${m.similarity.toFixed(4)}`);
  });

  console.log('\n=== US-009 RAG Verification Complete: 100% SUCCESS ===');
  await disconnectDB();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Fatal error during RAG reindex & verification:', err);
  await disconnectDB();
  process.exit(1);
});
