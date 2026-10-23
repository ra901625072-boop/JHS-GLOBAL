import { z } from 'zod';

export const getProductsQuerySchema = {
  query: z.object({
    category: z.string().optional(),
    sub: z.string().optional(),
    q: z.string().optional(),
    form: z.string().optional(),
    origin: z.string().optional(),
    cert: z.string().optional(),
    isFeatured: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(12),
    sort: z.string().optional().default('-createdAt'),
  }),
};

export const getProductBySlugSchema = {
  params: z.object({
    slug: z.string().min(1, 'Product slug is required'),
  }),
};

export const searchSuggestSchema = {
  query: z.object({
    q: z.string().min(1, 'Search term is required'),
  }),
};

export const createProductSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    sku: z.string().optional().default(''),
    categoryId: z.string().min(1, 'Category ID is required'),
    subCategoryId: z.string().optional().nullable(),
    shortDescription: z.string().optional().default(''),
    description: z.string().optional().default(''),
    images: z
      .array(
        z.object({
          url: z.string().min(1),
          alt: z.string().optional().default(''),
          isPrimary: z.boolean().optional().default(false),
          order: z.number().optional().default(0),
        })
      )
      .optional()
      .default([]),
    hsCode: z.string().optional().default(''),
    availability: z.string().optional().default('Year-round'),
    botanicalName: z.string().optional().default(''),
    origin: z.array(z.string()).optional().default(['India']),
    forms: z.array(z.string()).optional().default([]),
    grades: z.array(z.string()).optional().default(['Export Quality']),
    specs: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          unit: z.string().optional().default(''),
        })
      )
      .optional()
      .default([]),
    packing: z
      .array(
        z.object({
          type: z.string(),
          size: z.string(),
          notes: z.string().optional().default(''),
        })
      )
      .optional()
      .default([]),
    moq: z
      .object({
        value: z.number().default(1),
        unit: z.string().default('20ft FCL'),
      })
      .optional(),
    shelfLife: z.string().optional().default('24 months'),
    storage: z.string().optional(),
    incoterms: z.array(z.string()).optional().default(['FOB', 'CIF', 'CFR']),
    ports: z.array(z.string()).optional().default(['Mundra', 'Nhava Sheva']),
    leadTime: z.string().optional().default('10–15 days'),
    tags: z.array(z.string()).optional().default([]),
    isFeatured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
    isPrivateLabelAvailable: z.boolean().optional().default(true),
  }),
};
