import { Router } from 'express';
import { submitInquiry, listInquiries } from './inquiry.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { inquiryLimiter } from '../../middlewares/rateLimit.middleware.js';
import { createInquirySchema } from './inquiry.validation.js';

const router = Router();

// Public RFQ submission endpoint
router.post('/', inquiryLimiter, validate(createInquirySchema), submitInquiry);

// Sales desk inquiry listing
router.get('/', listInquiries);

export default router;
