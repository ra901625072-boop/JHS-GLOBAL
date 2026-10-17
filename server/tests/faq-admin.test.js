import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Faq from '../src/modules/faq/faq.model.js';

describe('Export FAQ Manager Desk Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let createdFaqId = null;
  const testQuestionText = `Can JHS GLOBAL provide customized private labeling on 20ft container loads? - ${Date.now()}`;

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
  }, 35000);

  afterAll(async () => {
    if (createdFaqId) {
      await Faq.destroy({ where: { id: createdFaqId } }).catch(() => {});
    }
    await disconnectDB();
  });

  describe('FAQ Administration Endpoints (US-FAQ-001)', () => {
    it('GET /api/v1/admin/faqs returns paginated list of FAQs with groups and metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/faqs?limit=10')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('faqs');
      expect(res.body.data).toHaveProperty('groups');
      expect(res.body.data).toHaveProperty('metrics');
      expect(Array.isArray(res.body.data.faqs)).toBe(true);
      expect(res.body.data.faqs.length).toBeGreaterThan(0);

      const first = res.body.data.faqs[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('question');
      expect(first).toHaveProperty('answer');
      expect(first).toHaveProperty('group');
      expect(first).toHaveProperty('slug');
      expect(first).toHaveProperty('showOnHome');
      expect(first).toHaveProperty('isActive');

      expect(res.body.data.metrics).toHaveProperty('total');
      expect(res.body.data.metrics).toHaveProperty('homepageFeatured');
    });

    it('POST /api/v1/admin/faqs allows editor to create a new FAQ item', async () => {
      const payload = {
        question: testQuestionText,
        answer: 'Yes, JHS GLOBAL provides customized OEM packaging and buyer-specific private labelling for minimum container consignments. We apply barcoding, multilingual regulatory statements, and tamper-evident shrink sealing.',
        group: 'Packaging, Labelling & Private Label',
        order: 10,
        showOnHome: false,
        isActive: true,
      };

      const res = await request(app)
        .post('/api/v1/admin/faqs')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.question).toBe(payload.question);
      expect(res.body.data.group).toBe(payload.group);
      expect(res.body.data).toHaveProperty('slug');
      expect(res.body.data.slug.length).toBeGreaterThan(0);

      createdFaqId = res.body.data.id;
    });

    it('GET /api/v1/admin/faqs/:id returns single FAQ dossier', async () => {
      expect(createdFaqId).not.toBeNull();

      const res = await request(app)
        .get(`/api/v1/admin/faqs/${createdFaqId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdFaqId);
      expect(res.body.data.question).toBe(testQuestionText);
    });

    it('PUT /api/v1/admin/faqs/:id allows editor to update question and answer content', async () => {
      expect(createdFaqId).not.toBeNull();

      const updatedAnswer = 'Updated commercial answer: Private labelling is supported on palletized 200L drums and 25kg multi-wall bags with customs-approved GHS compliance.';
      const res = await request(app)
        .put(`/api/v1/admin/faqs/${createdFaqId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          answer: updatedAnswer,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer).toBe(updatedAnswer);
    });

    it('PATCH /api/v1/admin/faqs/:id/toggle-home toggles homepage featured accordion display', async () => {
      expect(createdFaqId).not.toBeNull();

      const res = await request(app)
        .patch(`/api/v1/admin/faqs/${createdFaqId}/toggle-home`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.showOnHome).toBe(true);
      expect(res.body.data.homeOrder).toBeGreaterThan(0);

      // Toggle back off
      const res2 = await request(app)
        .patch(`/api/v1/admin/faqs/${createdFaqId}/toggle-home`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.data.showOnHome).toBe(false);
    });

    it('PATCH /api/v1/admin/faqs/:id/toggle-active toggles public availability', async () => {
      expect(createdFaqId).not.toBeNull();

      const res = await request(app)
        .patch(`/api/v1/admin/faqs/${createdFaqId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      // Restore active status
      const res2 = await request(app)
        .patch(`/api/v1/admin/faqs/${createdFaqId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.data.isActive).toBe(true);
    });

    it('PATCH /api/v1/admin/faqs/reorder reorders sequence across multiple items', async () => {
      expect(createdFaqId).not.toBeNull();

      const res = await request(app)
        .patch('/api/v1/admin/faqs/reorder')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          items: [{ id: createdFaqId, order: 99 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);

      const checkRes = await request(app)
        .get(`/api/v1/admin/faqs/${createdFaqId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(checkRes.body.data.order).toBe(99);
    });

    it('DELETE /api/v1/admin/faqs/:id soft-deletes FAQ from active queries', async () => {
      expect(createdFaqId).not.toBeNull();

      const res = await request(app)
        .delete(`/api/v1/admin/faqs/${createdFaqId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      const checkRes = await request(app)
        .get(`/api/v1/admin/faqs/${createdFaqId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(checkRes.body.data.isActive).toBe(false);
    });

    it('RBAC Enforcement: Sales role cannot create or delete FAQs', async () => {
      const createRes = await request(app)
        .post('/api/v1/admin/faqs')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          question: 'Unauthorized question attempt?',
          answer: 'Unauthorized answer attempt.',
        });

      expect(createRes.status).toBe(403);

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/faqs/${createdFaqId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(deleteRes.status).toBe(403);
    });

    it('Unauthenticated requests to /api/v1/admin/faqs return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/faqs');
      expect(res.status).toBe(401);
    });
  });
});
