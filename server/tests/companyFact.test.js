import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import CompanyFact from '../src/modules/companyFact/companyFact.model.js';

describe('Company Knowledge Base API Suite', () => {
  let adminToken = '';
  let editorToken = '';
  let createdFactId = null;
  const uniqueKey = `test_fact_${Date.now()}`;

  beforeAll(async () => {
    await connectDB();

    // Authenticate Admin
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@exportb2b.com',
      password: 'Admin@Export2026!',
    });
    if (adminRes.body?.data?.accessToken) {
      adminToken = adminRes.body.data.accessToken;
    }

    // Authenticate Editor
    const editorRes = await request(app).post('/api/v1/auth/login').send({
      email: 'editor@exportb2b.com',
      password: 'Editor@Export2026!',
    });
    if (editorRes.body?.data?.accessToken) {
      editorToken = editorRes.body.data.accessToken;
    }
  }, 35000);

  afterAll(async () => {
    if (createdFactId) {
      await CompanyFact.destroy({ where: { id: createdFactId } }).catch(() => {});
    }
    await disconnectDB();
  });

  it('GET /api/v1/company-facts should return public facts list without auth', async () => {
    const res = await request(app).get('/api/v1/company-facts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/company-facts/admin should be protected (401 without auth)', async () => {
    const res = await request(app).get('/api/v1/company-facts/admin');

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/company-facts/admin should return facts list for authenticated admin', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .get('/api/v1/company-facts/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('facts');
    expect(res.body.data).toHaveProperty('total');
  });

  it('POST /api/v1/company-facts/admin should allow admin to create a verified company fact', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .post('/api/v1/company-facts/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category: 'certifications',
        factKey: uniqueKey,
        label: 'Test Verified Certification',
        factValue: 'TEST-CERT-9999 (Verified by regulatory agency)',
        source: 'client_document',
        sourceDocument: 'Test_Cert.pdf',
        isVerified: true,
        isPublic: true,
        notes: 'Verification test',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.factKey).toBe(uniqueKey);
    expect(res.body.data.isVerified).toBe(true);
    createdFactId = res.body.data.id;
  });

  it('POST /api/v1/company-facts/admin with duplicate factKey should return 409 conflict', async () => {
    if (!adminToken) return;

    const res = await request(app)
      .post('/api/v1/company-facts/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category: 'certifications',
        factKey: uniqueKey,
        label: 'Duplicate key test',
        factValue: 'Duplicate test',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/v1/company-facts/admin/:id should update fact value and verification status', async () => {
    if (!adminToken || !createdFactId) return;

    const res = await request(app)
      .put(`/api/v1/company-facts/admin/${createdFactId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        factValue: 'Updated Fact Value — 100% Verified',
        isVerified: true,
        notes: 'Updated note',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.factValue).toBe('Updated Fact Value — 100% Verified');
  });

  it('DELETE /api/v1/company-facts/admin/:id should delete fact', async () => {
    if (!adminToken || !createdFactId) return;

    const res = await request(app)
      .delete(`/api/v1/company-facts/admin/${createdFactId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    createdFactId = null;
  });
});
