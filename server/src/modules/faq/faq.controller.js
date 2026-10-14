import faqService from './faq.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const listFaqs = asyncHandler(async (req, res) => {
  const faqs = await faqService.listActiveFaqs({
    group: req.query.group,
    featured: req.query.featured,
  });
  return successResponse(res, faqs);
});

export const getFaqBySlug = asyncHandler(async (req, res) => {
  const faq = await faqService.getFaqBySlug(req.params.slug);
  if (!faq) {
    return errorResponse(res, 'FAQ question not found', 404, 'NOT_FOUND');
  }
  return successResponse(res, faq);
});

export const adminListFaqs = asyncHandler(async (req, res) => {
  const faqs = await faqService.listAllFaqs(req.query);
  return successResponse(res, faqs);
});

export const adminCreateFaq = asyncHandler(async (req, res) => {
  const faq = await faqService.createFaq(req.body);
  return successResponse(res, faq, 201);
});

export const adminUpdateFaq = asyncHandler(async (req, res) => {
  const faq = await faqService.updateFaq(req.params.id, req.body);
  if (!faq) {
    return errorResponse(res, 'FAQ item not found', 404, 'NOT_FOUND');
  }
  return successResponse(res, faq);
});

export const adminDeleteFaq = asyncHandler(async (req, res) => {
  const success = await faqService.deleteFaq(req.params.id);
  if (!success) {
    return errorResponse(res, 'FAQ item not found', 404, 'NOT_FOUND');
  }
  return successResponse(res, { deleted: true });
});
