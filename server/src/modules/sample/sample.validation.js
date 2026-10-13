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
