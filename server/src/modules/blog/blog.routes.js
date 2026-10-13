import { Router } from 'express';
import * as blogController from './blog.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Public Articles
router.get('/', blogController.getPosts);
router.get('/:slug', blogController.getPostBySlug);

// Staff Management Endpoints (Admin & Editor)
router.post('/', authenticate, authorize('admin', 'editor'), blogController.createPost);
router.put('/:id', authenticate, authorize('admin', 'editor'), blogController.updatePost);
router.delete('/:id', authenticate, authorize('admin', 'editor'), blogController.deletePost);

export default router;
