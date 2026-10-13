import { z } from 'zod';

export const BuyerAssistantOutputSchema = z.object({
  answer: z
    .string()
    .min(10)
    .describe('Accurate, grounded response citing [FACT-ID: ...] internally for factual statements'),
  intent: z
    .enum([
      'product_info',
      'product_spec',
      'product_comparison',
      'company_about',
      'certifications',
      'shipping_logistics',
      'pricing_moq',
      'sample',
      'private_label',
      'how_to_order',
      'compliance_regulatory',
      'off_topic',
      'abuse',
    ])
    .describe('Classified intent category for the visitor inquiry'),
  used_fact_ids: z
    .array(z.string())
    .describe('List of FACT-IDs from the provided context ledger that were cited or used'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score from 0.0 to 1.0 reflecting knowledge coverage'),
  needs_human: z
    .boolean()
    .describe('True if inquiry requires human confirmation from the export desk'),
  suggested_action: z
    .enum(['add_to_quote', 'open_rfq', 'request_sample', 'contact', 'none'])
    .describe('Actionable next step for the commercial buyer'),
  follow_up_question: z
    .string()
    .nullable()
    .optional()
    .describe('Clarifying question if ambiguous, or next logical technical query'),
  source_chips: z
    .array(
      z.object({
        label: z.string(),
        type: z.enum(['product', 'company', 'policy']),
        slug: z.string().optional(),
      })
    )
    .describe('Visual badges showing origin of facts (e.g., Product Specs, FSSAI License)'),
});
