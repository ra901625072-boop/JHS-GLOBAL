import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  slug: z.string().optional(),
  excerpt: z
    .string({ required_error: 'Excerpt is required' })
    .min(20, 'Excerpt must be at least 20 characters')
    .max(350, 'Excerpt cannot exceed 350 characters')
    .trim(),
  content: z.string({ required_error: 'Content is required' }).min(50, 'Content must be at least 50 characters'),
  category: z.string().default('Export Quality & Compliance'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('published'),
  readMinutes: z.number().min(1).default(5),
  coverImage: z
    .object({
      url: z.string().default('/images/placeholders/blog-default.jpg'),
      alt: z.string().default('Indian agricultural export'),
    })
    .default({ url: '/images/placeholders/blog-default.jpg', alt: 'Indian agricultural export' }),
  author: z
    .object({
      name: z.string().default('Export Quality Desk'),
      designation: z.string().default('Trade & QA Specialist'),
      avatar: z.string().default('/images/placeholders/avatar-default.jpg'),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();
