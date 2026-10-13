import * as blogService from './blog.service.js';
import { createBlogPostSchema, updateBlogPostSchema } from './blog.validation.js';
import { successResponse } from '../../utils/apiResponse.js';

export const getPosts = async (req, res, next) => {
  try {
    const result = await blogService.getPublishedPosts(req.query);
    return successResponse(res, result.posts, 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

export const getPostBySlug = async (req, res, next) => {
  try {
    const result = await blogService.getPostBySlug(req.params.slug);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const validatedData = createBlogPostSchema.parse(req.body);
    const post = await blogService.createPost(validatedData);
    return successResponse(res, post, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const validatedData = updateBlogPostSchema.parse(req.body);
    const post = await blogService.updatePost(req.params.id, validatedData);
    return successResponse(res, post, 200);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await blogService.deletePost(req.params.id);
    return successResponse(res, { id: post._id }, 200);
  } catch (error) {
    next(error);
  }
};
