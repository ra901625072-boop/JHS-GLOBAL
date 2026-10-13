import inquiryService from './inquiry.service.js';
import { successResponse } from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const submitInquiry = asyncHandler(async (req, res) => {
  const clientMeta = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'] || '',
  };

  const savedInquiry = await inquiryService.createInquiry(req.body, clientMeta);

  return successResponse(
    res,
    {
      referenceNo: savedInquiry.referenceNo,
      status: savedInquiry.status,
      message: 'Your request for quotation has been officially logged with our export desk.',
      promisedResponseTime: '48 business hours',
    },
    201
  );
});

export const listInquiries = asyncHandler(async (req, res) => {
  const inquiries = await inquiryService.listInquiries(req.query);
  return successResponse(res, inquiries);
});
