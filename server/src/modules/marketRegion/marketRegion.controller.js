import marketRegionService from './marketRegion.service.js';
import { successResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const listMarketRegions = asyncHandler(async (req, res) => {
  const regions = await marketRegionService.listActiveRegions();
  return successResponse(res, regions);
});
