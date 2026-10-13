import certificateService from './certificate.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const listCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.listPublicCertificates();
  return successResponse(res, certificates);
});

export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await certificateService.getCertificateById(req.params.id);
  if (!certificate) {
    return errorResponse(res, 'Certificate not found', 404, 'NOT_FOUND');
  }
  return successResponse(res, certificate);
});
