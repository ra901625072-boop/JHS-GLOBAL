import * as adminService from './admin.service.js';
import {
  updateInquiryStatusSchema,
  sendInquiryReplySchema,
  adminProductSchema,
  spamInquirySchema,
  verifyProductSpecSchema,
  attachProductDocumentSchema,
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
