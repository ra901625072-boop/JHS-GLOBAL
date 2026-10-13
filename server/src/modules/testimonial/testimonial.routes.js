import { Router } from 'express';
import { listTestimonials } from './testimonial.controller.js';
import cacheResponse from '../../middlewares/cache.middleware.js';

const router = Router();

router.get('/', cacheResponse(3600), listTestimonials);

export default router;
