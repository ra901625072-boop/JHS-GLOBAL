import { z } from 'zod';

export const createCompanyFactSchema = z.object({
  category: z.enum(['identity', 'contact', 'certifications', 'operations', 'policy', 'quality'], {
    required_error: 'Category is required',
  }),
  factKey: z
    .string({ required_error: 'Fact key is required' })
    .min(2)
    .max(100)
    .regex(/^[a-z0-9_]+$/, 'Fact key must contain lowercase alphanumeric characters and underscores only'),
  label: z.string({ required_error: 'Label is required' }).min(2).max(200),
  factValue: z.string({ required_error: 'Fact value is required' }).min(1),
  source: z.string().default('admin_portal'),
  sourceDocument: z.string().optional().default(''),
  isVerified: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  notes: z.string().optional().default(''),
});

export const updateCompanyFactSchema = createCompanyFactSchema.partial();

export const queryCompanyFactSchema = z.object({
  category: z.enum(['identity', 'contact', 'certifications', 'operations', 'policy', 'quality']).optional(),
  isVerified: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  isPublic: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().optional(),
});
