import categoryService from './category.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await categoryService.getCategoryTree();
  return successResponse(res, tree);
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await categoryService.getCategoryBySlug(slug);

  if (!category) {
    return errorResponse(res, `Category not found: ${slug}`, 404, 'NOT_FOUND');
  }

  return successResponse(res, category);
});
