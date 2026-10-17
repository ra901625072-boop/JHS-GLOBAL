import * as adminService from './admin.service.js';
import {
  updateInquiryStatusSchema,
  sendInquiryReplySchema,
  adminProductSchema,
  spamInquirySchema,
  verifyProductSpecSchema,
  attachProductDocumentSchema,
  adminCategorySchema,
  reorderCategoriesSchema,
  adminCertificateSchema,
  reorderCertificatesSchema,
  adminBlogPostSchema,
  updateBlogStatusSchema,
  adminFaqSchema,
  reorderFaqsSchema,
} from './admin.validation.js';
import { successResponse } from '../../utils/apiResponse.js';

export const getDashboard = async (req, res, next) => {
  try {
    const metrics = await adminService.getDashboardMetrics();
    return successResponse(res, metrics, 200);
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req, res, next) => {
  try {
    const result = await adminService.getAdminInquiries(req.query);
    return successResponse(
      res,
      result.inquiries,
      200,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

export const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await adminService.getAdminInquiryById(req.params.id);
    return successResponse(res, inquiry, 200);
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const validatedData = updateInquiryStatusSchema.parse(req.body);
    const updated = await adminService.updateInquiryStatus(req.params.id, validatedData, req.user, req);
    return successResponse(res, updated, 200);
  } catch (error) {
    next(error);
  }
};

export const sendInquiryReply = async (req, res, next) => {
  try {
    const validatedData = sendInquiryReplySchema.parse(req.body);
    const updated = await adminService.sendInquiryReply(req.params.id, validatedData, req.user, req);
    return successResponse(res, updated, 200);
  } catch (error) {
    next(error);
  }
};

export const flagInquirySpam = async (req, res, next) => {
  try {
    const validatedData = spamInquirySchema.parse(req.body);
    const updated = await adminService.flagInquiryAsSpam(req.params.id, validatedData, req.user, req);
    return successResponse(res, updated, 200);
  } catch (error) {
    next(error);
  }
};

export const unspamInquiry = async (req, res, next) => {
  try {
    const updated = await adminService.unspamInquiry(req.params.id, req.user, req);
    return successResponse(res, updated, 200);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const result = await adminService.getAdminProducts(req.query);
    return successResponse(res, result.products, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await adminService.getAdminProductById(req.params.id);
    return successResponse(res, product, 200);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const validatedData = adminProductSchema.parse(req.body);
    const product = await adminService.createAdminProduct(validatedData, req.user, req);
    return successResponse(res, product, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const validatedData = adminProductSchema.partial().parse(req.body);
    const product = await adminService.updateAdminProduct(req.params.id, validatedData, req.user, req);
    return successResponse(res, product, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await adminService.softDeleteAdminProduct(req.params.id, req.user, req);
    return successResponse(res, { id: product._id, isActive: product.isActive }, 200);
  } catch (error) {
    next(error);
  }
};

export const toggleProductActive = async (req, res, next) => {
  try {
    const result = await adminService.toggleProductActive(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const toggleProductFeatured = async (req, res, next) => {
  try {
    const result = await adminService.toggleProductFeatured(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const verifyProductSpec = async (req, res, next) => {
  try {
    const validatedData = verifyProductSpecSchema.parse(req.body);
    const result = await adminService.verifyProductSpec(req.params.id, validatedData, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const attachProductDocument = async (req, res, next) => {
  try {
    const validatedData = attachProductDocumentSchema.parse(req.body);
    const result = await adminService.attachProductDocument(req.params.id, validatedData, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const removeProductDocument = async (req, res, next) => {
  try {
    const result = await adminService.removeProductDocument(req.params.id, req.params.docId, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await adminService.getAdminCategories(req.query);
    return successResponse(res, categories, 200);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await adminService.getAdminCategoryById(req.params.id);
    return successResponse(res, category, 200);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const validatedData = adminCategorySchema.parse(req.body);
    const category = await adminService.createAdminCategory(validatedData, req.user, req);
    return successResponse(res, category, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const validatedData = adminCategorySchema.partial().parse(req.body);
    const category = await adminService.updateAdminCategory(req.params.id, validatedData, req.user, req);
    return successResponse(res, category, 200);
  } catch (error) {
    next(error);
  }
};

export const toggleCategoryActive = async (req, res, next) => {
  try {
    const result = await adminService.toggleCategoryActive(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req, res, next) => {
  try {
    const validatedData = reorderCategoriesSchema.parse(req.body);
    const result = await adminService.reorderCategories(validatedData.items, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const result = await adminService.deleteAdminCategory(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getCertificates = async (req, res, next) => {
  try {
    const certificates = await adminService.getAdminCertificates(req.query);
    return successResponse(res, certificates, 200);
  } catch (error) {
    next(error);
  }
};

export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await adminService.getAdminCertificateById(req.params.id);
    return successResponse(res, certificate, 200);
  } catch (error) {
    next(error);
  }
};

export const createCertificate = async (req, res, next) => {
  try {
    const validatedData = adminCertificateSchema.parse(req.body);
    const certificate = await adminService.createAdminCertificate(validatedData, req.user, req);
    return successResponse(res, certificate, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCertificate = async (req, res, next) => {
  try {
    const validatedData = adminCertificateSchema.partial().parse(req.body);
    const certificate = await adminService.updateAdminCertificate(req.params.id, validatedData, req.user, req);
    return successResponse(res, certificate, 200);
  } catch (error) {
    next(error);
  }
};

export const toggleCertificatePublic = async (req, res, next) => {
  try {
    const result = await adminService.toggleCertificatePublic(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const reorderCertificates = async (req, res, next) => {
  try {
    const validatedData = reorderCertificatesSchema.parse(req.body);
    const result = await adminService.reorderCertificates(validatedData.items, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteCertificate = async (req, res, next) => {
  try {
    const result = await adminService.deleteAdminCertificate(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getBlogPosts = async (req, res, next) => {
  try {
    const result = await adminService.getAdminBlogPosts(req.query);
    return successResponse(res, result.posts, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getBlogPostById = async (req, res, next) => {
  try {
    const post = await adminService.getAdminBlogPostById(req.params.id);
    return successResponse(res, post, 200);
  } catch (error) {
    next(error);
  }
};

export const createBlogPost = async (req, res, next) => {
  try {
    const validatedData = adminBlogPostSchema.parse(req.body);
    const post = await adminService.createAdminBlogPost(validatedData, req.user, req);
    return successResponse(res, post, 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (req, res, next) => {
  try {
    const validatedData = adminBlogPostSchema.partial().parse(req.body);
    const post = await adminService.updateAdminBlogPost(req.params.id, validatedData, req.user, req);
    return successResponse(res, post, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (req, res, next) => {
  try {
    const result = await adminService.deleteAdminBlogPost(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const updateBlogPostStatus = async (req, res, next) => {
  try {
    const validatedData = updateBlogStatusSchema.parse(req.body);
    const post = await adminService.updateAdminBlogPostStatus(req.params.id, validatedData, req.user, req);
    return successResponse(res, post, 200);
  } catch (error) {
    next(error);
  }
};

export const getFaqs = async (req, res, next) => {
  try {
    const result = await adminService.getAdminFaqs(req.query);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getFaqById = async (req, res, next) => {
  try {
    const faq = await adminService.getAdminFaqById(req.params.id);
    return successResponse(res, faq, 200);
  } catch (error) {
    next(error);
  }
};

export const createFaq = async (req, res, next) => {
  try {
    const validatedData = adminFaqSchema.parse(req.body);
    const faq = await adminService.createAdminFaq(validatedData, req.user, req);
    return successResponse(res, faq, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const validatedData = adminFaqSchema.partial().parse(req.body);
    const faq = await adminService.updateAdminFaq(req.params.id, validatedData, req.user, req);
    return successResponse(res, faq, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    const result = await adminService.deleteAdminFaq(req.params.id, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const toggleFaqHome = async (req, res, next) => {
  try {
    const faq = await adminService.toggleAdminFaqHome(req.params.id, req.user, req);
    return successResponse(res, faq, 200);
  } catch (error) {
    next(error);
  }
};

export const toggleFaqActive = async (req, res, next) => {
  try {
    const faq = await adminService.toggleAdminFaqActive(req.params.id, req.user, req);
    return successResponse(res, faq, 200);
  } catch (error) {
    next(error);
  }
};

export const reorderFaqs = async (req, res, next) => {
  try {
    const validatedData = reorderFaqsSchema.parse(req.body);
    const result = await adminService.reorderAdminFaqs(validatedData.items, req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getAiDeskSummary = async (req, res, next) => {
  try {
    const summary = await adminService.getAdminAiDeskSummary();
    return successResponse(res, summary, 200);
  } catch (error) {
    next(error);
  }
};

export const triggerRAGReindex = async (req, res, next) => {
  try {
    const result = await adminService.triggerAdminRAGReindex(req.user, req);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};


