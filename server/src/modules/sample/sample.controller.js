import sampleService from './sample.service.js';
import {
  updateSampleSchema,
  dispatchSampleSchema,
  attachDocumentSchema,
} from './sample.validation.js';
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
  const result = await sampleService.listSampleRequests(req.query);
  return successResponse(res, result.samples, 200, result.pagination);
});

export const getSampleById = asyncHandler(async (req, res) => {
  const sample = await sampleService.getSampleById(req.params.id);
  return successResponse(res, sample, 200);
});

export const updateSampleRequest = asyncHandler(async (req, res) => {
  const validated = updateSampleSchema.parse(req.body);
  const updated = await sampleService.updateSampleRequest(req.params.id, validated, req.user, req);
  return successResponse(res, updated, 200);
});

export const dispatchSampleRequest = asyncHandler(async (req, res) => {
  const validated = dispatchSampleSchema.parse(req.body);
  const dispatched = await sampleService.dispatchSampleRequest(req.params.id, validated, req.user, req);
  return successResponse(res, dispatched, 200);
});

export const attachDocument = asyncHandler(async (req, res) => {
  const validated = attachDocumentSchema.parse(req.body);
  const updated = await sampleService.attachDocument(req.params.id, validated, req.user, req);
  return successResponse(res, updated, 200);
});

export default {
  submitSampleRequest,
  listSampleRequests,
  getSampleById,
  updateSampleRequest,
  dispatchSampleRequest,
  attachDocument,
};
