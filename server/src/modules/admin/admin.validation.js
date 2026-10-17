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
  sku: z.string().optional().default(''),
  categoryId: z.union([z.string(), z.number()]).transform((val) => String(val)),
  subCategoryId: z.union([z.string(), z.number()]).optional().nullable().transform((val) => (val ? String(val) : null)),
  shortDescription: z.string().max(1000).optional().default(''),
  description: z.string().optional().default(''),
  hsCode: z.string({ required_error: 'HS Code is required' }).trim(),
  botanicalName: z.string().optional().default(''),
  origin: z.union([z.string(), z.array(z.string())]).default('India'),
  forms: z.array(z.string()).default([]),
  grades: z.array(z.string()).default([]),
  moq: z
    .object({
      value: z.number().min(0).default(1),
      unit: z.string().default('MT'),
    })
    .default({ value: 1, unit: 'MT' }),
  packing: z
    .array(
      z.object({
        type: z.string().optional().default('PP Bag'),
        size: z.string().optional().default('25 kg'),
        notes: z.string().optional().default(''),
      })
    )
    .default([]),
  shelfLifeMonths: z.number().optional(),
  shelfLife: z.string().optional(),
  storage: z.string().optional().default('Store in a cool, dry place away from direct sunlight'),
  leadTime: z.string().optional().default('10–15 business days'),
  ports: z.array(z.string()).optional().default(['Mundra', 'Nhava Sheva (JNPT)']),
  incoterms: z.array(z.string()).optional().default(['FOB', 'CIF', 'CFR']),
  containerLoad: z
    .object({
      fcl20: z.string().optional().default(''),
      fcl40: z.string().optional().default(''),
      lcl: z.string().optional().default(''),
    })
    .optional()
    .default({ fcl20: '', fcl40: '', lcl: '' }),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  verifiedFields: z.record(z.boolean()).optional(),
  isPrivateLabelAvailable: z.boolean().default(true),
  specs: z
    .array(
      z.object({
        key: z.string().optional(),
        parameter: z.string().optional(),
        value: z.string().optional(),
        standard: z.string().optional().default(''),
        specification: z.string().optional().default(''),
        testMethod: z.string().optional().default(''),
        typicalValue: z.string().optional().default(''),
        verified: z.boolean().optional().default(false),
      })
    )
    .default([]),
  documents: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        type: z.string(),
        url: z.string(),
        addedAt: z.string().optional(),
        fileSize: z.string().optional(),
      })
    )
    .default([]),
  images: z
    .array(
      z.union([
        z.string(),
        z.object({
          url: z.string(),
          alt: z.string().optional().default(''),
          isPrimary: z.boolean().optional().default(false),
        }),
      ])
    )
    .default([]),
  seo: z
    .object({
      title: z.string().optional().default(''),
      description: z.string().optional().default(''),
      keywords: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({ title: '', description: '', keywords: [] }),
});

export const verifyProductSpecSchema = z.object({
  specIndex: z.number().int().min(0).optional(),
  specKey: z.string().optional(),
  verified: z.boolean().default(true),
});

export const attachProductDocumentSchema = z.object({
  title: z.string().min(2, 'Document title is required').max(200).trim(),
  type: z
    .enum(['tds', 'sds', 'coa', 'specification_sheet', 'organic_cert', 'halal_cert', 'kosher_cert', 'other'])
    .default('tds'),
  url: z.string().min(3, 'Document URL is required').trim(),
  fileSize: z.string().optional().default(''),
});
