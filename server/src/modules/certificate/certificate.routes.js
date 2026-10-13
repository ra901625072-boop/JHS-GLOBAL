import { Router } from 'express';
import { listCertificates, getCertificateById } from './certificate.controller.js';
import cacheResponse from '../../middlewares/cache.middleware.js';

const router = Router();

router.get('/', cacheResponse(3600), listCertificates);
router.get('/:id', cacheResponse(3600), getCertificateById);

export default router;
