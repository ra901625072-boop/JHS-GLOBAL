import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';

describe('Product API Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  }, 30000);

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/products should return paginated products with metadata', async () => {
    const res = await request(app).get('/api/v1/products?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(5);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('GET /api/v1/products?category=... should filter products by category slug', async () => {
    const res = await request(app).get('/api/v1/products?category=personal-care-raw-materials');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/products?q=ashwagandha should perform keyword search', async () => {
    const res = await request(app).get('/api/v1/products?q=ashwagandha');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const hasAshwagandha = res.body.data.some((p) => p.name.toLowerCase().includes('ashwagandha'));
    expect(hasAshwagandha).toBe(true);
  });

  it('GET /api/v1/products/featured should return featured products', async () => {
    const res = await request(app).get('/api/v1/products/featured');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/products/:slug should return complete product technical specifications', async () => {
    const res = await request(app).get('/api/v1/products/ashwagandha-extract');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hsCode).toBe('1302.19');
    expect(Array.isArray(res.body.data.specs)).toBe(true);
    expect(res.body.data.specs.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.images)).toBe(true);
    expect(Array.isArray(res.body.data.packing)).toBe(true);
    expect(res.body.data.moq).toBeDefined();
    expect(res.body.data._id).toBe(res.body.data.id);
  });

  it('GET /api/v1/products/:slug/related should return related category products', async () => {
    const res = await request(app).get('/api/v1/products/ashwagandha-extract/related');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/search/suggest?q=ash should return autocomplete suggestions', async () => {
    const res = await request(app).get('/api/v1/search/suggest?q=ash');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('slug');
    expect(res.body.data[0]).toHaveProperty('hsCode');
  });

  it('GET /api/v1/products/non-existent-product should return 404', async () => {
    const res = await request(app).get('/api/v1/products/non-existent-product');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('cacheService.invalidateProducts should purge products, slug PDP, and search suggestions cache', async () => {
    const { cacheService } = await import('../src/services/cache.service.js');
    await cacheService.set('http:/api/v1/products', { data: [1, 2] });
    await cacheService.set('http:/api/v1/products/ashwagandha-extract', { data: { name: 'Ashwagandha' } });
    await cacheService.set('http:/api/v1/search/suggest?q=ash', { data: ['suggest'] });

    cacheService.invalidateProducts('ashwagandha-extract');

    expect(await cacheService.get('http:/api/v1/products')).toBeNull();
    expect(await cacheService.get('http:/api/v1/products/ashwagandha-extract')).toBeNull();
    expect(await cacheService.get('http:/api/v1/search/suggest?q=ash')).toBeNull();
  });
});
