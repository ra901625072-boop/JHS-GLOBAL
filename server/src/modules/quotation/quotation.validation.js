import { z } from 'zod';

export const createQuotationSchema = z.object({
  inquiryId: z.string().optional().nullable(),
  inquiryReference: z.string().optional(),
  customerId: z.string().optional().nullable(),
  buyer: z.object({
    name: z.string().min(2, 'Buyer name is required'),
    email: z.string().email('Valid buyer email is required'),
    company: z.string().min(2, 'Company name is required'),
    country: z.string().min(2, 'Destination country is required'),
    phone: z.string().optional().default(''),
    address: z.string().optional().default(''),
  }),
  items: z.array(
    z.object({
      productId: z.string().optional().nullable(),
      productName: z.string().min(1, 'Product name is required'),
      specification: z.string().optional().default(''),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unit: z.string().default('MT'),
      unitPrice: z.number().min(0, 'Unit price must be non-negative'),
      total: z.number().min(0, 'Total must be non-negative'),
    })
  ).min(1, 'Quotation must include at least one product item'),
  currency: z.string().default('USD'),
  subtotal: z.number().min(0),
  shippingCharges: z.number().min(0).default(0),
  insuranceCharges: z.number().min(0).default(0),
  otherCharges: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  incoterm: z.enum(['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP', 'CIP']).default('CIF'),
  portOfLoading: z.string().default('Mundra Port / JNPT, India'),
  portOfDischarge: z.string().default(''),
  paymentTerms: z.string().default('30% Advance TT, 70% against Bill of Lading copy'),
  validityDate: z.string().or(z.date()),
  deliveryTime: z.string().default('15-20 business days post order confirmation'),
  status: z.enum(['draft', 'sent', 'negotiation', 'accepted', 'rejected', 'expired']).default('draft'),
  notes: z.string().optional().default(''),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'negotiation', 'accepted', 'rejected', 'expired']),
  notes: z.string().optional(),
});
