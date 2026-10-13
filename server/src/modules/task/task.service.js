import { Op } from 'sequelize';
import Task from './task.model.js';
import User from '../user/user.model.js';
import logger from '../../utils/logger.js';

export const createTask = async (taskData, user) => {
  const task = await Task.create({
    ...taskData,
    assignedTo: taskData.assignedTo || user?.id || null,
  });

  logger.info(`Task created: "${task.title}" for ${task.company} by ${user?.name || 'Staff'}`);
  return task;
};

export const getTasks = async ({ status, dueDate, assignedTo, q, page = 1, limit = 20 }) => {
  const where = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (assignedTo) {
    where.assignedTo = parseInt(assignedTo, 10);
  }

  if (dueDate) {
    const start = new Date(dueDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dueDate);
    end.setHours(23, 59, 59, 999);
    where.dueDate = { [Op.between]: [start, end] };
  }

  if (q && q.trim()) {
    const searchTerm = q.trim();
    where[Op.or] = [
      { title: { [Op.iLike]: `%${searchTerm}%` } },
      { company: { [Op.iLike]: `%${searchTerm}%` } },
      { customerName: { [Op.iLike]: `%${searchTerm}%` } },
      { inquiryReference: { [Op.iLike]: `%${searchTerm}%` } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows } = await Task.findAndCountAll({
    where,
    order: [
      ['dueDate', 'ASC'],
      ['dueTime', 'ASC'],
    ],
    limit: limitNum,
    offset,
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
    distinct: true,
  });

  return {
    tasks: rows.map((r) => {
      const plain = r.toJSON();
      if (plain.assignee) {
        plain.assignedTo = plain.assignee;
      }
      return plain;
    }),
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(count / limitNum),
    },
  };
};

export const getTodayFollowUps = async (user) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const where = {
    dueDate: { [Op.between]: [start, end] },
    status: 'pending',
  };

  if (user?.role === 'sales') {
    where[Op.or] = [{ assignedTo: user.id }, { assignedTo: null }];
  }

  const tasks = await Task.findAll({
    where,
    order: [['dueTime', 'ASC']],
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
  });

  return tasks.map((t) => {
    const plain = t.toJSON();
    if (plain.assignee) {
      plain.assignedTo = plain.assignee;
    }
    return plain;
  });
};

export const getTaskById = async (id) => {
  const task = await Task.findByPk(id, {
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['id', 'name', 'email', 'role'],
      },
    ],
  });

  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const plain = task.toJSON();
  if (plain.assignee) {
    plain.assignedTo = plain.assignee;
  }
  return plain;
};

export const updateTaskStatus = async (id, { status, notes }, user) => {
  const task = await Task.findByPk(id);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  task.status = status;
  if (status === 'completed') {
    task.completedAt = new Date();
  }
  if (notes) {
    task.notes = task.notes ? `${task.notes}\n[${new Date().toISOString()}] ${notes}` : notes;
  }

  await task.save();
  logger.info(`Task "${task.title}" marked as ${status} by ${user?.name || 'Staff'}`);
  return task;
};

export const deleteTask = async (id, user) => {
  const task = await Task.findByPk(id);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  await task.destroy();
  logger.info(`Task "${task.title}" deleted by ${user?.name || 'Staff'}`);
  return { success: true };
};

export default {
  createTask,
  getTasks,
  getTodayFollowUps,
  getTaskById,
  updateTaskStatus,
  deleteTask,
};
