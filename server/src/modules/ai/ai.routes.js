import { Router } from 'express';
import * as aiController from './ai.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { aiChatLimiter, generalLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Public Buyer Assistant & Smart Search Tools (Rate Limited to 20/10m per system-design.md)
router.post('/chat', aiChatLimiter, aiController.chat);
router.post('/chat/feedback', aiChatLimiter, aiController.submitChatFeedback);
router.post('/smart-search', aiChatLimiter, aiController.smartSearch);
router.post('/parse-rfq', aiChatLimiter, aiController.parseRfq);

// AI Inquiry Review & Knowledge Gap Detection (Admin & Staff)
router.get('/admin/audit-logs', authenticate, authorize('admin', 'sales', 'editor'), aiController.getChatAuditLogs);
router.get('/admin/repeated-unknowns', authenticate, authorize('admin', 'sales', 'editor'), aiController.getRepeatedUnknowns);
router.patch('/admin/audit-logs/:id/resolve', authenticate, authorize('admin', 'sales', 'editor'), aiController.resolveAuditLog);

// Sales Desk AI Tools
router.post('/admin/inquiries/:id/summarize', authenticate, authorize('admin', 'sales'), aiController.summarizeInquiry);
router.post('/admin/inquiries/:id/reply-draft', authenticate, authorize('admin', 'sales'), aiController.generateReply);
router.post('/admin/follow-up-draft', authenticate, authorize('admin', 'sales'), aiController.generateFollowUp);
router.get('/admin/duplicates', authenticate, authorize('admin', 'sales'), aiController.detectDuplicates);

// Editor AI Tools (Product Copy, SEO Helper & Quality Checker)
router.post('/admin/product-content', authenticate, authorize('admin', 'editor'), aiController.generateProductContent);
router.get('/admin/catalogue-audit', authenticate, authorize('admin', 'editor'), aiController.auditCatalogueQuality);

// Admin Executive AI Intelligence (DB Analytics & Insights)
router.post('/admin/sales-insights', authenticate, authorize('admin'), aiController.getSalesInsights);

// Admin RAG Index Maintenance
router.post('/admin/embeddings/reindex', authenticate, authorize('admin'), aiController.reindexEmbeddings);

export default router;
