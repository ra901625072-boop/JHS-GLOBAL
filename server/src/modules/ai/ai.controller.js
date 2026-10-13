import crypto from 'crypto';
import * as aiService from './ai.service.js';
import Inquiry from '../inquiry/inquiry.model.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const chat = async (req, res, next) => {
  try {
    const { message, history, pageContext, sessionUuid } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return errorResponse(res, 'Message text is required', 400);
    }

    if (message.length > 1000) {
      return errorResponse(res, 'Message exceeds maximum permitted length of 1000 characters', 400);
    }

    const ipHash = crypto
      .createHash('sha256')
      .update(req.ip || '127.0.0.1')
      .digest('hex')
      .substring(0, 16);

    const result = await aiService.chatWithBuyerAssistant({
      message,
      history,
      pageContext,
      sessionUuid,
      ipHash,
    });
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const summarizeInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    await aiService.processInquiryAiJob(id);
    const updated = await Inquiry.findByPk(id, {
      attributes: ['id', 'ai', 'priority', 'status', 'referenceNo'],
    });
    if (!updated) {
      return errorResponse(res, 'Inquiry not found', 404);
    }
    return successResponse(res, updated.ai, 200);
  } catch (error) {
    next(error);
  }
};

export const generateReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await aiService.generateDraftReply(id, req.body);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const generateFollowUp = async (req, res, next) => {
  try {
    const result = await aiService.generateFollowUpDraft(req.body);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const generateProductContent = async (req, res, next) => {
  try {
    const result = await aiService.generateProductContent(req.body);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const auditCatalogueQuality = async (req, res, next) => {
  try {
    const result = await aiService.auditCatalogueQuality();
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const detectDuplicates = async (req, res, next) => {
  try {
    const result = await aiService.detectDuplicateInquiries(req.query);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getSalesInsights = async (req, res, next) => {
  try {
    const result = await aiService.getSalesInsights(req.body);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const reindexEmbeddings = async (req, res, next) => {
  try {
    const result = await aiService.reindexCatalogueEmbeddings();
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return errorResponse(res, 'Search query text is required', 400);
    }
    if (query.length > 500) {
      return errorResponse(res, 'Search query exceeds maximum limit of 500 characters', 400);
    }

    const ipHash = req.ip
      ? crypto.createHash('sha256').update(req.ip).digest('hex').substring(0, 16)
      : '';
    const result = await aiService.parseSmartSearch({ query, ipHash });
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const parseRfq = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return errorResponse(res, 'RFQ message text is required', 400);
    }
    if (text.length > 2000) {
      return errorResponse(res, 'RFQ text exceeds maximum limit of 2000 characters', 400);
    }

    const ipHash = req.ip
      ? crypto.createHash('sha256').update(req.ip).digest('hex').substring(0, 16)
      : '';
    const result = await aiService.parseFreeTextRfq({ text, ipHash });
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const submitChatFeedback = async (req, res, next) => {
  try {
    const { logId, rating, comment } = req.body;
    if (!logId || !['helpful', 'unhelpful'].includes(rating)) {
      return errorResponse(res, 'Valid logId and rating (helpful or unhelpful) are required', 400);
    }
    const updated = await aiService.submitChatFeedback({ logId, rating, comment });
    return successResponse(res, updated, 200);
  } catch (error) {
    next(error);
  }
};

export const getChatAuditLogs = async (req, res, next) => {
  try {
    const result = await aiService.listChatAuditLogs(req.query);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getRepeatedUnknowns = async (req, res, next) => {
  try {
    const result = await aiService.getRepeatedUnknownQueries();
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const resolveAuditLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolvedNote } = req.body;
    const updated = await aiService.resolveChatAuditLog(id, { resolvedNote });
    return successResponse(res, updated, 200);
  } catch (error) {
    next(error);
  }
};

