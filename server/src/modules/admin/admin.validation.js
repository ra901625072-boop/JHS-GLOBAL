import { z } from 'zod';
import { INQUIRY_STATUSES, INQUIRY_PRIORITIES } from '../../config/constants.js';

export const updateInquiryStatusSchema = z.object({
  status: z.enum(INQUIRY_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${INQUIRY_STATUSES.join(', ')}` }),
  }),
  priority: z.enum(INQUIRY_PRIORITIES).optional(),
  note: z.string().max(1000).optional(),
  assignedTo: z.string().optional().nullable(),
});

export const sendInquiryReplySchema = z.object({
  subject: z.string({ required_error: 'Subject line is required' }).min(3).max(250).trim(),
  message: z.string({ required_error: 'Reply message text is required' }).min(10).max(10000).trim(),
  status: z.enum(INQUIRY_STATUSES).optional().default('quoted'),
});

export const spamInquirySchema = z.object({
  reason: z.string().max(500).optional(),
});

export const adminProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required' }).min(2).trim(),
  slug: z.string().optional(),
  categoryId: z.string({ required_error: 'Category ID is required' }),
  subCategoryId: z.string().optional().nullable(),
  shortDescription: z.string().max(300).optional().default(''),
  description: z.string().optional().default(''),
  hsCode: z.string({ required_error: 'HS Code is required' }).trim(),
  origin: z.string().default('India'),
  forms: z.array(z.string()).default([]),
  grades: z.array(z.string()).default([]),
  moq: z
    .object({
      value: z.number().min(1).default(1),
      unit: z.string().default('MT'),
    })
    .default({ value: 1, unit: 'MT' }),
  packing: z
    .array(
      z.object({
        type: z.string(),
        size: z.string(),
      })
    )
    .default([]),
  shelfLifeMonths: z.number().min(1).default(24),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isPrivateLabelAvailable: z.boolean().default(true),
  specs: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        standard: z.string().optional().default(''),
      })
    )
    .default([]),
});
