import { Router } from 'express';
import { listAuditLogs } from './audit.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Strictly restricted to administrative personnel
router.get('/', authenticate, authorize('admin'), listAuditLogs);

export default router;
