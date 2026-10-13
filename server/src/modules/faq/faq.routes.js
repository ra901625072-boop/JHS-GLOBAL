import { Router } from 'express';
import { listFaqs } from './faq.controller.js';
import cacheResponse from '../../middlewares/cache.middleware.js';

const router = Router();

router.get('/', cacheResponse(3600), listFaqs);

export default router;
