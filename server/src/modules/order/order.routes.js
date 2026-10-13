import { Router } from 'express';
import * as orderController from './order.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateShipmentSchema,
  addExportDocumentSchema,
} from './order.validation.js';

const router = Router();

// Staff authentication required for all order & shipment operations
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'sales'),
  validate(createOrderSchema),
  orderController.createOrder
);

router.get(
  '/',
  authorize('admin', 'sales'),
  orderController.getOrders
);

router.get(
  '/:id',
  authorize('admin', 'sales'),
  orderController.getOrderById
);

router.patch(
  '/:id/status',
  authorize('admin', 'sales'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.patch(
  '/:id/shipment',
  authorize('admin', 'sales'),
  validate(updateShipmentSchema),
  orderController.updateShipmentDetails
);

router.post(
  '/:id/documents',
  authorize('admin', 'sales'),
  validate(addExportDocumentSchema),
  orderController.addExportDocument
);

router.delete(
  '/:id/documents/:docId',
  authorize('admin', 'sales'),
  orderController.removeExportDocument
);

export default router;
