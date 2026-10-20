import crypto from 'crypto';
import Embedding from '../embedding.model.js';
import Product from '../../product/product.model.js';
import Faq from '../../faq/faq.model.js';
import { generateEmbedding, cosineSimilarity } from '../ai.provider.js';
import logger from '../../../utils/logger.js';

import { generateGroundedProductChunk } from '../../product/productFact.mapper.js';

/**
 * Computes deterministic SHA-256 hash to avoid re-embedding unchanged documents
 */
export const computeChunkHash = (text = '') => {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
};

/**
 * Creates structured B2B export chunk text for a Product document
 */
export const chunkProduct = (product) => {
  return generateGroundedProductChunk(product);
};

/**
 * Creates structured chunk text for an Export FAQ
 */
export const chunkFaq = (faq) => {
  return `
EXPORT TRADE FAQ
Category: ${faq.group || 'Commercial'}
Question: ${faq.question}
Answer: ${faq.answer}
`.trim();
};

/**
 * Creates structured B2B chunk text for a Company Knowledge Base Fact
 */
export const chunkCompanyFact = (fact) => {
  return `
COMPANY KNOWLEDGE BASE FACT
Fact ID: FACT-COMP-${fact.factKey || fact.id}
Category: ${fact.category}
Topic: ${fact.label}
Value: ${fact.factValue}
Verification Status: ${fact.isVerified ? 'VERIFIED' : 'UNVERIFIED / ESTIMATE'}
Source: ${fact.sourceDocument || fact.source || 'Official company profile'}
Notes: ${fact.notes || 'None'}
`.trim();
};

/**
 * Sync embedding for a single company fact (skips if text unchanged)
 */
export const syncCompanyFactEmbedding = async (fact) => {
  const factId = fact?.id || fact?._id;
  if (!factId) return null;

  const chunkText = chunkCompanyFact(fact);
  const hash = computeChunkHash(chunkText);

  const existing = await Embedding.findOne({
    where: { sourceType: 'company_fact', sourceId: factId },
  });
  if (existing && existing.hash === hash) {
    return { skipped: true, id: existing.id };
  }

  const vector = await generateEmbedding(chunkText);

  const payload = {
    sourceType: 'company_fact',
    sourceId: factId,
    chunkText,
    chunkIndex: 0,
    vector,
    hash,
    metadata: {
      factKey: fact.factKey,
      label: fact.label,
      category: fact.category,
      isVerified: Boolean(fact.isVerified),
      isPublic: Boolean(fact.isPublic),
    },
  };

  let record;
  if (existing) {
    record = await existing.update(payload);
  } else {
    record = await Embedding.create(payload);
  }

  return { skipped: false, id: record.id };
};

/**
 * Remove embedding when a company fact is deleted
 */
export const deleteCompanyFactEmbedding = async (factId) => {
  if (!factId) return;
  await Embedding.destroy({
    where: { sourceType: 'company_fact', sourceId: factId },
  });
};

/**
 * Sync embedding for a single product (skips if text unchanged)
 */
export const syncProductEmbedding = async (product) => {
  const productId = product?.id || product?._id;
  if (!productId) return null;

  const chunkText = chunkProduct(product);
  const hash = computeChunkHash(chunkText);

  // Check if existing record has identical hash
  const existing = await Embedding.findOne({
    where: { sourceType: 'product', sourceId: productId },
  });
  if (existing && existing.hash === hash) {
    return { skipped: true, id: existing.id };
  }

  const vector = await generateEmbedding(chunkText);

  const payload = {
    sourceType: 'product',
    sourceId: productId,
    chunkText,
    chunkIndex: 0,
    vector,
    hash,
    metadata: {
      name: product.name,
      slug: product.slug,
      hsCode: product.hsCode || '',
      category: product.categoryId ? String(product.categoryId) : '',
    },
  };

  let record;
  if (existing) {
    record = await existing.update(payload);
  } else {
    record = await Embedding.create(payload);
  }

  return { skipped: false, id: record.id };
};

/**
 * Remove embedding when a product is deleted or deactivated
 */
export const deleteProductEmbedding = async (productId) => {
  if (!productId) return;
  await Embedding.destroy({
    where: { sourceType: 'product', sourceId: productId },
  });
};

/**
 * Sync embedding for a single FAQ (skips if text unchanged)
 */
