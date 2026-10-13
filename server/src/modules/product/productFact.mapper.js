/**
 * Maps a Product record into an atomic, normalized Fact Ledger for LLM grounding.
 * Strictly separates VERIFIED facts from TYPICAL_UNVERIFIED and UNKNOWN facts.
 */

export const mapProductToFactLedger = (product) => {
  if (!product) return [];

  const p = typeof product.toJSON === 'function' ? product.toJSON() : product;
  const pId = p.id || p._id || 'UNKNOWN';
  const facts = [];

  // 1. Identity & Classification (VERIFIED)
  facts.push({
    id: `FACT-PROD-${pId}-NAME`,
    productId: pId,
    productName: p.name,
    key: 'Product Name',
    value: p.name,
    status: 'VERIFIED',
    constraint: 'State product name accurately as listed in the export catalogue.',
  });

  facts.push({
    id: `FACT-PROD-${pId}-CATEGORY`,
    productId: pId,
    productName: p.name,
    key: 'Export Division',
    value: p.category?.name || p.category || 'Specialty Raw Materials',
    status: 'VERIFIED',
    constraint: 'Official export division.',
  });

  if (p.subCategory?.name || p.subCategory) {
    facts.push({
      id: `FACT-PROD-${pId}-SUBCATEGORY`,
      productId: pId,
      productName: p.name,
      key: 'Sub-Category',
      value: p.subCategory?.name || p.subCategory,
      status: 'VERIFIED',
      constraint: 'Product sub-classification.',
    });
  }

  // 2. Regulatory Trade HS Code (VERIFIED)
  if (p.hsCode) {
    facts.push({
      id: `FACT-PROD-${pId}-HS`,
      productId: pId,
      productName: p.name,
      key: 'HS Code',
      value: p.hsCode,
      status: 'VERIFIED',
      constraint: 'Harmonized System export tariff heading.',
    });
  }

  // 3. Botanical / Chemical Nomenclature
  if (p.botanicalName && p.botanicalName.trim()) {
    facts.push({
      id: `FACT-PROD-${pId}-BOTANICAL`,
      productId: pId,
      productName: p.name,
      key: 'Botanical / Scientific Nomenclature',
      value: p.botanicalName,
      status: 'VERIFIED',
      constraint: 'Scientific binomial or botanical classification.',
    });
  }

  // 4. Physical Forms Available
  const formsArray = Array.isArray(p.forms) ? p.forms : [];
  if (formsArray.length > 0) {
    facts.push({
      id: `FACT-PROD-${pId}-FORMS`,
      productId: pId,
      productName: p.name,
      key: 'Available Forms',
      value: formsArray.join(', '),
      status: 'VERIFIED',
      constraint: 'Physical forms processed and supplied.',
    });
  }

  // 5. Technical Specifications (VERIFIED vs TYPICAL_UNVERIFIED)
  const specs = Array.isArray(p.specs) ? p.specs : [];
  specs.forEach((s, idx) => {
    const isSpecVerified = Boolean(s.verified);
    const hasTodo = (s.notes || '').toLowerCase().includes('todo') || (s.value || '').toLowerCase().includes('todo');
    const status = isSpecVerified && !hasTodo ? 'VERIFIED' : 'TYPICAL_UNVERIFIED';

    facts.push({
      id: `FACT-PROD-${pId}-SPEC-${idx + 1}`,
      productId: pId,
      productName: p.name,
      key: s.key,
      value: `${s.value}${s.unit ? ' ' + s.unit : ''}`,
      status,
      notes: s.notes || '',
      constraint:
        status === 'VERIFIED'
          ? 'Guaranteed specification parameter supported by batch test standard.'
          : 'TYPICAL SPECIFICATION ONLY — must be stated as typical or to be confirmed by our team per lot Certificate of Analysis (COA). Never present as an absolute guarantee.',
    });
  });

  // 6. Packaging Options
  const packingOptions = Array.isArray(p.packing) ? p.packing : [];
  if (packingOptions.length > 0) {
    const packingStr = packingOptions
      .map((pkg) => `${pkg.size} ${pkg.type}${pkg.notes ? ' (' + pkg.notes + ')' : ''}`)
      .join('; ');

    facts.push({
      id: `FACT-PROD-${pId}-PACKING`,
      productId: pId,
      productName: p.name,
      key: 'Export Packaging Formats',
      value: packingStr,
      status: 'VERIFIED',
      constraint: 'Standard export packaging types. Custom palletization available on request.',
    });
  }

  // 7. Minimum Order Quantity (MOQ)
  if (p.moq) {
    const moqVal = typeof p.moq === 'object' ? `${p.moq.value || 1} ${p.moq.unit || 'MT'}` : String(p.moq);
    const moqHasTodo = moqVal.toLowerCase().includes('todo');
    facts.push({
      id: `FACT-PROD-${pId}-MOQ`,
      productId: pId,
      productName: p.name,
      key: 'Minimum Order Quantity (MOQ)',
      value: moqVal.replace(/—\s*TODO\(client\)/gi, '').trim(),
      status: moqHasTodo ? 'TYPICAL_UNVERIFIED' : 'VERIFIED',
      constraint:
        moqHasTodo
          ? 'Typical MOQ threshold; final commercial volume is confirmed upon quote request.'
          : 'Verified minimum commercial order volume.',
    });
  }

  // 8. Origin
  const origins = Array.isArray(p.origin) ? p.origin.join(', ') : p.origin || 'India';
  const originHasTodo = origins.toLowerCase().includes('todo');
  facts.push({
    id: `FACT-PROD-${pId}-ORIGIN`,
    productId: pId,
    productName: p.name,
    key: 'Country & Region of Origin',
    value: origins.replace(/—\s*TODO\(client\)/gi, '').trim(),
    status: originHasTodo ? 'TYPICAL_UNVERIFIED' : 'VERIFIED',
    constraint: 'Source country / agricultural belt in India.',
  });

  // 9. Shelf Life & Storage
  if (p.shelfLife) {
    const shelfLifeHasTodo = p.shelfLife.toLowerCase().includes('todo');
    facts.push({
      id: `FACT-PROD-${pId}-SHELFLIFE`,
      productId: pId,
      productName: p.name,
      key: 'Shelf Life',
      value: p.shelfLife.replace(/—\s*TODO\(client\)/gi, '').trim(),
      status: shelfLifeHasTodo ? 'TYPICAL_UNVERIFIED' : 'VERIFIED',
      constraint: 'Typical shelf life when stored under recommended conditions.',
    });
  }

  if (p.storage) {
    facts.push({
      id: `FACT-PROD-${pId}-STORAGE`,
      productId: pId,
      productName: p.name,
      key: 'Storage Conditions',
      value: p.storage,
      status: 'VERIFIED',
      constraint: 'Recommended warehousing and climate storage conditions.',
    });
  }

  // 10. Lead Time
  if (p.leadTime) {
    const leadTimeHasTodo = p.leadTime.toLowerCase().includes('todo');
    facts.push({
      id: `FACT-PROD-${pId}-LEADTIME`,
      productId: pId,
      productName: p.name,
      key: 'Production & Dispatch Lead Time',
      value: p.leadTime.replace(/—\s*TODO\(client\)/gi, '').trim(),
      status: leadTimeHasTodo ? 'TYPICAL_UNVERIFIED' : 'VERIFIED',
      constraint: 'Typical turnaround post payment confirmation; vessel schedule confirmed on proforma.',
    });
  }

  // 11. Commercial Trade Parameters (RESTRICTED / GUARDRAILS)
  facts.push({
    id: `FACT-PROD-${pId}-PRICING`,
    productId: pId,
    productName: p.name,
    key: 'Commercial Trade Pricing',
    value: 'Price on Request only. International container trade pricing is calculated per metric tonne based on target volume (FCL/LCL), packaging type, and live ocean freight to destination port.',
    status: 'RESTRICTED',
    constraint: 'HARD RULE: NEVER invent, estimate, or quote numeric dollar prices. Direct buyer to Add to Quote or Request a Quote form.',
  });

  facts.push({
    id: `FACT-PROD-${pId}-STOCK`,
    productId: pId,
    productName: p.name,
    key: 'Physical Warehouse Stock',
    value: 'Container inventory is allocated per active export contract and fresh seasonal harvest. Physical lot availability is verified by the export desk upon RFQ.',
    status: 'UNKNOWN',
    constraint: 'HARD RULE: NEVER confirm warehouse stock quantities. State that our export desk will confirm lot availability.',
  });

  facts.push({
    id: `FACT-PROD-${pId}-REGULATORY-DISCLAIMER`,
    productId: pId,
    productName: p.name,
    key: 'Regulatory & Health Disclaimer',
    value: 'Supplied exclusively as raw ingredients for cosmetic, dietary supplement, or feed manufacturers. Regulatory compliance and approved claims vary by destination market; buyers are responsible for compliance with their local regulations.',
    status: 'RESTRICTED',
    constraint: 'HARD RULE: NO therapeutic, medicinal, or disease cure claims. Include regulatory notice for nutraceutical queries.',
  });

  return facts;
};

