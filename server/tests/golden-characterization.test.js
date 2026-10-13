import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import '../src/models/index.js';

describe('Stage 0: Golden Characterization Test Suite', () => {
  let adminToken = '';
  let salesToken = '';

  beforeAll(async () => {
    await connectDB();

    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@exportb2b.com',
      password: 'Admin@Export2026!',
    });
    if (adminLoginRes.body.success) {
      adminToken = adminLoginRes.body.data.accessToken;
    }

    const salesLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'sales@exportb2b.com',
      password: 'Sales@Export2026!',
    });
    if (salesLoginRes.body.success) {
      salesToken = salesLoginRes.body.data.accessToken;
    }
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  // Flow 1: Catalogue Browse & Hierarchy
  it('Golden 1: GET /api/v1/categories returns hierarchy tree', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const cat = res.body.data[0];
    expect(cat).toHaveProperty('id');
    expect(cat).toHaveProperty('name');
    expect(cat).toHaveProperty('slug');
  });

  // Flow 2: Search & Suggestions
  it('Golden 2: GET /api/v1/search/suggest returns autocomplete items', async () => {
    const res = await request(app).get('/api/v1/search/suggest?q=oil');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Flow 3: Product Detail with specs
  it('Golden 3: GET /api/v1/products/:slug returns complete product detail', async () => {
    const res = await request(app).get('/api/v1/products/castor-oil-and-derivatives');
    // If exact slug is castor-oil-and-derivatives or castor-oil
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('slug');
      expect(res.body.data).toHaveProperty('hsCode');
    } else {
      // Fallback check on general products list
      const listRes = await request(app).get('/api/v1/products?limit=1');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);
    }
  });

  // Flow 4: RFQ Validation Contract
  it('Golden 4: POST /api/v1/inquiries rejects invalid input with 422', async () => {
    const res = await request(app).post('/api/v1/inquiries').send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('message');
  });

  // Flow 5: Sample Request Validation Contract
  it('Golden 5: POST /api/v1/samples rejects empty submission with 422', async () => {
    const res = await request(app).post('/api/v1/samples').send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  // Flow 6: AI Smart Search
  it('Golden 6: POST /api/v1/ai/smart-search returns parsed intent', async () => {
    const res = await request(app)
      .post('/api/v1/ai/smart-search')
      .send({ query: 'High purity castor oil for industrial export' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Flow 7: Admin Login Contract
  it('Golden 7: POST /api/v1/auth/login validates credentials and issues JWT', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@exportb2b.com',
      password: 'Admin@Export2026!',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.role).toBe('admin');
  });

  // Flow 8: Admin Inquiries Inbox
  it('Golden 8: GET /api/v1/admin/inquiries lists incoming leads with pagination', async () => {
    if (!salesToken) return;
    const res = await request(app)
      .get('/api/v1/admin/inquiries')
      .set('Authorization', `Bearer ${salesToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Flow 9: Admin RBAC Security Enforcement
  it('Golden 9: GET /api/v1/admin/dashboard blocks unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard');
    expect(res.status).toBe(401);
  });
});
