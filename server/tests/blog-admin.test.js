import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import BlogPost from '../src/modules/blog/blog.model.js';

describe('Blog & Trade Intelligence CMS Desk Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let createdPostId = null;
  const testPostSlug = `test-trade-guide-${Date.now()}`;

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
    if (createdPostId) {
      await BlogPost.destroy({ where: { id: createdPostId } }).catch(() => {});
    }
    await disconnectDB();
  });

  describe('Blog Administration Endpoints (US-BLG-001)', () => {
    it('GET /api/v1/admin/blog returns paginated articles for staff review', async () => {
      const res = await request(app)
        .get('/api/v1/admin/blog?limit=10')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const first = res.body.data[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('status');
      expect(first).toHaveProperty('category');
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
    });

    it('POST /api/v1/admin/blog allows editor to compose article with auto-read time calculation', async () => {
      const longContent = `## Commercial Specifications for Ashwagandha Withanolides\n\n` +
        `Ashwagandha (Withania somnifera) standardized extracts require minimum 2.5% to 5.0% Withanolides by HPLC analysis. `.repeat(20);

      const res = await request(app)
        .post('/api/v1/admin/blog')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Standardized Ashwagandha Extracts: USP Analytical Monographs',
          slug: testPostSlug,
          excerpt: 'Comprehensive procurement guidelines for international importers sourcing standardized Ashwagandha withanolides.',
          content: longContent,
          category: 'Nutraceutical Raw Materials',
          author: {
            name: 'Dr. R. Natarajan',
            designation: 'Head of Quality Assurance & Phytochemistry',
            avatar: '/images/placeholders/avatar-default.jpg',
          },
          tags: ['Ashwagandha', 'Withanolides', 'HPLC', 'Nutraceuticals'],
          status: 'published',
          seo: {
            title: 'Ashwagandha Withanolides Standardization Guide | JHS GLOBAL',
            description: 'HPLC specifications and quality criteria for importing bulk Ashwagandha extract.',
            keywords: ['ashwagandha extract', 'withanolides', 'nutraceutical export'],
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('Standardized Ashwagandha Extracts: USP Analytical Monographs');
      expect(res.body.data.slug).toBe(testPostSlug);
      expect(res.body.data.readMinutes).toBeGreaterThanOrEqual(1);

      createdPostId = res.body.data.id;
    });

    it('GET /api/v1/admin/blog/:id returns complete article details with author and SEO metadata', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdPostId);
      expect(res.body.data.author.name).toBe('Dr. R. Natarajan');
      expect(res.body.data.seo.keywords).toContain('ashwagandha extract');
    });

    it('PUT /api/v1/admin/blog/:id allows admin to update article content and recalculates readMinutes', async () => {
      const updatedContent = `## Updated Section 1\n\n` + `Detailed analytical monographs for global buyers. `.repeat(50);

      const res = await request(app)
        .put(`/api/v1/admin/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Standardized Ashwagandha Extracts: USP & Ph. Eur. Monographs',
          content: updatedContent,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Ph. Eur. Monographs');
      expect(res.body.data.readMinutes).toBeGreaterThanOrEqual(2);
    });

    it('PATCH /api/v1/admin/blog/:id/status updates article publication status', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/blog/${createdPostId}/status`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          status: 'draft',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('draft');

      // Restore to published
      const restoreRes = await request(app)
        .patch(`/api/v1/admin/blog/${createdPostId}/status`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          status: 'published',
        });

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.status).toBe('published');
    });

    it('DELETE /api/v1/admin/blog/:id archives article from active publication', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/blog/${createdPostId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('archived');

      const check = await BlogPost.findByPk(createdPostId);
      expect(check.status).toBe('archived');
    });
  });

  describe('RBAC Security for Blog CMS', () => {
    it('Sales role should be rejected with 403 Forbidden on blog creation', async () => {
      const res = await request(app)
        .post('/api/v1/admin/blog')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          title: 'Unauthorized Post Attempt',
          content: 'This should be blocked by RBAC.',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Unauthenticated requests should be rejected with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/blog');
      expect(res.status).toBe(401);
    });
  });
});