/**
 * Formats an array of mapped facts into text block for LLM prompt context
 */
export const formatProductFactsForPrompt = (facts = []) => {
  if (!facts || facts.length === 0) return '';

  return facts
    .map((f) => {
      let block = `[FACT-ID: ${f.id}]\n`;
      block += `Key: ${f.key}\n`;
      block += `Value: ${f.value}\n`;
      block += `Status: ${f.status}\n`;
      if (f.notes) block += `Notes: ${f.notes}\n`;
      block += `Rule: ${f.constraint}`;
      return block;
    })
    .join('\n\n');
};

/**
 * Generates an accurate, un-hallucinated vector chunk for product embedding
 */
export const generateGroundedProductChunk = (product) => {
  const p = typeof product.toJSON === 'function' ? product.toJSON() : product;
  const facts = mapProductToFactLedger(p);

  const verifiedFacts = facts.filter((f) => f.status === 'VERIFIED');
  const typicalFacts = facts.filter((f) => f.status === 'TYPICAL_UNVERIFIED');

  let text = `PRODUCT SPECIFICATION SHEET (EXPORT CATALOGUE)\n`;
  text += `Product Name: ${p.name}\n`;
  text += `Division: ${p.category?.name || p.category || 'Specialty Raw Materials'}\n`;
  text += `HS Code: ${p.hsCode || 'N/A'}\n`;
  if (p.botanicalName) text += `Botanical Name: ${p.botanicalName}\n`;
  if (p.forms?.length) text += `Available Forms: ${p.forms.join(', ')}\n`;

  text += `\nVERIFIED ATTRIBUTES:\n`;
  verifiedFacts
    .filter((f) => !['Product Name', 'Export Division', 'HS Code', 'Botanical / Scientific Nomenclature', 'Available Forms'].includes(f.key))
    .forEach((f) => {
      text += `- ${f.key}: ${f.value}\n`;
    });

  if (typicalFacts.length > 0) {
    text += `\nTYPICAL SPECIFICATIONS (SUBJECT TO BATCH COA CONFIRMATION):\n`;
    typicalFacts.forEach((f) => {
      text += `- ${f.key}: ${f.value} [Typical spec; verify with lot COA]\n`;
    });
  }

  text += `\nCOMMERCIAL EXPORT RULES:\n`;
  text += `- Pricing: Strictly 'Price on Request' based on container tonnage and ocean freight.\n`;
  text += `- Regulatory: Raw ingredient only; no therapeutic or medical claims.\n`;
  text += `- Unlisted Sourcing: Sourced within 48 hours upon request if not in current catalogue.\n`;

  return text.trim();
};

export default {
  mapProductToFactLedger,
  formatProductFactsForPrompt,
  generateGroundedProductChunk,
};
