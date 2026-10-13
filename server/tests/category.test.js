import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';

describe('Category API Endpoints', () => {
  beforeAll(async () => {
    await connectDB();
  }, 30000);

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/categories should return active category tree', async () => {
    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstCat = res.body.data[0];
    expect(firstCat).toHaveProperty('name');
    expect(firstCat).toHaveProperty('slug');
    expect(firstCat).toHaveProperty('children');
  });

  it('GET /api/v1/categories/:slug should return single category with sub-categories', async () => {
    const res = await request(app).get('/api/v1/categories/personal-care-raw-materials');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Personal Care Raw Materials');
    expect(Array.isArray(res.body.data.children)).toBe(true);
  });

  it('GET /api/v1/categories/invalid-slug-404 should return 404', async () => {
    const res = await request(app).get('/api/v1/categories/non-existent-category-slug');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
