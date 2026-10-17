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
router.post('/inquiries/:id/spam', authorize('admin', 'sales'), adminController.flagInquirySpam);
router.post('/inquiries/:id/unspam', authorize('admin'), adminController.unspamInquiry);

// Product Catalogue Administration
router.get('/products', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getProducts);
router.get('/products/:id', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getProductById);
router.post('/products', authorize('admin', 'editor'), adminController.createProduct);
router.put('/products/:id', authorize('admin', 'editor'), adminController.updateProduct);
router.delete('/products/:id', authorize('admin', 'editor'), adminController.deleteProduct);
router.patch('/products/:id/toggle-active', authorize('admin', 'editor'), adminController.toggleProductActive);
router.patch('/products/:id/toggle-featured', authorize('admin', 'editor'), adminController.toggleProductFeatured);
router.patch('/products/:id/verify-spec', authorize('admin', 'editor'), adminController.verifyProductSpec);
router.post('/products/:id/documents', authorize('admin', 'editor'), adminController.attachProductDocument);
router.delete('/products/:id/documents/:docId', authorize('admin', 'editor'), adminController.removeProductDocument);

export default router;
