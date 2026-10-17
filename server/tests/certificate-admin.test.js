import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Certificate from '../src/modules/certificate/certificate.model.js';

describe('Certificates & Statutory Compliance Desk Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let createdCertId = null;
  let expiringCertId = null;
  let permanentCertId = null;

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
    // Clean up created entities
    if (createdCertId) {
      await Certificate.destroy({ where: { id: createdCertId } }).catch(() => {});
    }
    if (expiringCertId) {
      await Certificate.destroy({ where: { id: expiringCertId } }).catch(() => {});
    }
    if (permanentCertId) {
      await Certificate.destroy({ where: { id: permanentCertId } }).catch(() => {});
    }
    await disconnectDB();
  });

  describe('Certificate Administration Endpoints (US-CRT-001)', () => {
    it('GET /api/v1/admin/certificates returns all statutory certificates with computed validity status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const first = res.body.data[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('validityStatus');
      expect(['valid', 'expiring_soon', 'expired', 'permanent']).toContain(first.validityStatus);
    });

    it('POST /api/v1/admin/certificates allows editor to register a statutory export certificate', async () => {
      const res = await request(app)
        .post('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: 'Halal Export Accreditation',
          fullName: 'Jamiat Ulama-i-Hind Halal Trust Export Certification',
          issuedBy: 'Halal Trust Authority, New Delhi',
          number: 'JUH-HALAL-2026-9874',
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
          scope: 'Halal slaughter, storage, packaging, and export of plant-based proteins, botanicals, and ingredients.',
          file: { url: '/documents/halal-certificate.pdf', type: 'pdf' },
          logo: { url: '/images/certifications/halal.png' },
          isPublic: true,
          order: 7,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Halal Export Accreditation');
      expect(res.body.data.validityStatus).toBe('valid');
      expect(res.body.data.daysRemaining).toBeGreaterThan(300);

      createdCertId = res.body.data.id;
    });

    it('GET /api/v1/admin/certificates/:id returns complete certificate details with document URLs', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/certificates/${createdCertId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdCertId);
      expect(res.body.data.number).toBe('JUH-HALAL-2026-9874');
      expect(res.body.data.file.url).toBe('/documents/halal-certificate.pdf');
    });

    it('PUT /api/v1/admin/certificates/:id allows admin to update certificate attributes', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/certificates/${createdCertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          scope: 'Updated scope: Halal certified plant extracts, seed proteins, and carrier oils.',
          order: 8,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scope).toContain('Updated scope');
      expect(res.body.data.order).toBe(8);
    });

    it('PATCH /api/v1/admin/certificates/:id/toggle-public toggles public trust grid visibility', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/certificates/${createdCertId}/toggle-public`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPublic).toBe(false);

      // Restore to public
      const restoreRes = await request(app)
        .patch(`/api/v1/admin/certificates/${createdCertId}/toggle-public`)
        .set('Authorization', `Bearer ${editorToken}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.isPublic).toBe(true);
    });

    it('PATCH /api/v1/admin/certificates/reorder updates display sequence across certificates', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/certificates/reorder')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ id: createdCertId, order: 12 }],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(1);

      const check = await Certificate.findByPk(createdCertId);
      expect(check.order).toBe(12);
    });

    it('DELETE /api/v1/admin/certificates/:id soft-deletes certificate from active records', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/certificates/${createdCertId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      const check = await Certificate.findByPk(createdCertId);
      expect(check.isActive).toBe(false);
    });
  });

  describe('Validity Schedule & 60-Day Renewal Monitoring', () => {
    it('Identifies perpetual/permanent licenses when expiryDate is null', async () => {
      const permRes = await request(app)
        .post('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Perpetual Test License',
          number: 'PERM-TEST-1001',
          expiryDate: null,
          issueDate: new Date().toISOString(),
        });

      expect(permRes.status).toBe(201);
      expect(permRes.body.data.validityStatus).toBe('permanent');
      expect(permRes.body.data.daysRemaining).toBeNull();
      expect(permRes.body.data.isExpiringSoon).toBe(false);
      expect(permRes.body.data.isExpired).toBe(false);

      permanentCertId = permRes.body.data.id;
    });

    it('Flags expiring_soon status and alert when expiryDate is within 60 days', async () => {
      // Create a cert expiring in 25 days
      const expDate = new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString();
      const alertRes = await request(app)
        .post('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Expiring Test Certificate',
          number: 'EXP-SOON-2026',
          issueDate: new Date().toISOString(),
          expiryDate: expDate,
        });

      expect(alertRes.status).toBe(201);
      expect(alertRes.body.data.validityStatus).toBe('expiring_soon');
      expect(alertRes.body.data.isExpiringSoon).toBe(true);
      expect(alertRes.body.data.daysRemaining).toBeLessThanOrEqual(26);
      expect(alertRes.body.data.daysRemaining).toBeGreaterThanOrEqual(24);

      expiringCertId = alertRes.body.data.id;
    });
  });

  describe('RBAC Security for Certificates', () => {
    it('Sales role should be rejected with 403 Forbidden on certificate creation', async () => {
      const res = await request(app)
        .post('/api/v1/admin/certificates')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'Unauthorized Cert',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Unauthenticated requests should be rejected with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/certificates');
      expect(res.status).toBe(401);
    });
  });
});
