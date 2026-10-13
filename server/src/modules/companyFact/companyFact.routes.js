import { Router } from 'express';
import * as companyFactController from './companyFact.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Public: list public verified facts
router.get('/', companyFactController.getPublicFacts);

// Admin: Knowledge Base Management
router.get('/admin', authenticate, authorize('admin', 'editor'), companyFactController.getAdminFacts);
router.get('/admin/:id', authenticate, authorize('admin', 'editor'), companyFactController.getFact);
router.post('/admin', authenticate, authorize('admin', 'editor'), companyFactController.createFact);
router.put('/admin/:id', authenticate, authorize('admin', 'editor'), companyFactController.updateFact);
router.delete('/admin/:id', authenticate, authorize('admin'), companyFactController.deleteFact);

export default router;
