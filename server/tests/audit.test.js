import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import AuditLog from '../src/modules/audit/auditLog.model.js';
import auditService from '../src/modules/audit/audit.service.js';

describe('Admin Governance: AuditLog & RBAC Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';

  beforeAll(async () => {
    await connectDB();
    await AuditLog.sync();

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
  });

  afterAll(async () => {
    await AuditLog.destroy({ where: { entityType: 'test_audit_entity' } });
    await disconnectDB();
  });

  it('sanitizeSnapshot should strip passwords and sensitive tokens', () => {
    const raw = {
      name: 'John Doe',
      password: 'superSecretPassword',
      token: 'jwt-bearer-token',
      nested: {
        apiKey: 'secret-key-123',
        normalField: 'safeValue',
      },
    };

    const sanitized = auditService.sanitizeSnapshot(raw);
    expect(sanitized.name).toBe('John Doe');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.nested.apiKey).toBe('[REDACTED]');
    expect(sanitized.nested.normalField).toBe('safeValue');
  });

  it('recordAuditLog should insert a new audit entry into PostgreSQL', async () => {
    const log = await auditService.recordAuditLog({
      action: 'update',
      entityType: 'test_audit_entity',
      entityId: '99999',
      beforeSnapshot: { status: 'new' },
      afterSnapshot: { status: 'quoted' },
      metadata: { reason: 'Test execution' },
    });

    expect(log).toBeDefined();
    expect(log.action).toBe('update');
    expect(log.entityType).toBe('test_audit_entity');
    expect(log.entityId).toBe('99999');
    expect(log.beforeSnapshot).toEqual({ status: 'new' });
    expect(log.afterSnapshot).toEqual({ status: 'quoted' });
  });

  it('GET /api/v1/audit-logs should return 401 when called without authorization', async () => {
    const res = await request(app).get('/api/v1/audit-logs');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/audit-logs should return 403 when called by non-admin roles', async () => {
    const salesRes = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${salesToken}`);
    expect(salesRes.status).toBe(403);

    const editorRes = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${editorToken}`);
    expect(editorRes.status).toBe(403);
  });

  it('GET /api/v1/audit-logs should return 200 with paginated logs when called by admin', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs?limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total');
  });
});
