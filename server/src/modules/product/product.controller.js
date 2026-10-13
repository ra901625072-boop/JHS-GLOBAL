import productService from './product.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  return successResponse(res, result.items, 200, result.meta);
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 8;
  const products = await productService.getFeaturedProducts(limit);
  return successResponse(res, products);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    return errorResponse(res, `Product not found: ${slug}`, 404, 'NOT_FOUND');
  }

  return successResponse(res, product);
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const limit = parseInt(req.query.limit, 10) || 4;
  const related = await productService.getRelatedProducts(slug, limit);
  return successResponse(res, related);
});

export const searchSuggest = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const suggestions = await productService.searchSuggestions(q);
  return successResponse(res, suggestions);
});
