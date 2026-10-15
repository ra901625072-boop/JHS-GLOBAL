import * as companyFactService from './companyFact.service.js';
import {
  createCompanyFactSchema,
  updateCompanyFactSchema,
  queryCompanyFactSchema,
} from './companyFact.validation.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import cacheService from '../../services/cache.service.js';

export const getPublicFacts = async (req, res, next) => {
  try {
    const facts = await companyFactService.getPublicVerifiedFacts();
    return successResponse(res, facts, 200);
  } catch (error) {
    next(error);
  }
};

export const getAdminFacts = async (req, res, next) => {
  try {
    const query = queryCompanyFactSchema.parse(req.query);
    const result = await companyFactService.listFacts(query);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getFact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fact = await companyFactService.getFactById(id);
    if (!fact) {
      return errorResponse(res, 'Company fact not found', 404);
    }
    return successResponse(res, fact, 200);
  } catch (error) {
    next(error);
  }
};

export const createFact = async (req, res, next) => {
  try {
    const data = createCompanyFactSchema.parse(req.body);
    const existing = await companyFactService.getFactByKey(data.factKey);
    if (existing) {
      return errorResponse(res, `A company fact with key '${data.factKey}' already exists`, 409);
    }

    const userId = req.user?.id || null;
    const fact = await companyFactService.createFact(data, userId);
    cacheService.del('http:/api/v1/company-facts*');
    return successResponse(res, fact, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateCompanyFactSchema.parse(req.body);

    if (data.factKey) {
      const existing = await companyFactService.getFactByKey(data.factKey);
      if (existing && existing.id !== parseInt(id, 10)) {
        return errorResponse(res, `A company fact with key '${data.factKey}' already exists`, 409);
      }
    }

    const userId = req.user?.id || null;
    const updated = await companyFactService.updateFact(id, data, userId);
    if (!updated) {
      return errorResponse(res, 'Company fact not found', 404);
    }

    cacheService.del('http:/api/v1/company-facts*');
    return successResponse(res, updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteFact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await companyFactService.deleteFact(id);
    if (!deleted) {
      return errorResponse(res, 'Company fact not found', 404);
    }
    cacheService.del('http:/api/v1/company-facts*');
    return successResponse(res, { message: 'Company fact deleted successfully' }, 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getPublicFacts,
  getAdminFacts,
  getFact,
  createFact,
  updateFact,
  deleteFact,
};
