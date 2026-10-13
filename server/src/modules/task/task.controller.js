import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse } from '../../utils/apiResponse.js';
import * as taskService from './task.service.js';

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user);
  return successResponse(res, task, 201);
});

export const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.query);
  return successResponse(res, result.tasks, 200, result.pagination);
});

export const getTodayFollowUps = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTodayFollowUps(req.user);
  return successResponse(res, tasks, 200);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  return successResponse(res, task, 200);
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(req.params.id, req.body, req.user);
  return successResponse(res, task, 200);
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user);
  return successResponse(res, { message: 'Task deleted successfully' }, 200);
});
