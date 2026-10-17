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

// Blog & Trade Intelligence CMS Desk
router.get('/blog', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getBlogPosts);
router.get('/blog/:id', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getBlogPostById);
router.post('/blog', authorize('admin', 'editor'), adminController.createBlogPost);
router.put('/blog/:id', authorize('admin', 'editor'), adminController.updateBlogPost);
router.delete('/blog/:id', authorize('admin', 'editor'), adminController.deleteBlogPost);
router.patch('/blog/:id/status', authorize('admin', 'editor'), adminController.updateBlogPostStatus);

// FAQ Manager Desk
router.get('/faqs', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getFaqs);
router.patch('/faqs/reorder', authorize('admin', 'editor'), adminController.reorderFaqs);
router.get('/faqs/:id', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getFaqById);
router.post('/faqs', authorize('admin', 'editor'), adminController.createFaq);
router.put('/faqs/:id', authorize('admin', 'editor'), adminController.updateFaq);
router.delete('/faqs/:id', authorize('admin', 'editor'), adminController.deleteFaq);
router.patch('/faqs/:id/toggle-home', authorize('admin', 'editor'), adminController.toggleFaqHome);
router.patch('/faqs/:id/toggle-active', authorize('admin', 'editor'), adminController.toggleFaqActive);

// AI Desk & RAG Knowledge Repository
router.get('/ai-desk/summary', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getAiDeskSummary);
router.post('/ai-desk/reindex', authorize('admin', 'editor'), adminController.triggerRAGReindex);

// Team Users Governance & RBAC (Strictly Admin only)
router.get('/users', authorize('admin'), adminController.getUsers);
router.get('/users/:id', authorize('admin'), adminController.getUserById);
router.post('/users', authorize('admin'), adminController.createUser);
router.put('/users/:id', authorize('admin'), adminController.updateUser);
router.patch('/users/:id/toggle-active', authorize('admin'), adminController.toggleUserActive);
router.post('/users/:id/reset-password', authorize('admin'), adminController.resetUserPassword);

// Company Profile, Founders & System Settings
router.get('/settings/company-profile', authorize('admin', 'editor', 'sales', 'viewer'), adminController.getCompanyProfile);
router.put('/settings/company-profile', authorize('admin'), adminController.updateCompanyProfile);
router.get('/settings/system-health', authorize('admin'), adminController.getSystemHealth);
router.post('/settings/cache-flush', authorize('admin'), adminController.flushCache);

export default router;

