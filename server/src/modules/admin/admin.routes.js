import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';

const router = Router();

// Require valid authentication token for all admin endpoints
router.use(authenticate);

// Dashboard Metrics (accessible by all staff roles)
router.get('/dashboard', authorize('admin', 'sales', 'editor'), adminController.getDashboard);

// Inquiries / Leads Pipeline (accessible by admin and sales)
router.get('/inquiries', authorize('admin', 'sales'), adminController.getInquiries);
router.get('/inquiries/:id', authorize('admin', 'sales'), adminController.getInquiryById);
router.patch('/inquiries/:id/status', authorize('admin', 'sales'), adminController.updateInquiryStatus);
router.post('/inquiries/:id/reply', authorize('admin', 'sales'), adminController.sendInquiryReply);

// Product Catalogue Administration (accessible by admin and editor)
router.post('/products', authorize('admin', 'editor'), adminController.createProduct);
router.put('/products/:id', authorize('admin', 'editor'), adminController.updateProduct);
router.delete('/products/:id', authorize('admin', 'editor'), adminController.deleteProduct);

export default router;
