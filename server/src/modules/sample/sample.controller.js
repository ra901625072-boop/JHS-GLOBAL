import sampleService from './sample.service.js';
import { successResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const submitSampleRequest = asyncHandler(async (req, res) => {
  const sample = await sampleService.createSampleRequest(req.body);

  return successResponse(
    res,
    {
      referenceNo: sample.referenceNo,
      status: sample.status,
      message: 'Your sample request has been submitted to our dispatch desk. Dispatch target is within 48–72 hours.',
    },
    201
  );
});

export const listSampleRequests = asyncHandler(async (req, res) => {
  const samples = await sampleService.listSampleRequests();
  return successResponse(res, samples);
});
