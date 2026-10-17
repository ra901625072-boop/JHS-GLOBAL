import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Product from '../src/modules/product/product.model.js';
import Category from '../src/modules/category/category.model.js';

describe('Products & Technical Specs Desk Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let testCategoryId = 1;
  let createdProductId = null;
  const testProductSlug = `test-curcumin-${Date.now()}`;

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

    // Fetch an active category
    const cat = await Category.findOne({ where: { isActive: true } });
    if (cat) {
      testCategoryId = cat.id;
    }
  }, 35000);

  afterAll(async () => {
    if (createdProductId) {
      await Product.destroy({ where: { id: createdProductId } }).catch(() => {});
    }
    await disconnectDB();
  });

  describe('Product Catalogue Admin Endpoints', () => {
    it('GET /api/v1/admin/products should return paginated list of products for staff', async () => {
      const res = await request(app)
        .get('/api/v1/admin/products?limit=10')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
    });

    it('POST /api/v1/admin/products should allow editor to create a commodity with specs and trade parameters', async () => {
      const res = await request(app)
        .post('/api/v1/admin/products')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: 'Certified Organic Curcumin 95%',
          slug: testProductSlug,
          categoryId: testCategoryId,
          hsCode: '2918.29',
          botanicalName: 'Curcuma longa',
          origin: 'India',
          moq: { value: 250, unit: 'kg' },
          packing: [{ type: 'Fiber Drum with Poly Liner', size: '25 kg', notes: 'Food grade tamper evident' }],
          leadTime: '7–10 business days',
          shelfLife: '36 months',
          ports: ['Mundra', 'Nhava Sheva (JNPT)'],
          incoterms: ['FOB', 'CIF', 'CFR'],
          containerLoad: { fcl20: '12 MT', fcl40: '24 MT', lcl: '500 kg min' },
          specs: [
            { parameter: 'Curcuminoids Content', specification: 'Min 95.0%', typicalValue: '95.8%', testMethod: 'HPLC', verified: true },
            { parameter: 'Moisture', specification: 'Max 1.0%', typicalValue: '0.45%', testMethod: 'Karl Fischer', verified: true },
            { parameter: 'Heavy Metals (Pb, As, Cd)', specification: 'Max 10 ppm', typicalValue: '2.1 ppm', testMethod: 'ICP-MS', verified: false },
          ],
          documents: [
            { title: 'TDS-Curcumin-95-JHS.pdf', type: 'tds', url: '/documents/tds/curcumin-95.pdf' },
          ],
          isFeatured: false,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Certified Organic Curcumin 95%');
      expect(res.body.data.hsCode).toBe('2918.29');
      expect(res.body.data.specs.length).toBe(3);
      expect(res.body.data).toHaveProperty('containerLoad');

      createdProductId = res.body.data.id || res.body.data._id;
    });

    it('GET /api/v1/admin/products/:id should return complete commodity dossier', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/products/${createdProductId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Certified Organic Curcumin 95%');
      expect(res.body.data.slug).toBe(testProductSlug);
      expect(res.body.data.specs.length).toBe(3);
    });

    it('PUT /api/v1/admin/products/:id should allow updating specifications and descriptions', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/products/${createdProductId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          shortDescription: 'High-potency standardized Curcumin extract manufactured under ISO 22000 and GMP standards.',
          shelfLife: '36 months from manufacture',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.shortDescription).toContain('ISO 22000');
    });

    it('PATCH /api/v1/admin/products/:id/toggle-active should toggle between draft and active state', async () => {
      const toggleRes = await request(app)
        .patch(`/api/v1/admin/products/${createdProductId}/toggle-active`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.success).toBe(true);
      expect(toggleRes.body.data.isActive).toBe(false);

      // Toggle back to active
      const restoreRes = await request(app)
        .patch(`/api/v1/admin/products/${createdProductId}/toggle-active`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.isActive).toBe(true);
    });

    it('PATCH /api/v1/admin/products/:id/toggle-featured should toggle showcase flag', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/products/${createdProductId}/toggle-featured`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFeatured).toBe(true);
    });

    it('PATCH /api/v1/admin/products/:id/verify-spec should update per-spec verification flag', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/products/${createdProductId}/verify-spec`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          specIndex: 2,
          verified: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specs[2].verified).toBe(true);
      // Since all 3 specs are now verified, isVerified should be true
      expect(res.body.data.isVerified).toBe(true);
    });

    it('POST /api/v1/admin/products/:id/documents should attach a technical document (SDS)', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/products/${createdProductId}/documents`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Safety-Data-Sheet-Curcumin-Extract-2026.pdf',
          type: 'sds',
          url: '/documents/sds/sds-curcumin-extract.pdf',
          fileSize: '1.2 MB',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documents.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.documents.some((d) => d.type === 'sds')).toBe(true);
    });

    it('DELETE /api/v1/admin/products/:id/documents/:docId should remove an attached document', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/products/${createdProductId}/documents/0`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Role Check: Sales role should be forbidden (403) from modifying products', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/products/${createdProductId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({ name: 'Unauthorized Change Attempt' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
