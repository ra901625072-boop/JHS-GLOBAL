import { Router } from 'express';
import * as customerController from './customer.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createCustomerSchema, updateCustomerSchema } from './customer.validation.js';

const router = Router();

// Staff authentication required for all customer CRM endpoints
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'sales'),
  validate(createCustomerSchema),
  customerController.createCustomer
);

router.get(
  '/',
  authorize('admin', 'sales'),
  customerController.getCustomers
);

router.get(
  '/:id',
  authorize('admin', 'sales'),
  customerController.getCustomerById
);

router.put(
  '/:id',
  authorize('admin', 'sales'),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);

router.post(
  '/:id/notes',
  authorize('admin', 'sales'),
  customerController.addCustomerNote
);

export default router;
