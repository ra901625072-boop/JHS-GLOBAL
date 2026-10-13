import { Router } from 'express';
import { getCategoryTree, getCategoryBySlug } from './category.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import cacheResponse from '../../middlewares/cache.middleware.js';
import { getCategoryBySlugSchema } from './category.validation.js';

const router = Router();

// Public routes
router.get('/', cacheResponse(3600), getCategoryTree);
router.get('/:slug', validate(getCategoryBySlugSchema), cacheResponse(3600), getCategoryBySlug);

export default router;
