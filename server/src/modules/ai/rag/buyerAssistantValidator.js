import logger from '../../../utils/logger.js';

const ALLOWED_SYSTEM_FACT_IDS = new Set([
  'NEG-CERT-UNHELD',
  'POLICY-PRICE-ON-REQUEST',
  'POLICY-QUOTE-48H',
  'POLICY-SAMPLE-REQUEST',
  'POLICY-PAYMENT-TERMS',
  'CATALOGUE-GENERAL',
]);

/**
 * Validates buyer assistant output against the supplied fact ledger and strict zero-hallucination guardrails.
 *
 * @param {object} params
 * @param {object} params.output - Parsed model output object
 * @param {Array} params.factLedger - Array of supplied facts { id, key, value, isVerified, ... }
 * @param {string} params.userMessage - Visitor inquiry
 * @returns {{ isValid: boolean, violations: string[], sanitized: object }}
 */
export function validateAssistantOutput({ output, factLedger = [], userMessage = '' }) {
  const violations = [];
  const validLedgerIds = new Set([
    ...ALLOWED_SYSTEM_FACT_IDS,
    ...factLedger.map((f) => f.id),
  ]);

  const sanitized = {
    answer: output.answer || '',
    intent: output.intent || 'product_info',
    used_fact_ids: Array.isArray(output.used_fact_ids) ? [...output.used_fact_ids] : [],
    confidence: typeof output.confidence === 'number' ? output.confidence : 0.8,
    needs_human: Boolean(output.needs_human),
    suggested_action: output.suggested_action || 'none',
    follow_up_question: output.follow_up_question || null,
    source_chips: Array.isArray(output.source_chips) ? [...output.source_chips] : [],
  };

  // 1. Fact ID Citation Validation
  const invalidFactIds = sanitized.used_fact_ids.filter((id) => !validLedgerIds.has(id));
  if (invalidFactIds.length > 0) {
    violations.push(`Model cited unsupplied or hallucinated fact IDs: ${invalidFactIds.join(', ')}`);
    // Filter down to only valid IDs
    sanitized.used_fact_ids = sanitized.used_fact_ids.filter((id) => validLedgerIds.has(id));
  }

  // 2. Unverified Specs Guarantee Guardrail
  const ledgerMap = new Map(factLedger.map((f) => [f.id, f]));
  for (const citedId of sanitized.used_fact_ids) {
    const fact = ledgerMap.get(citedId);
    if (fact && fact.isVerified === false) {
      const lowerAnswer = sanitized.answer.toLowerCase();
      // Check if model declared an unverified spec as guaranteed
      if (
        (lowerAnswer.includes('guarantee') || lowerAnswer.includes('certified') || lowerAnswer.includes('warranted')) &&
        !lowerAnswer.includes('typical') &&
        !lowerAnswer.includes('to be confirmed') &&
        !lowerAnswer.includes('subject to')
      ) {
        violations.push(`Unverified spec [${citedId}] was asserted without required "typical" qualification`);
      }
    }
  }

  // 3. Price Hallucination Guardrail
  // Disallow concrete dollar amounts or currency rates unless explicitly in verified ledger
  const priceRegex = /(?:\$|USD|EUR|€)\s*\d+(?:[.,]\d+)?|\b\d+\s*(?:\/|\s*per\s*)(?:MT|Metric Ton|ton|tonne|kg)\b/i;
  if (priceRegex.test(sanitized.answer)) {
    // Check if the price was actually in the fact ledger
    const hasPriceInLedger = factLedger.some((f) => priceRegex.test(String(f.value || '')));
    if (!hasPriceInLedger) {
      violations.push('Answer contains invented numeric price or freight rate');
    }
  }

  // 4. Fake Certification Guardrail
  const lowerAnswer = sanitized.answer.toLowerCase();
  const claimsIso = /\b(we hold|certified by|registered with)\b.*\b(iso\s*(?:9001|22000)?)\b/i.test(sanitized.answer);
  const claimsHalal = /\b(we hold|we are|have)\b.*\b(halal|kosher)\b/i.test(sanitized.answer);
  const claimsFdaFacility = /\b(fda\s*(?:approved|registered facility))\b/i.test(sanitized.answer);

  if (claimsIso || claimsHalal || claimsFdaFacility) {
    violations.push('Answer falsely claimed unheld accreditation (ISO, Halal, Kosher, or FDA facility registration)');
  }

  // 5. Medical & Therapeutic Claims Guardrail
  const medicalClaimRegex = /\b(cures?|treats?|reverses?|prevents?)\s+(?:cancer|diabetes|hypertension|cardiovascular|disease|infection)\b/i;
  if (medicalClaimRegex.test(sanitized.answer)) {
    violations.push('Answer made prohibited therapeutic or medicinal claims for raw ingredients');
  }

  const isValid = violations.length === 0;

  if (!isValid) {
    logger.warn(`Buyer Assistant Output Validation Failed: ${violations.join('; ')}`);
  }

  return {
    isValid,
    violations,
    sanitized,
  };
}

/**
 * Sanitizes and falls back to safe text if validation fails and retry is exhausted.
 *
 * @param {object} params
 * @param {object} params.sanitized - Partially sanitized output
 * @param {string[]} params.violations - Detected validation issues
 * @param {Array} params.factLedger - Supplied fact ledger
 * @returns {object} Safe, grounded response object conforming to schema
 */
export function sanitizeAssistantFallback({ sanitized, violations = [], factLedger = [] }) {
  const safe = { ...sanitized };

  // Always mark human confirmation needed
  safe.needs_human = true;
  safe.confidence = Math.min(safe.confidence, 0.65);
  safe.suggested_action = 'open_rfq';

  // Handle fake cert violation
  if (violations.some((v) => v.includes('unheld accreditation'))) {
    safe.answer = `JHS Global operates under verified Indian statutory authorities: FSSAI Central License (No. 10725997001058), APEDA, FIEO, Spices Board of India, DGFT IEC, and GST [FACT-ID: FACT-COMP-fssai_central_license]. We do NOT hold ISO, Halal, Kosher, or US FDA facility registrations. We can arrange independent pre-shipment quality verification upon buyer request.`;
    safe.used_fact_ids = ['NEG-CERT-UNHELD', 'FACT-COMP-fssai_central_license'];
    return safe;
  }

  // Handle price hallucination violation
  if (violations.some((v) => v.includes('invented numeric price'))) {
    safe.answer = `In international bulk container trade, all pricing is calculated strictly 'Price on Request'. Firm pricing depends on order tonnage, packing grade, destination discharge port, and live ocean freight rates. Our export desk provides formal proforma quotations within 48 business hours. Please submit an RFQ to receive binding terms.`;
    safe.used_fact_ids = ['POLICY-PRICE-ON-REQUEST'];
    return safe;
  }

  // General fallback for ungrounded claims or invalid fact IDs
  safe.answer = `Our export technical desk will verify these specific technical parameters and lot documentation directly for your inquiry. Please submit an RFQ or contact our desk to confirm batch specifications.`;
  safe.follow_up_question = `Would you like to send an RFQ with your target specifications?`;

  return safe;
}
