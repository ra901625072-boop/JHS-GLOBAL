import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as customerService from './customer.service.js';

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body, req.user);
  return successResponse(res, customer, 201);
});

export const getCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getCustomers(req.query);
  return successResponse(res, result.customers, 200, result.pagination);
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  return successResponse(res, customer, 200);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body, req.user);
  return successResponse(res, customer, 200);
});

export const addCustomerNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  if (!note || !note.trim()) {
    const error = new Error('Note text is required');
    error.statusCode = 400;
    throw error;
  }
  const customer = await customerService.addCustomerNote(req.params.id, note.trim(), req.user);
  return successResponse(res, customer, 200);
});
