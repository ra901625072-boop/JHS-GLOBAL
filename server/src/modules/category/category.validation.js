import { z } from 'zod';

export const getCategoryBySlugSchema = {
  params: z.object({
    slug: z.string().min(1, 'Category slug is required'),
  }),
};

export const createCategorySchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().default(''),
    parentId: z.string().nullable().optional(),
    level: z.number().int().min(1).max(3).optional().default(1),
    path: z.string().optional(),
    image: z.object({
      url: z.string().default(''),
      alt: z.string().default(''),
    }).optional(),
    icon: z.string().optional().default(''),
    hsChapter: z.string().optional().default(''),
    order: z.number().int().optional().default(0),
    isActive: z.boolean().optional().default(true),
    seo: z.object({
      title: z.string().optional().default(''),
      description: z.string().optional().default(''),
    }).optional(),
  }),
};
