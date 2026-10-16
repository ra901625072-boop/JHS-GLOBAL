import { z } from 'zod';

export const createSampleSchema = {
  body: z.object({
    name: z.string().min(2, 'Contact name is required').trim(),
    email: z.string().email('Valid business email is required').trim(),
    company: z.string().min(2, 'Company name is required').trim(),
    phone: z.string().optional().default(''),
    country: z.string().min(2, 'Country is required').trim(),
    products: z
      .array(
        z.object({
          productId: z.string().optional().nullable(),
          productName: z.string().min(1, 'Product name is required'),
          qty: z.string().default('250g'),
        })
      )
      .min(1, 'Please select at least one sample product (up to 3)'),
    shippingAddress: z.object({
      street: z.string().min(3, 'Shipping street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().optional().default(''),
      postalCode: z.string().min(2, 'Postal/ZIP code is required'),
      country: z.string().min(2, 'Destination country is required'),
    }),
    courierAccount: z
      .object({
        provider: z.string().optional().default('DHL'),
        accountNumber: z.string().optional().default(''),
      })
      .optional(),
    testingParameters: z.string().optional().default(''),
  }),
};

export const updateSampleSchema = z.object({
  status: z
    .enum([
      'new',
      'in_review',
      'preparing',
      'dispatched',
      'in_transit',
      'delivered',
      'feedback_received',
      'cancelled',
    ])
    .optional(),
  courier: z.string().max(50).optional(),
  awbNumber: z.string().max(100).optional(),
  trackingUrl: z.string().url().or(z.literal('')).optional(),
  estimatedDeliveryDate: z.string().optional().nullable(),
  note: z.string().max(1000).optional(),
  assignedTo: z.number().int().optional().nullable(),
});

export const dispatchSampleSchema = z.object({
  courier: z.string({ required_error: 'Courier provider is required' }).min(2).max(50),
  awbNumber: z.string({ required_error: 'Air Waybill (AWB) number is required' }).min(3).max(100),
  trackingUrl: z.string().url().optional().or(z.literal('')),
  estimatedDeliveryDate: z.string().optional().nullable(),
  note: z.string().max(1000).optional(),
  documents: z
    .array(
      z.object({
        type: z.enum(['COA', 'SDS', 'TDS', 'OTHER']),
        name: z.string().min(1),
        url: z.string().min(1),
      })
    )
    .optional(),
});

export const attachDocumentSchema = z.object({
  type: z.enum(['COA', 'SDS', 'TDS', 'OTHER']),
  name: z.string({ required_error: 'Document name is required' }).min(2).max(200),
  url: z.string({ required_error: 'Document URL is required' }).min(3),
});
