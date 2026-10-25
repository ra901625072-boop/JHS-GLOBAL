import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import User from '../src/modules/user/user.model.js';
import AuditLog from '../src/modules/audit/auditLog.model.js';

describe('Company Profile, Founders & System Settings Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let testUserId = null;
  const testUserEmail = `officer.test.${Date.now()}@exportb2b.com`;

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
    if (testUserId) {
      await User.destroy({ where: { id: testUserId } }).catch(() => {});
    }
    await disconnectDB();
  });

  describe('Team Users Management (US-SET-001)', () => {
    it('GET /api/v1/admin/users should return paginated staff users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const firstUser = res.body.data[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('name');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('role');
      expect(firstUser).toHaveProperty('isActive');
      // Passwords must never be leaked
      expect(firstUser).not.toHaveProperty('password');
    });

    it('POST /api/v1/admin/users should allow admin to provision a new staff user', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Compliance Test Officer',
          email: testUserEmail,
          password: 'TestPassword2026!',
          role: 'editor',
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Compliance Test Officer');
      expect(res.body.data.email).toBe(testUserEmail.toLowerCase());
      expect(res.body.data.role).toBe('editor');
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data).not.toHaveProperty('password');

      testUserId = res.body.data.id;
    });

    it('POST /api/v1/admin/users should reject duplicate email address with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Officer',
          email: testUserEmail,
          password: 'TestPassword2026!',
          role: 'sales',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('PUT /api/v1/admin/users/:id should allow admin to update user details', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Compliance Senior Officer',
          role: 'sales',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Compliance Senior Officer');
      expect(res.body.data.role).toBe('sales');
    });

    it('PATCH /api/v1/admin/users/:id/toggle-active should toggle user active status', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);

      // Re-enable
      const resEnable = await request(app)
        .patch(`/api/v1/admin/users/${testUserId}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(resEnable.status).toBe(200);
      expect(resEnable.body.data.isActive).toBe(true);
    });

    it('POST /api/v1/admin/users/:id/reset-password should reset user password', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${testUserId}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPassword: 'BrandNewSecretPass2026!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Authenticate with the new password
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: testUserEmail,
        password: 'BrandNewSecretPass2026!',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data).toHaveProperty('accessToken');
    });

    it('RBAC Enforcement: Sales and Editor roles cannot manage users (403 Forbidden)', async () => {
      const salesRes = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${salesToken}`);
      expect(salesRes.status).toBe(403);

      const editorRes = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          name: 'Unauthorized User',
          email: 'unauthorized@exportb2b.com',
          password: 'Password2026!',
        });
      expect(editorRes.status).toBe(403);
    });
  });

  describe('Compliance & Security Audit Trail (US-SET-002)', () => {
    it('GET /api/v1/audit-logs should return chronological administrative mutations', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const log = res.body.data[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('userName');
      expect(log).toHaveProperty('action');
      expect(log).toHaveProperty('entityType');
    });

    it('GET /api/v1/audit-logs should filter by entityType and action', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?entityType=user&action=user.create')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('Audit snapshots redact sensitive keys like password and token', async () => {
      const userCreateLog = await AuditLog.findOne({
        where: { action: 'user.create', entityId: String(testUserId) },
      });

      if (userCreateLog && userCreateLog.afterSnapshot) {
        expect(userCreateLog.afterSnapshot).not.toHaveProperty('password');
        expect(userCreateLog.afterSnapshot.password).toBeUndefined();
      }
    });

    it('RBAC Enforcement: Non-admin roles cannot access audit trail (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${salesToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Company Profile, Founders & System Settings (US-SET-003)', () => {
    it('GET /api/v1/admin/settings/company-profile should return canonical corporate identity', async () => {
      const res = await request(app)
        .get('/api/v1/admin/settings/company-profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const profile = res.body.data;
      expect(profile.identity.tradeName).toBe('JHS GLOBAL');
      expect(profile.identity.city).toBe('Surat');
      expect(profile.identity.state).toBe('Gujarat');

      // Verify three approved founders
      expect(profile.founders).toHaveLength(3);
      expect(profile.founders[0].name).toBe('Jay Prajapati');
      expect(profile.founders[1].name).toBe('Suraj Prajapati');
      expect(profile.founders[2].name).toBe('Henil Prajapati');

      // Verify designated ports
      expect(profile.logistics.primaryDeparturePorts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Indian Gateway Ports (Agreed per order)' }),
        ])
      );

      // Verify statutory licenses
      expect(profile.statutoryLicenses).toHaveProperty('gstin');
      expect(profile.statutoryLicenses).toHaveProperty('dgftIec');
      expect(profile.statutoryLicenses).toHaveProperty('fssaiCentralLicense');
      expect(profile.statutoryLicenses).toHaveProperty('apedaRcmc');
      expect(profile.statutoryLicenses).toHaveProperty('spicesBoardCres');
    });

    it('PUT /api/v1/admin/settings/company-profile updates settings and records audit log', async () => {
      const res = await request(app)
        .put('/api/v1/admin/settings/company-profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          registeredAddress:
            'Flat No. 401, Shyam-A, Build-H, Vatsalya Villa Residency, Chhaprabhatha Road, Amroli, Surat, Gujarat 394107, India',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/admin/settings/system-health returns PostgreSQL pool and vector diagnostics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/settings/system-health')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const health = res.body.data;
      expect(health.database).toHaveProperty('status');
      expect(health.database.status).toBe('connected');
      expect(health.database).toHaveProperty('vectorExtension');
      expect(health.tables).toHaveProperty('products');
      expect(health.tables).toHaveProperty('categories');
      expect(health.tables).toHaveProperty('users');
      expect(health.server).toHaveProperty('nodeVersion');
      expect(health.server).toHaveProperty('uptimeSeconds');
    });

    it('POST /api/v1/admin/settings/cache-flush flushes server memory cache', async () => {
      const res = await request(app)
        .post('/api/v1/admin/settings/cache-flush')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('flushed');
    });

    it('RBAC Enforcement: Non-admin cannot modify company profile or flush cache (403 Forbidden)', async () => {
      const putRes = await request(app)
        .put('/api/v1/admin/settings/company-profile')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ test: true });
      expect(putRes.status).toBe(403);

      const flushRes = await request(app)
        .post('/api/v1/admin/settings/cache-flush')
        .set('Authorization', `Bearer ${salesToken}`);
      expect(flushRes.status).toBe(403);
    });
  });
});
