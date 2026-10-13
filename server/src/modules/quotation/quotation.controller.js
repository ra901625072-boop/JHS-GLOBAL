import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as quotationService from './quotation.service.js';

export const createQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.createQuotation(req.body, req.user);
  return successResponse(res, quotation, 201);
});

export const getQuotations = asyncHandler(async (req, res) => {
  const result = await quotationService.getQuotations(req.query);
  return successResponse(res, result.quotations, 200, result.pagination);
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotationById(req.params.id);
  return successResponse(res, quotation, 200);
});

export const updateQuotationStatus = asyncHandler(async (req, res) => {
  const quotation = await quotationService.updateQuotationStatus(req.params.id, req.body, req.user);
  return successResponse(res, quotation, 200);
});

export const downloadQuotationPdf = asyncHandler(async (req, res) => {
  const { quotation, pdfBuffer } = await quotationService.getQuotationPdfBuffer(req.params.id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Quotation_${quotation.quotationNumber}.pdf"`
  );
  res.setHeader('Content-Length', pdfBuffer.length);
  return res.end(pdfBuffer);
});