export const syncFaqEmbedding = async (faq) => {
  const faqId = faq?.id || faq?._id;
  if (!faqId) return null;

  const chunkText = chunkFaq(faq);
  const hash = computeChunkHash(chunkText);

  const existing = await Embedding.findOne({
    where: { sourceType: 'faq', sourceId: faqId },
  });
  if (existing && existing.hash === hash) {
    return { skipped: true, id: existing.id };
  }

  const vector = await generateEmbedding(chunkText);

  const payload = {
    sourceType: 'faq',
    sourceId: faqId,
    chunkText,
    chunkIndex: 0,
    vector,
    hash,
    metadata: {
      name: faq.question,
      group: faq.group || 'General',
    },
  };

  let record;
  if (existing) {
    record = await existing.update(payload);
  } else {
    record = await Embedding.create(payload);
  }

  return { skipped: false, id: record.id };
};

/**
 * Remove embedding when a FAQ is deleted or deactivated
 */
export const deleteFaqEmbedding = async (faqId) => {
  if (!faqId) return;
  await Embedding.destroy({
    where: { sourceType: 'faq', sourceId: faqId },
  });
};

/**
 * Reindexes all active products, FAQs, and public company facts in the database
 */
export const reindexAllCatalogue = async () => {
  logger.info('Starting full catalogue RAG vector reindexing...');
  
  let CompanyFactModel = null;
  try {
    const mod = await import('../../companyFact/companyFact.model.js');
    CompanyFactModel = mod.default || mod.CompanyFact;
  } catch (err) {
    logger.warn(`CompanyFact model not available for reindexing: ${err.message}`);
  }

  const [products, faqs, companyFacts] = await Promise.all([
    Product.findAll({ where: { isActive: true } }),
    Faq.findAll({ where: { isActive: true } }),
    CompanyFactModel ? CompanyFactModel.findAll({ where: { isPublic: true } }) : Promise.resolve([]),
  ]);

  let indexedProducts = 0;
  let skippedProducts = 0;
  for (const p of products) {
    const res = await syncProductEmbedding(p.toJSON());
    if (res?.skipped) skippedProducts++;
    else indexedProducts++;
  }

  let indexedFaqs = 0;
  let skippedFaqs = 0;
  for (const f of faqs) {
    const res = await syncFaqEmbedding(f.toJSON());
    if (res?.skipped) skippedFaqs++;
    else indexedFaqs++;
  }

  let indexedCompanyFacts = 0;
  let skippedCompanyFacts = 0;
  for (const cf of companyFacts) {
    const res = await syncCompanyFactEmbedding(cf.toJSON ? cf.toJSON() : cf);
    if (res?.skipped) skippedCompanyFacts++;
    else indexedCompanyFacts++;
  }

  const totalEmbeddings = await Embedding.count();
  logger.info(
    `RAG indexing complete: ${indexedProducts} products (${skippedProducts} skipped), ${indexedFaqs} FAQs (${skippedFaqs} skipped), ${indexedCompanyFacts} company facts (${skippedCompanyFacts} skipped). Total embeddings: ${totalEmbeddings}`
  );

  return {
    indexedProducts,
    skippedProducts,
    indexedFaqs,
    skippedFaqs,
    indexedCompanyFacts,
    skippedCompanyFacts,
    totalEmbeddings,
  };
};

/**
 * Vector similarity search over catalogue embeddings
 */
export const searchSimilarChunks = async ({ query, limit = 4, minSimilarity = 0.5, sourceType = null }) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const queryVector = await generateEmbedding(query);
  const where = {};
  if (sourceType) {
    where.sourceType = sourceType;
  }

  const allEmbeddings = await Embedding.findAll({
    where,
    attributes: ['sourceType', 'sourceId', 'chunkText', 'metadata', 'vector'],
  });

  if (allEmbeddings.length === 0) {
    return [];
  }

  const scored = allEmbeddings.map((emb) => {
    const plain = emb.toJSON();
    return {
      sourceType: plain.sourceType,
      sourceId: plain.sourceId,
      chunkText: plain.chunkText,
      metadata: plain.metadata,
      similarity: cosineSimilarity(queryVector, plain.vector),
    };
  });

  // Sort by similarity score descending
  scored.sort((a, b) => b.similarity - a.similarity);

  const topMatches = scored.filter((item) => item.similarity >= minSimilarity).slice(0, limit);
  return topMatches;
};

export default {
  computeChunkHash,
  chunkProduct,
  chunkFaq,
  chunkCompanyFact,
  syncProductEmbedding,
  deleteProductEmbedding,
  syncFaqEmbedding,
  deleteFaqEmbedding,
  syncCompanyFactEmbedding,
  deleteCompanyFactEmbedding,
  reindexAllCatalogue,
  searchSimilarChunks,
};
