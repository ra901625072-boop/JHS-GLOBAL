import { z } from 'zod';
import { BUYER_TYPES } from '../../config/constants.js';

export const createInquirySchema = {
  body: z
    .object({
      name: z.string().min(2, 'Contact name must be at least 2 characters').trim(),
      email: z.string().email('Please enter a valid business email address').trim(),
      company: z.string().min(2, 'Company name is required').trim(),
      phone: z.string().optional().default(''),
      whatsapp: z.string().optional().default(''),
      designation: z.string().optional().default(''),
      website: z.string().optional().default(''),
      country: z.string().min(2, 'Destination country is required').trim(),
      city: z.string().optional().default(''),
      buyerType: z.enum(BUYER_TYPES).optional().default('importer'),
      items: z
        .array(
          z.object({
            productId: z.string().optional().nullable(),
            productName: z.string().min(1, 'Product name is required'),
            quantity: z.coerce.number().min(1, 'Quantity must be at least 1').default(1),
            unit: z.string().default('MT'),
            packing: z.string().optional().default(''),
            form: z.string().optional().default(''),
            grade: z.string().optional().default(''),
          })
        )
        .optional()
        .default([]),
      destinationPort: z.string().optional().default(''),
      incoterm: z.string().optional().default('CIF'),
      targetShipmentMonth: z.string().optional().default(''),
      paymentTerm: z.string().optional().default('TT'),
      needsPrivateLabel: z.boolean().optional().default(false),
      needsSample: z.boolean().optional().default(false),
      message: z.string().optional().default(''),
      // Anti-spam honeypot field: must be empty
      website_hp: z.string().optional().default(''),
    })
    .refine(
      (data) => (data.items && data.items.length > 0) || (data.message && data.message.trim().length > 0),
      {
        message: 'Please select at least one commodity from the catalogue or provide inquiry specifications in the message.',
        path: ['items'],
      }
    ),
};
