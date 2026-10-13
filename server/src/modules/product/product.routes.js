import { Router } from 'express';
import {
  listProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  searchSuggest,
} from './product.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import cacheResponse from '../../middlewares/cache.middleware.js';
import {
  getProductsQuerySchema,
  getProductBySlugSchema,
  searchSuggestSchema,
} from './product.validation.js';

const router = Router();

// Public routes
router.get('/', validate(getProductsQuerySchema), cacheResponse(300), listProducts);
router.get('/featured', cacheResponse(600), getFeaturedProducts);
router.get('/suggest', validate(searchSuggestSchema), searchSuggest);
router.get('/:slug', validate(getProductBySlugSchema), cacheResponse(600), getProductBySlug);
router.get('/:slug/related', validate(getProductBySlugSchema), cacheResponse(600), getRelatedProducts);

export default router;
