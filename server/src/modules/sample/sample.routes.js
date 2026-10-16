import { Router } from 'express';
import {
  submitSampleRequest,
  listSampleRequests,
  getSampleById,
  updateSampleRequest,
  dispatchSampleRequest,
  attachDocument,
} from './sample.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { inquiryLimiter } from '../../middlewares/rateLimit.middleware.js';
import { createSampleSchema } from './sample.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Public sample ordering endpoint
router.post('/', inquiryLimiter, validate(createSampleSchema), submitSampleRequest);

// Sales & Commercial Desk endpoints (Staff authorization required)
router.get('/', authenticate, authorize('admin', 'sales'), listSampleRequests);
router.get('/:id', authenticate, authorize('admin', 'sales'), getSampleById);
router.patch('/:id', authenticate, authorize('admin', 'sales'), updateSampleRequest);
router.post('/:id/dispatch', authenticate, authorize('admin', 'sales'), dispatchSampleRequest);
router.post('/:id/documents', authenticate, authorize('admin', 'sales'), attachDocument);

export default router;
