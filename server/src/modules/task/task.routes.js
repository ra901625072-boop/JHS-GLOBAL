import { Router } from 'express';
import * as taskController from './task.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createTaskSchema, updateTaskStatusSchema } from './task.validation.js';

const router = Router();

// Staff authentication required for all follow-up tasks
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'sales'),
  validate(createTaskSchema),
  taskController.createTask
);

router.get(
  '/',
  authorize('admin', 'sales'),
  taskController.getTasks
);

router.get(
  '/today',
  authorize('admin', 'sales'),
  taskController.getTodayFollowUps
);

router.get(
  '/:id',
  authorize('admin', 'sales'),
  taskController.getTaskById
);

router.patch(
  '/:id/status',
  authorize('admin', 'sales'),
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus
);

router.delete(
  '/:id',
  authorize('admin', 'sales'),
  taskController.deleteTask
);

export default router;
