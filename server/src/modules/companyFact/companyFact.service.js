import { Op } from 'sequelize';
import CompanyFact from './companyFact.model.js';
import { syncCompanyFactEmbedding, deleteCompanyFactEmbedding } from '../ai/rag/embedding.service.js';
import logger from '../../utils/logger.js';

export const listFacts = async ({
  category,
  isVerified,
  isPublic,
  search,
  limit = 100,
  offset = 0,
} = {}) => {
  const where = {};

  if (category) {
    where.category = category;
  }
  if (typeof isVerified === 'boolean') {
    where.isVerified = isVerified;
  }
  if (typeof isPublic === 'boolean') {
    where.isPublic = isPublic;
  }
  if (search && search.trim()) {
    const s = search.trim();
    where[Op.or] = [
      { factKey: { [Op.iLike]: `%${s}%` } },
      { label: { [Op.iLike]: `%${s}%` } },
      { factValue: { [Op.iLike]: `%${s}%` } },
    ];
  }

  const { rows, count } = await CompanyFact.findAndCountAll({
    where,
    order: [
      ['category', 'ASC'],
      ['is_verified', 'DESC'],
      ['fact_key', 'ASC'],
    ],
    limit,
    offset,
  });

  return { facts: rows, total: count };
};

export const getPublicVerifiedFacts = async () => {
  return await CompanyFact.findAll({
    where: { isPublic: true },
    order: [
      ['category', 'ASC'],
      ['fact_key', 'ASC'],
    ],
  });
};

export const getFactById = async (id) => {
  return await CompanyFact.findByPk(id);
};

export const getFactByKey = async (factKey) => {
  return await CompanyFact.findOne({ where: { factKey } });
};

export const createFact = async (data, userId = null) => {
  const payload = {
    ...data,
    updatedBy: userId,
  };
  const fact = await CompanyFact.create(payload);

  // Sync vector embedding asynchronously
  try {
    if (fact.isPublic) {
      syncCompanyFactEmbedding(fact.toJSON()).catch((err) => {
        logger.warn(`Failed to sync embedding for new company fact ${fact.id}: ${err.message}`);
      });
    }
  } catch (err) {
    logger.warn(`Failed to schedule embedding sync for fact ${fact.id}: ${err.message}`);
  }

  return fact;
};

export const updateFact = async (id, data, userId = null) => {
  const fact = await CompanyFact.findByPk(id);
  if (!fact) return null;

  const payload = {
    ...data,
    updatedBy: userId || fact.updatedBy,
  };
  await fact.update(payload);

  // Sync vector embedding
  try {
    if (fact.isPublic) {
      syncCompanyFactEmbedding(fact.toJSON()).catch((err) => {
        logger.warn(`Failed to update embedding for company fact ${fact.id}: ${err.message}`);
      });
    } else {
      deleteCompanyFactEmbedding(fact.id).catch(() => {});
    }
  } catch (err) {
    logger.warn(`Failed to schedule embedding sync on update for fact ${fact.id}: ${err.message}`);
  }

  return fact;
};

export const deleteFact = async (id) => {
  const fact = await CompanyFact.findByPk(id);
  if (!fact) return false;

  await fact.destroy();
  deleteCompanyFactEmbedding(id).catch(() => {});
  return true;
};

export default {
  listFacts,
  getPublicVerifiedFacts,
  getFactById,
  getFactByKey,
  createFact,
  updateFact,
  deleteFact,
};
