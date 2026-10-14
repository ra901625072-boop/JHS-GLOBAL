import { Router } from 'express';
import {
  listFaqs,
  getFaqBySlug,
  adminListFaqs,
  adminCreateFaq,
  adminUpdateFaq,
  adminDeleteFaq,
} from './faq.controller.js';
import cacheResponse from '../../middlewares/cache.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Public endpoints
router.get('/', cacheResponse(3600), listFaqs);
router.get('/item/:slug', cacheResponse(3600), getFaqBySlug);

// Admin Management endpoints
router.get('/admin/all', authenticate, authorize('admin', 'editor'), adminListFaqs);
router.post('/admin', authenticate, authorize('admin', 'editor'), adminCreateFaq);
router.put('/admin/:id', authenticate, authorize('admin', 'editor'), adminUpdateFaq);
router.delete('/admin/:id', authenticate, authorize('admin'), adminDeleteFaq);

export default router;
