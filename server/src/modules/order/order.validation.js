import { z } from 'zod';

export const createOrderSchema = z.object({
  quotationId: z.string().optional().nullable(),
  inquiryId: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  buyer: z.object({
    name: z.string().min(2, 'Buyer name is required'),
    email: z.string().email('Valid buyer email is required'),
    company: z.string().min(2, 'Company name is required'),
    country: z.string().min(2, 'Destination country is required'),
    phone: z.string().optional().default(''),
    address: z.string().optional().default(''),
  }),
  products: z.array(
    z.object({
      productName: z.string().min(1, 'Product name is required'),
      specification: z.string().optional().default(''),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unit: z.string().default('MT'),
      unitPrice: z.number().min(0, 'Unit price must be non-negative'),
      total: z.number().min(0, 'Total must be non-negative'),
    })
  ).min(1, 'Order must include at least one product item'),
  currency: z.string().default('USD'),
  totalAmount: z.number().min(0),
  incoterm: z.enum(['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP', 'CIP']).default('CIF'),
  paymentTerms: z.string().default('30% Advance TT, 70% against BL copy'),
  shippingMethod: z.string().default('Ocean FCL'),
  destinationPort: z.string().optional().default(''),
  expectedShipmentDate: z.string().or(z.date()).optional().nullable(),
  notes: z.string().optional().default(''),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    'confirmed',
    'processing',
    'ready_for_shipment',
    'shipped',
    'in_transit',
    'delivered',
    'completed',
    'cancelled',
  ]),
  notes: z.string().optional(),
});

export const updateShipmentSchema = z.object({
  containerNumber: z.string().optional(),
  shippingLine: z.string().optional(),
  portOfLoading: z.string().optional(),
  portOfDischarge: z.string().optional(),
  etd: z.string().or(z.date()).optional().nullable(),
  eta: z.string().or(z.date()).optional().nullable(),
  billOfLadingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  shippingStatus: z.enum([
    'booked',
    'loaded',
    'at_sea',
    'arrived_at_port',
    'customs_cleared',
    'delivered',
    'pending',
  ]).optional(),
});

export const addExportDocumentSchema = z.object({
  documentType: z.enum([
    'Commercial Invoice',
    'Packing List',
    'Certificate of Origin',
    'Bill of Lading',
    'Phytosanitary Certificate',
    'Insurance Certificate',
    'Certificate of Analysis (COA)',
    'Inspection Certificate',
    'Other',
  ]),
  documentNumber: z.string().optional().default(''),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
});
