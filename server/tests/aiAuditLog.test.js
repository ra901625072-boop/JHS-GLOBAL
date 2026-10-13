import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import AiChatAuditLog from '../src/modules/ai/aiChatAuditLog.model.js';

describe('AI Chat Audit Log & Knowledge Feedback Loop API Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let createdLogId = null;

  beforeAll(async () => {
    await connectDB();

    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@exportb2b.com',
      password: 'Admin@Export2026!',
    });
    if (adminRes.body?.data?.accessToken) {
      adminToken = adminRes.body.data.accessToken;
    }

    const salesRes = await request(app).post('/api/v1/auth/login').send({
      email: 'sales@exportb2b.com',
      password: 'Sales@Export2026!',
    });
    if (salesRes.body?.data?.accessToken) {
      salesToken = salesRes.body.data.accessToken;
    }
  }, 45000);

  afterAll(async () => {
    if (createdLogId) {
      await AiChatAuditLog.destroy({ where: { id: createdLogId } }).catch(() => {});
    }
    await disconnectDB();
  });

  it('POST /api/v1/ai/chat should log the interaction and return auditLogId', async () => {
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        message: 'Where is your manufacturing facility located in Surat?',
        pageContext: {
          pathname: '/about',
          type: 'about',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('auditLogId');
    expect(res.body.data.auditLogId).toBeTruthy();

    createdLogId = res.body.data.auditLogId;

    // Verify row exists in PostgreSQL
    const logRow = await AiChatAuditLog.findByPk(createdLogId);
    expect(logRow).toBeTruthy();
    expect(logRow.message).toContain('Where is your manufacturing facility located');
    expect(logRow.intent).toBe('company_about');
    expect(logRow.isResolved).toBe(false);
  });

  it('POST /api/v1/ai/chat should scrub visitor PII (emails and phone numbers) from logged message', async () => {
    const res = await request(app)
      .post('/api/v1/ai/chat')
      .send({
        message: 'Please send quote to purchasing@globaltrader.de or call +49 151 23456789 regarding psyllium husk.',
        pageContext: { pathname: '/contact', type: 'contact' },
      });

    expect(res.status).toBe(200);
    expect(res.body.data?.auditLogId).toBeTruthy();

    const piiLogId = res.body.data.auditLogId;
    const logRow = await AiChatAuditLog.findByPk(piiLogId);
    expect(logRow).toBeTruthy();
    expect(logRow.message).toContain('[EMAIL_REDACTED]');
    expect(logRow.message).toContain('[PHONE_REDACTED]');

    // Clean up
    await AiChatAuditLog.destroy({ where: { id: piiLogId } }).catch(() => {});
  });

  it('POST /api/v1/ai/chat/feedback should record visitor thumbs-up rating', async () => {
    expect(createdLogId).toBeTruthy();

    const res = await request(app)
      .post('/api/v1/ai/chat/feedback')
      .send({
        logId: createdLogId,
        rating: 'helpful',
        comment: 'Very clear verified answer about Surat office',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.feedbackRating).toBe('helpful');
    expect(res.body.data.feedbackComment).toContain('Surat office');

    const updated = await AiChatAuditLog.findByPk(createdLogId);
    expect(updated.feedbackRating).toBe('helpful');
  });

  it('POST /api/v1/ai/chat/feedback should reject invalid rating', async () => {
    const res = await request(app)
      .post('/api/v1/ai/chat/feedback')
      .send({
        logId: createdLogId,
        rating: 'invalid_rating',
      });

    expect(res.status).toBe(400);
  });

  it('GET /api/v1/ai/admin/audit-logs requires staff authentication', async () => {
    const unauthRes = await request(app).get('/api/v1/ai/admin/audit-logs');
    expect(unauthRes.status).toBe(401);

    const authRes = await request(app)
      .get('/api/v1/ai/admin/audit-logs?limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(Array.isArray(authRes.body.data.logs)).toBe(true);
    expect(authRes.body.data.total).toBeGreaterThanOrEqual(1);
    expect(authRes.body.data).toHaveProperty('stats');
    expect(authRes.body.data.stats).toHaveProperty('total');
    expect(authRes.body.data.stats).toHaveProperty('needsHumanCount');
  });

  it('GET /api/v1/ai/admin/repeated-unknowns groups unanswered queries and flags frequency', async () => {
    // Seed 3 repeated unknown logs
    const seedSession = `repeat_test_${Date.now()}`;
    const testLogs = await Promise.all([
      AiChatAuditLog.create({
        sessionUuid: seedSession,
        message: 'Do you offer steam sterilization for moringa leaf powder?',
        answer: 'I do not have verified steam sterilization specs; our export team will confirm.',
        intent: 'product_spec',
        needsHuman: true,
        confidence: 0.5,
        isResolved: false,
      }),
      AiChatAuditLog.create({
        sessionUuid: seedSession,
        message: 'Do you offer steam sterilization for moringa leaf powder?',
        answer: 'I do not have verified steam sterilization specs; our export team will confirm.',
        intent: 'product_spec',
        needsHuman: true,
        confidence: 0.5,
        isResolved: false,
      }),
      AiChatAuditLog.create({
        sessionUuid: seedSession,
        message: 'Do you offer steam sterilization for moringa leaf powder?',
        answer: 'I do not have verified steam sterilization specs; our export team will confirm.',
        intent: 'product_spec',
        needsHuman: true,
        confidence: 0.5,
        isResolved: false,
      }),
    ]);

    const res = await request(app)
      .get('/api/v1/ai/admin/repeated-unknowns')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const found = res.body.data.find((item) =>
      item.query.toLowerCase().includes('steam sterilization')
    );
    expect(found).toBeTruthy();
    expect(found.count).toBeGreaterThanOrEqual(3);
    expect(found.alert).toBe(true);

    // Clean up seeded logs
    await AiChatAuditLog.destroy({
      where: { id: testLogs.map((l) => l.id) },
    }).catch(() => {});
  });

  it('PATCH /api/v1/ai/admin/audit-logs/:id/resolve marks log as resolved with note', async () => {
    expect(createdLogId).toBeTruthy();

    const res = await request(app)
      .patch(`/api/v1/ai/admin/audit-logs/${createdLogId}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        resolvedNote: 'Confirmed facility details and verified company fact in knowledge base.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isResolved).toBe(true);
    expect(res.body.data.resolvedNote).toContain('Confirmed facility details');

    const verifiedDb = await AiChatAuditLog.findByPk(createdLogId);
    expect(verifiedDb.isResolved).toBe(true);
  });
});
