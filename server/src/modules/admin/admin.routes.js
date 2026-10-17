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

// Categories & Divisions Governance
router.get('/categories', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getCategories);
router.patch('/categories/reorder', authorize('admin', 'editor'), adminController.reorderCategories);
router.get('/categories/:id', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getCategoryById);
router.post('/categories', authorize('admin', 'editor'), adminController.createCategory);
router.put('/categories/:id', authorize('admin', 'editor'), adminController.updateCategory);
router.delete('/categories/:id', authorize('admin', 'editor'), adminController.deleteCategory);
router.patch('/categories/:id/toggle-active', authorize('admin', 'editor'), adminController.toggleCategoryActive);

// Certificates & Statutory Compliance Desk
router.get('/certificates', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getCertificates);
router.patch('/certificates/reorder', authorize('admin', 'editor'), adminController.reorderCertificates);
router.get('/certificates/:id', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getCertificateById);
router.post('/certificates', authorize('admin', 'editor'), adminController.createCertificate);
router.put('/certificates/:id', authorize('admin', 'editor'), adminController.updateCertificate);
router.delete('/certificates/:id', authorize('admin', 'editor'), adminController.deleteCertificate);
router.patch('/certificates/:id/toggle-public', authorize('admin', 'editor'), adminController.toggleCertificatePublic);

export default router;

