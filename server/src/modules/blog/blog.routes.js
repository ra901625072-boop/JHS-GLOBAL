import { Router } from 'express';
import * as blogController from './blog.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import cacheResponse from '../../middlewares/cache.middleware.js';

const router = Router();

// Public Articles
router.get('/', cacheResponse(600), blogController.getPosts);
router.get('/:slug', cacheResponse(600), blogController.getPostBySlug);

// Staff Management Endpoints (Admin & Editor)
router.post('/', authenticate, authorize('admin', 'editor'), blogController.createPost);
router.put('/:id', authenticate, authorize('admin', 'editor'), blogController.updatePost);
router.delete('/:id', authenticate, authorize('admin', 'editor'), blogController.deletePost);

export default router;
