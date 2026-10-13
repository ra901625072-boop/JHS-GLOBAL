import { Router } from 'express';
import { listMarketRegions } from './marketRegion.controller.js';
import cacheResponse from '../../middlewares/cache.middleware.js';

const router = Router();

router.get('/', cacheResponse(3600), listMarketRegions);

export default router;
