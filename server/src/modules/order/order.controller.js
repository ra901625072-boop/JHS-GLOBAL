import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as orderService from './order.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user);
  return successResponse(res, order, 201);
});

export const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.query);
  return successResponse(res, result.orders, 200, result.pagination);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  return successResponse(res, order, 200);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body, req.user);
  return successResponse(res, order, 200);
});

export const updateShipmentDetails = asyncHandler(async (req, res) => {
  const order = await orderService.updateShipmentDetails(req.params.id, req.body, req.user);
  return successResponse(res, order, 200);
});

export const addExportDocument = asyncHandler(async (req, res) => {
  const order = await orderService.addExportDocument(req.params.id, req.body, req.user);
  return successResponse(res, order, 201);
});

export const removeExportDocument = asyncHandler(async (req, res) => {
  const order = await orderService.removeExportDocument(req.params.id, req.params.docId, req.user);
  return successResponse(res, order, 200);
});
