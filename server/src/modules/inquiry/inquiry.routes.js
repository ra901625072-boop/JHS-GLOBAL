import { Router } from 'express';
import { submitInquiry, listInquiries } from './inquiry.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { inquiryLimiter } from '../../middlewares/rateLimit.middleware.js';
import { createInquirySchema } from './inquiry.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Public RFQ submission endpoint
router.post('/', inquiryLimiter, validate(createInquirySchema), submitInquiry);

// Sales desk inquiry listing (staff authentication required)
router.get('/', authenticate, authorize('admin', 'sales'), listInquiries);

export default router;
