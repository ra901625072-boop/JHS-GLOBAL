import faqService from './faq.service.js';
import { successResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const listFaqs = asyncHandler(async (req, res) => {
  const faqs = await faqService.listActiveFaqs(req.query.group);
  return successResponse(res, faqs);
});
