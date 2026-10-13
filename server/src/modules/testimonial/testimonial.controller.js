import testimonialService from './testimonial.service.js';
import { successResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.listPublicTestimonials();
  return successResponse(res, testimonials);
});
