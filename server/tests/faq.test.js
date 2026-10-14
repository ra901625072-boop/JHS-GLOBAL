import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Faq from '../src/modules/faq/faq.model.js';
import seedTrustData from '../src/seeds/trust.seed.js';

describe('FAQ API & Data Contract Suite', () => {
  beforeAll(async () => {
    await connectDB();
    await seedTrustData();
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/faqs should return active FAQs array with valid structure', async () => {
    const res = await request(app).get('/api/v1/faqs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(7);

    const first = res.body.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('question');
    expect(first).toHaveProperty('answer');
    expect(first).toHaveProperty('group');
    expect(first).toHaveProperty('slug');
  });

  it('GET /api/v1/faqs?group=... should filter FAQs by group category', async () => {
    const targetGroup = 'Ordering & Minimum Quantities (MOQ)';
    const res = await request(app).get(`/api/v1/faqs?group=${encodeURIComponent(targetGroup)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((faq) => {
      expect(faq.group).toBe(targetGroup);
    });
  });

  it('GET /api/v1/faqs?featured=true should return only homepage featured questions', async () => {
    const res = await request(app).get('/api/v1/faqs?featured=true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(5);

    // Verify ordering
    for (let i = 0; i < res.body.data.length; i++) {
      expect(res.body.data[i].showOnHome).toBe(true);
      if (i > 0) {
        expect(res.body.data[i].homeOrder).toBeGreaterThanOrEqual(res.body.data[i - 1].homeOrder);
      }
    }
  });

  it('GET /api/v1/faqs/item/:slug should return single question by slug', async () => {
    const res = await request(app).get('/api/v1/faqs/item/standard-minimum-order-quantity-moq');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('standard-minimum-order-quantity-moq');
    expect(res.body.data.question).toContain('Minimum Order Quantity');
  });

  it('GET /api/v1/faqs/item/invalid-slug should return 404', async () => {
    const res = await request(app).get('/api/v1/faqs/item/non-existent-question-slug-404');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/v1/faqs/admin/all without auth should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/faqs/admin/all');
    expect(res.status).toBe(401);
  });
});
