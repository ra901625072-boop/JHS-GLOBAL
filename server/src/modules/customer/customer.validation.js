import { z } from 'zod';
import { BUYER_TYPES } from '../../config/constants.js';

export const createCustomerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  country: z.string().min(2, 'Country is required'),
  city: z.string().optional().default(''),
  email: z.string().email('Valid business email is required'),
  phone: z.string().optional().default(''),
  whatsapp: z.string().optional().default(''),
  website: z.string().optional().default(''),
  businessType: z.enum(BUYER_TYPES).default('importer'),
  interestedProducts: z.array(z.string()).optional().default([]),
  currency: z.string().default('USD'),
  preferredPort: z.string().optional().default(''),
  preferredIncoterm: z.string().default('CIF'),
  paymentTerms: z.string().default('30% Advance TT'),
  shippingPreference: z.string().optional().default('FCL Standard 20ft'),
  assignedSalesperson: z.string().optional().nullable(),
  note: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  companyName: z.string().min(2).optional(),
  contactPerson: z.string().min(2).optional(),
  country: z.string().min(2).optional(),
  city: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  businessType: z.enum(BUYER_TYPES).optional(),
  interestedProducts: z.array(z.string()).optional(),
  currency: z.string().optional(),
  preferredPort: z.string().optional(),
  preferredIncoterm: z.string().optional(),
  paymentTerms: z.string().optional(),
  shippingPreference: z.string().optional(),
  assignedSalesperson: z.string().optional().nullable(),
  note: z.string().optional(),
});
