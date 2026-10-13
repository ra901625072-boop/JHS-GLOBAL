import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createSlug } from '../src/utils/slugify.js';
import { getPagination, formatPaginationMeta } from '../src/utils/pagination.js';
import { motionTokens } from '../../client/src/styles/motion.js';
import { createInquirySchema } from '../src/modules/inquiry/inquiry.validation.js';
import { createSampleSchema } from '../src/modules/sample/sample.validation.js';

describe('Stage 2: Unit & Property-Based Test Suite (fast-check)', () => {
  // ─── 1. Slugify Invariants & Properties ──────────────────────────────────
  describe('slugify property tests', () => {
    it('always returns a string with only lowercase alphanumeric chars and hyphens', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const slug = createSlug(text);
          expect(typeof slug).toBe('string');
          // Should only contain lowercase letters, numbers, and hyphens
          expect(slug).toMatch(/^[a-z0-9-]*$/);
        })
      );
    });

    it('is strictly idempotent: slugify(slugify(x)) === slugify(x)', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const once = createSlug(text);
          const twice = createSlug(once);
          expect(twice).toBe(once);
        })
      );
    });

    it('never begins or ends with a hyphen', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const slug = createSlug(text);
          if (slug.length > 0) {
            expect(slug.startsWith('-')).toBe(false);
            expect(slug.endsWith('-')).toBe(false);
          }
        })
      );
    });

    it('handles falsy or empty inputs gracefully', () => {
      expect(createSlug('')).toBe('');
      expect(createSlug(null)).toBe('');
      expect(createSlug(undefined)).toBe('');
    });
  });

  // ─── 2. Pagination Math & Boundaries ─────────────────────────────────────
  describe('pagination property tests', () => {
    it('always returns page >= 1 and 1 <= limit <= maxLimit for any arbitrary query input', () => {
      fc.assert(
        fc.property(
          fc.record({
            page: fc.oneof(fc.integer(), fc.string(), fc.constant(null)),
            limit: fc.oneof(fc.integer(), fc.string(), fc.constant(null)),
          }),
          fc.integer({ min: 10, max: 100 }),
          (query, maxLimit) => {
            const result = getPagination(query, 12, maxLimit);
            expect(result.page).toBeGreaterThanOrEqual(1);
            expect(result.limit).toBeGreaterThanOrEqual(1);
            expect(result.limit).toBeLessThanOrEqual(maxLimit);
            expect(result.offset).toBe((result.page - 1) * result.limit);
            expect(result.skip).toBe(result.offset);
          }
        )
      );
    });

    it('accurately computes pagination metadata invariants for any total and limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 50 }),
          (total, page, limit) => {
            const meta = formatPaginationMeta(total, page, limit);
            expect(meta.total).toBe(total);
            expect(meta.page).toBe(page);
            expect(meta.limit).toBe(limit);
            expect(meta.totalPages).toBe(Math.ceil(total / limit) || 1);
            expect(meta.hasNext).toBe(page * limit < total);
            expect(meta.hasPrev).toBe(page > 1);
          }
        )
      );
    });
  });

  // ─── 3. Motion Tokens & Physics Invariants ────────────────────────────────
  describe('motion token invariants', () => {
    it('ensures all duration tokens are non-negative finite numbers', () => {
      for (const [key, duration] of Object.entries(motionTokens.duration)) {
        expect(typeof duration).toBe('number');
        expect(Number.isFinite(duration)).toBe(true);
        expect(duration).toBeGreaterThanOrEqual(0);
      }
    });

    it('ensures durationCss values match numeric durations with ms suffix', () => {
      for (const [key, cssVal] of Object.entries(motionTokens.durationCss)) {
        const numericVal = motionTokens.duration[key];
        expect(cssVal).toBe(`${numericVal}ms`);
      }
    });

    it('ensures cubic-bezier easings follow valid CSS coordinate boundaries', () => {
      const bezierRegex = /^cubic-bezier\(\s*([\d.]+),\s*(-?[\d.]+),\s*([\d.]+),\s*(-?[\d.]+)\s*\)$/;
      for (const [key, curve] of Object.entries(motionTokens.easing)) {
        if (curve === 'linear') continue;
        const match = curve.match(bezierRegex);
        expect(match).not.toBeNull();
        const [, x1, y1, x2, y2] = match.map(Number);
        // x coordinates must be bounded in [0, 1]
        expect(x1).toBeGreaterThanOrEqual(0);
        expect(x1).toBeLessThanOrEqual(1);
        expect(x2).toBeGreaterThanOrEqual(0);
        expect(x2).toBeLessThanOrEqual(1);
      }
    });

    it('ensures stagger values are positive decimals <= 0.2s', () => {
      expect(motionTokens.stagger.fast).toBeGreaterThan(0);
      expect(motionTokens.stagger.fast).toBeLessThanOrEqual(0.2);
      expect(motionTokens.stagger.base).toBeGreaterThan(0);
      expect(motionTokens.stagger.base).toBeLessThanOrEqual(0.2);
    });
  });

  // ─── 4. Validation Schema Invariants ──────────────────────────────────────
  describe('Zod validation schemas', () => {
    it('validates standard RFQ input and rejects missing required fields', () => {
      const validPayload = {
        name: 'Rajesh Patel',
        email: 'rajesh@patelchem.com',
        company: 'Patel Chemical Exports',
        country: 'India',
        phone: '+919876543210',
        message: 'Looking for 20 MT pharmaceutical grade Castor Oil.',
      };

      const validResult = createInquirySchema.body.safeParse(validPayload);
      expect(validResult.success).toBe(true);

      const invalidPayload = {
        name: 'R', // Too short
        email: 'not-an-email',
      };
      const invalidResult = createInquirySchema.body.safeParse(invalidPayload);
      expect(invalidResult.success).toBe(false);
      const errors = invalidResult.error.flatten().fieldErrors;
      expect(errors).toHaveProperty('name');
      expect(errors).toHaveProperty('email');
      expect(errors).toHaveProperty('company');
      expect(errors).toHaveProperty('country');
    });

    it('validates sample request schema requiring shipping address', () => {
      const validSample = {
        name: 'Elena Rostova',
        email: 'elena@baltic.pl',
        company: 'Baltic Ingredients',
        country: 'Poland',
        products: [{ productName: 'Salem Turmeric', qty: '250g' }],
        shippingAddress: {
          street: 'Ul. Marszalkowska 10',
          city: 'Warsaw',
          postalCode: '00-001',
          country: 'Poland',
        },
      };

      const result = createSampleSchema.body.safeParse(validSample);
      expect(result.success).toBe(true);

      const missingAddress = {
        name: 'Elena Rostova',
        email: 'elena@baltic.pl',
        company: 'Baltic Ingredients',
        country: 'Poland',
        products: [{ productName: 'Salem Turmeric', qty: '250g' }],
      };
      const invalidResult = createSampleSchema.body.safeParse(missingAddress);
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error.flatten().fieldErrors).toHaveProperty('shippingAddress');
    });
  });
});
