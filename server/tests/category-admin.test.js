import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Category from '../src/modules/category/category.model.js';
import Product from '../src/modules/product/product.model.js';

describe('Categories & Divisions Desk Administration Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let rootDivisionId = null;
  let createdCategoryId = null;
  let testChildCatId = null;
  let testProductId = null;
  const testCatSlug = `test-cat-${Date.now()}`;

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

    // Fetch existing root division (Level 1)
    const rootCat = await Category.findOne({ where: { level: 1, isActive: true } });
    if (rootCat) {
      rootDivisionId = rootCat.id;
    }
  }, 35000);

  afterAll(async () => {
    // Clean up created entities
    if (testProductId) {
      await Product.destroy({ where: { id: testProductId } }).catch(() => {});
    }
    if (testChildCatId) {
      await Category.destroy({ where: { id: testChildCatId } }).catch(() => {});
    }
    if (createdCategoryId) {
      await Category.destroy({ where: { id: createdCategoryId } }).catch(() => {});
    }
    await disconnectDB();
  });

  describe('Administrative Category Endpoints (US-CAT-001)', () => {
    it('GET /api/v1/admin/categories returns all divisions with product count calculation', async () => {
      const res = await request(app)
        .get('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const first = res.body.data[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('slug');
      expect(first).toHaveProperty('level');
      expect(first).toHaveProperty('productCount');
      expect(typeof first.productCount).toBe('number');
    });

    it('POST /api/v1/admin/categories allows editor to create a nested subcategory with automatic level computation', async () => {
      const res = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: 'Specialty Functional Botanicals',
          slug: testCatSlug,
          parentId: rootDivisionId,
          hsChapter: '13',
          description: 'High-purity botanical raw materials for functional export.',
          order: 10,
          isActive: true,
          seo: {
            title: 'Specialty Functional Botanicals Exporter | JHS GLOBAL',
            description: 'Export of verified functional botanical isolates and extracts.',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.slug).toBe(testCatSlug);
      expect(res.body.data.level).toBe(2); // Level 2 computed from root division parent
      expect(res.body.data.hsChapter).toBe('13');

      createdCategoryId = res.body.data.id;
    });

    it('GET /api/v1/admin/categories/:id returns category details with associated hierarchy', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdCategoryId);
      expect(res.body.data.name).toBe('Specialty Functional Botanicals');
      expect(res.body.data).toHaveProperty('productCount');
      expect(res.body.data).toHaveProperty('parent');
      expect(res.body.data.parent.id).toBe(rootDivisionId);
    });

    it('PUT /api/v1/admin/categories/:id allows admin to update category attributes', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Specialty Functional Botanicals & Phyto-Actives',
          order: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Specialty Functional Botanicals & Phyto-Actives');
      expect(res.body.data.order).toBe(15);
    });

    it('PATCH /api/v1/admin/categories/:id/toggle-active toggles category public visibility', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/categories/${createdCategoryId}/toggle-active`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      // Toggle back to active
      const restoreRes = await request(app)
        .patch(`/api/v1/admin/categories/${createdCategoryId}/toggle-active`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.isActive).toBe(true);
    });

    it('PATCH /api/v1/admin/categories/reorder updates order sequence across siblings', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/categories/reorder')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ id: createdCategoryId, order: 25 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);

      const verify = await Category.findByPk(createdCategoryId);
      expect(verify.order).toBe(25);
    });
  });

  describe('Deletion Safeguard Guard & Integrity Invariant', () => {
    it('DELETE /api/v1/admin/categories/:id safely prevents deletion if active products exist in category', async () => {
      // Create a temporary product mapped to this category
      const testProduct = await Product.create({
        name: `Test Active Item ${Date.now()}`,
        slug: `test-item-${Date.now()}`,
        sku: `SKU-TST-${Date.now()}`,
        categoryId: createdCategoryId,
        hsCode: '1302.19',
        origin: 'India',
        isActive: true,
      });
      testProductId = testProduct.id;

      // Attempt to delete category
      const res = await request(app)
        .delete(`/api/v1/admin/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const errorMsg = res.body.error?.message || res.body.message || '';
      expect(errorMsg).toContain('active product(s) are assigned to this category');

      // Now deactivate product to unblock deletion
      await Product.update({ isActive: false }, { where: { id: testProduct.id } });
    });

    it('DELETE /api/v1/admin/categories/:id successfully soft-deletes category when no active products remain', async () => {
      // Ensure no active products mapped before deletion attempt
      await Product.update({ isActive: false }, { where: { categoryId: createdCategoryId } });

      const res = await request(app)
        .delete(`/api/v1/admin/categories/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      const check = await Category.findByPk(createdCategoryId);
      expect(check.isActive).toBe(false);
    });
  });

  describe('RBAC Role Security for Categories', () => {
    it('Sales role should be rejected with 403 Forbidden on category mutation', async () => {
      const res = await request(app)
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'Unauthorized Category',
          slug: 'unauthorized-cat',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Unauthenticated request should be rejected with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/categories');
      expect(res.status).toBe(401);
    });
  });
});
