import { Router } from 'express';
import * as quotationController from './quotation.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createQuotationSchema, updateQuotationStatusSchema } from './quotation.validation.js';

const router = Router();

// Staff authentication required for all quotation actions
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'sales'),
  validate(createQuotationSchema),
  quotationController.createQuotation
);

router.get(
  '/',
  authorize('admin', 'sales'),
  quotationController.getQuotations
);

router.get(
  '/:id',
  authorize('admin', 'sales'),
  quotationController.getQuotationById
);

router.patch(
  '/:id/status',
  authorize('admin', 'sales'),
  validate(updateQuotationStatusSchema),
  quotationController.updateQuotationStatus
);

router.get(
  '/:id/pdf',
  authorize('admin', 'sales'),
  quotationController.downloadQuotationPdf
);

export default router;
