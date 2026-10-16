import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Category from '../src/modules/category/category.model.js';
import Inquiry from '../src/modules/inquiry/inquiry.model.js';
import Product from '../src/modules/product/product.model.js';
import { Op } from 'sequelize';

describe('Admin Lead Management & RBAC Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let categoryId = '';
  let testInquiryId = '';
  let createdProductId = '';
  const testProductSlug = `test-cardamom-${Date.now()}`;

  beforeAll(async () => {
    await connectDB();

    // Authenticate Admin
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@exportb2b.com',
      password: 'Admin@Export2026!',
    });
    adminToken = adminRes.body.data.accessToken;

    // Authenticate Sales
    const salesRes = await request(app).post('/api/v1/auth/login').send({
      email: 'sales@exportb2b.com',
      password: 'Sales@Export2026!',
    });
    salesToken = salesRes.body.data.accessToken;

    // Authenticate Editor
    const editorRes = await request(app).post('/api/v1/auth/login').send({
      email: 'editor@exportb2b.com',
      password: 'Editor@Export2026!',
    });
    editorToken = editorRes.body.data.accessToken;

    // Fetch existing category
    const cat = await Category.findOne({ where: { parentId: null } });
    if (cat) categoryId = (cat.id || cat._id).toString();

    // Fetch an existing inquiry or create one for tests
    let inq = await Inquiry.findOne();
    if (!inq) {
      inq = await Inquiry.create({
        referenceNo: 'RFQ-TEST-999999',
        buyer: {
          name: 'Test Buyer',
          email: 'buyer@test.de',
          company: 'Test Company GmbH',
          country: 'Germany',
        },
        items: [{ productName: 'Salem Turmeric', quantity: 20, unit: 'MT' }],
      });
    }
    testInquiryId = inq._id.toString();
  }, 35000);

  afterAll(async () => {
    if (createdProductId) {
      await Product.destroy({ where: { id: createdProductId } });
    }
    await Product.destroy({ where: { slug: { [Op.like]: 'test-cardamom%' } } });
    await disconnectDB();
  });

  it('GET /api/v1/admin/dashboard should return lead & catalogue metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('inquiries');
    expect(res.body.data).toHaveProperty('products');
    expect(res.body.data).toHaveProperty('samples');
    expect(res.body.data.inquiries).toHaveProperty('byStatus');
  });

  it('GET /api/v1/admin/inquiries should return paginated inquiries list for sales desk', async () => {
    const res = await request(app)
      .get('/api/v1/admin/inquiries?limit=10')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total');
  });

  it('PATCH /api/v1/admin/inquiries/:id/status should update pipeline status and log note', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/inquiries/${testInquiryId}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        status: 'quoted',
        priority: 'hot',
        note: 'Proforma quote EUR 2,450/MT CIF Hamburg sent via email.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('quoted');
    expect(res.body.data.priority).toBe('hot');
    expect(res.body.data.notes.length).toBeGreaterThan(0);
    const lastNote = res.body.data.notes[res.body.data.notes.length - 1];
    expect(lastNote.text).toContain('CIF Hamburg');
  });

  it('GET /api/v1/admin/inquiries should compute SLA deadline and status for each lead', async () => {
    const res = await request(app)
      .get('/api/v1/admin/inquiries?limit=5')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const first = res.body.data[0];
    expect(first).toHaveProperty('slaDeadline');
    expect(first).toHaveProperty('slaRemainingHours');
    expect(first).toHaveProperty('slaStatus');
    expect(['ok', 'warning', 'critical', 'breached', 'resolved']).toContain(first.slaStatus);
  });

  it('POST /api/v1/admin/inquiries/:id/spam should mark inquiry as spam and exclude from default list', async () => {
    const spamRes = await request(app)
      .post(`/api/v1/admin/inquiries/${testInquiryId}/spam`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ reason: 'Unsolicited promotional outreach' });

    expect(spamRes.status).toBe(200);
    expect(spamRes.body.success).toBe(true);
    expect(spamRes.body.data.status).toBe('spam');
    expect(spamRes.body.data.isSpam).toBe(true);

    const refNo = spamRes.body.data.referenceNo;

    // Default list should exclude spam
    const listRes = await request(app)
      .get(`/api/v1/admin/inquiries?q=${refNo}`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(listRes.body.data.some((inq) => (inq.id || inq._id).toString() === testInquiryId)).toBe(false);

    // List with status=spam should include it
    const spamListRes = await request(app)
      .get(`/api/v1/admin/inquiries?status=spam&q=${refNo}`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(spamListRes.body.data.some((inq) => (inq.id || inq._id).toString() === testInquiryId)).toBe(true);
  });

  it('POST /api/v1/admin/inquiries/:id/unspam should allow admin to restore inquiry to new', async () => {
    const unspamRes = await request(app)
      .post(`/api/v1/admin/inquiries/${testInquiryId}/unspam`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(unspamRes.status).toBe(200);
    expect(unspamRes.body.success).toBe(true);
    expect(unspamRes.body.data.status).toBe('new');
    expect(unspamRes.body.data.isSpam).toBe(false);
  });

  it('Role Check: Editor should be forbidden (403) from accessing Inquiries', async () => {
    const res = await request(app)
      .get('/api/v1/admin/inquiries')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Role Check: Sales should be forbidden (403) from creating products', async () => {
    const res = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        name: 'Unauthorized Product Test',
        categoryId,
        hsCode: '0904.11',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/admin/products should allow editor to create a new product', async () => {
    const res = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        name: 'Organic Green Cardamom Extra Bold',
        slug: testProductSlug,
        categoryId,
        hsCode: '0908.31',
        origin: 'India',
        moq: { value: 1, unit: 'MT' },
        packing: [{ type: 'Carton with Poly Liner', size: '10 kg' }],
        specs: [{ key: 'Size', value: '8mm+', standard: 'Grade 1' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Organic Green Cardamom Extra Bold');
    createdProductId = res.body.data._id;
  });

  it('DELETE /api/v1/admin/products/:id should soft-delete product (isActive: false)', async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });
});
