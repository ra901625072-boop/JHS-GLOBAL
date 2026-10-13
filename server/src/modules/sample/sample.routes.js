import { Router } from 'express';
import { submitSampleRequest, listSampleRequests } from './sample.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import { inquiryLimiter } from '../../middlewares/rateLimit.middleware.js';
import { createSampleSchema } from './sample.validation.js';

const router = Router();

// Public sample ordering endpoint
router.post('/', inquiryLimiter, validate(createSampleSchema), submitSampleRequest);

// Sales desk list
router.get('/', listSampleRequests);

export default router;
