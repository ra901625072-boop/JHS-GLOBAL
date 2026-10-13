import { describe, it, expect } from 'vitest';
import {
  mapProductToFactLedger,
  formatProductFactsForPrompt,
  generateGroundedProductChunk,
} from '../src/modules/product/productFact.mapper.js';

describe('Product Fact Mapping & Verification Suite', () => {
  const sampleProduct = {
    id: 12,
    name: 'Ashwagandha extract',
    category: { name: 'Nutraceutical Raw Materials' },
    subCategory: { name: 'Standardized Botanical Extracts' },
    hsCode: '1302.19',
    botanicalName: 'Withania somnifera',
    origin: ['India (Gujarat / Madhya Pradesh) — TODO(client)'],
    forms: ['Fine Dry Powder (80 mesh)', 'Water-Soluble Granules'],
    grades: ['Export Quality', 'USP Grade'],
    specs: [
      {
        key: 'Withanolides Content',
        value: '2.5% – 5.0%',
        unit: 'HPLC %',
        verified: false,
        notes: 'Typical active assay range; confirm with lot COA — TODO(client)',
      },
      {
        key: 'Moisture',
        value: '≤ 5.0%',
        unit: '%',
        verified: false,
        notes: 'Karl Fischer titration',
      },
      {
        key: 'Heavy Metals (Pb, As, Cd, Hg)',
        value: '< 10',
        unit: 'ppm',
        verified: false,
        notes: 'ICP-MS laboratory screening',
      },
    ],
    packing: [
      { size: '25 kg', type: 'Fiber Drum with double PE liners', notes: 'Food grade export drum' },
    ],
    moq: { value: 25, unit: 'kg trial lot or 1 MT commercial — TODO(client)' },
    shelfLife: '24 months in sealed original drum — TODO(client)',
    storage: 'Store in cool dry warehouse protected from direct sunlight',
    leadTime: '10–15 business days — TODO(client)',
    isVerified: false,
  };

  it('mapProductToFactLedger should atomize product into structured facts with IDs', () => {
    const facts = mapProductToFactLedger(sampleProduct);

    expect(Array.isArray(facts)).toBe(true);
    expect(facts.length).toBeGreaterThanOrEqual(10);

    const factIds = facts.map((f) => f.id);
    expect(factIds).toContain('FACT-PROD-12-NAME');
    expect(factIds).toContain('FACT-PROD-12-CATEGORY');
    expect(factIds).toContain('FACT-PROD-12-HS');
    expect(factIds).toContain('FACT-PROD-12-BOTANICAL');
    expect(factIds).toContain('FACT-PROD-12-SPEC-1');
    expect(factIds).toContain('FACT-PROD-12-PRICING');
    expect(factIds).toContain('FACT-PROD-12-STOCK');
  });

  it('Verified trade fields (Name, Division, HS Code) must have status VERIFIED', () => {
    const facts = mapProductToFactLedger(sampleProduct);

    const hsFact = facts.find((f) => f.id === 'FACT-PROD-12-HS');
    expect(hsFact).toBeDefined();
    expect(hsFact.status).toBe('VERIFIED');
    expect(hsFact.value).toBe('1302.19');

    const nameFact = facts.find((f) => f.id === 'FACT-PROD-12-NAME');
    expect(nameFact.status).toBe('VERIFIED');
    expect(nameFact.value).toBe('Ashwagandha extract');
  });

  it('Unverified specs with verified=false or TODO must have status TYPICAL_UNVERIFIED', () => {
    const facts = mapProductToFactLedger(sampleProduct);

    const withanolidesFact = facts.find((f) => f.id === 'FACT-PROD-12-SPEC-1');
    expect(withanolidesFact).toBeDefined();
    expect(withanolidesFact.status).toBe('TYPICAL_UNVERIFIED');
    expect(withanolidesFact.value).toBe('2.5% – 5.0% HPLC %');
    expect(withanolidesFact.constraint).toContain('TYPICAL SPECIFICATION ONLY');
  });

  it('MOQ, Origin, and Lead Time with TODO(client) must be flagged TYPICAL_UNVERIFIED', () => {
    const facts = mapProductToFactLedger(sampleProduct);

    const moqFact = facts.find((f) => f.id === 'FACT-PROD-12-MOQ');
    expect(moqFact.status).toBe('TYPICAL_UNVERIFIED');

    const originFact = facts.find((f) => f.id === 'FACT-PROD-12-ORIGIN');
    expect(originFact.status).toBe('TYPICAL_UNVERIFIED');

    const leadTimeFact = facts.find((f) => f.id === 'FACT-PROD-12-LEADTIME');
    expect(leadTimeFact.status).toBe('TYPICAL_UNVERIFIED');
  });

  it('Commercial pricing and stock must have strict guardrail statuses', () => {
    const facts = mapProductToFactLedger(sampleProduct);

    const pricingFact = facts.find((f) => f.id === 'FACT-PROD-12-PRICING');
    expect(pricingFact.status).toBe('RESTRICTED');
    expect(pricingFact.constraint).toContain('NEVER invent');

    const stockFact = facts.find((f) => f.id === 'FACT-PROD-12-STOCK');
    expect(stockFact.status).toBe('UNKNOWN');
    expect(stockFact.constraint).toContain('NEVER confirm warehouse stock');
  });

  it('formatProductFactsForPrompt should format facts into prompt blocks with FACT-IDs', () => {
    const facts = mapProductToFactLedger(sampleProduct);
    const text = formatProductFactsForPrompt(facts);

    expect(text).toContain('[FACT-ID: FACT-PROD-12-NAME]');
    expect(text).toContain('[FACT-ID: FACT-PROD-12-HS]');
    expect(text).toContain('Status: TYPICAL_UNVERIFIED');
    expect(text).toContain('Rule:');
  });

  it('generateGroundedProductChunk should clearly separate typical specs from verified specs', () => {
    const chunk = generateGroundedProductChunk(sampleProduct);

    expect(chunk).toContain('HS Code: 1302.19');
    expect(chunk).toContain('TYPICAL SPECIFICATIONS (SUBJECT TO BATCH COA CONFIRMATION)');
    expect(chunk).toContain('COMMERCIAL EXPORT RULES');
    expect(chunk).not.toContain('verified by NABL batch COA');
  });
});
