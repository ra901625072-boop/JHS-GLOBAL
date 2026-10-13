import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  taskType: z.enum(['call', 'whatsapp', 'email', 'meeting', 'review', 'document']).default('call'),
  inquiryId: z.string().optional().nullable(),
  inquiryReference: z.string().optional().default(''),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().default(''),
  company: z.string().min(2, 'Company name is required'),
  country: z.string().optional().default(''),
  dueDate: z.string().or(z.date()),
  dueTime: z.string().default('10:00 AM'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().default(''),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']),
  notes: z.string().optional(),
});
