import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import CompanyFact from '../src/modules/companyFact/companyFact.model.js';
import AiChatAuditLog from '../src/modules/ai/aiChatAuditLog.model.js';

describe('AI Desk & Knowledge Base Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let createdFactId = null;
  let testChatLogId = null;
  const testFactKey = `operations_test_port_${Date.now()}`;

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

    // Create a mock unverified chat audit log for resolution test
    const mockLog = await AiChatAuditLog.create({
      sessionUuid: `session-test-${Date.now()}`,
      message: 'What is the bulk density and container capacity of Psyllium Husk 99%?',
      answer: 'Standard export container load accommodates 19 metric tonnes in 20ft FCL container with palletized bags.',
      intent: 'shipping_logistics',
      confidence: 0.65,
      needsHuman: true,
      suggestedAction: 'verify_spec',
      isResolved: false,
    });
    testChatLogId = mockLog.id;
  }, 35000);

  afterAll(async () => {
    if (createdFactId) {
      await CompanyFact.destroy({ where: { id: createdFactId } }).catch(() => {});
    }
    if (testChatLogId) {
      await AiChatAuditLog.destroy({ where: { id: testChatLogId } }).catch(() => {});
    }
    await disconnectDB();
  });

  describe('AI Desk & Vector Knowledge Endpoints (US-AI-001)', () => {
    it('GET /api/v1/admin/ai-desk/summary returns vector embedding health and chat audit stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/ai-desk/summary')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('embeddings');
      expect(res.body.data).toHaveProperty('facts');
      expect(res.body.data).toHaveProperty('chats');

      expect(res.body.data.embeddings).toHaveProperty('total');
      expect(res.body.data.embeddings).toHaveProperty('bySource');
      expect(res.body.data.facts).toHaveProperty('verificationRate');
      expect(res.body.data.chats).toHaveProperty('needsHuman');
    });

    it(
      'POST /api/v1/admin/ai-desk/reindex allows editor/admin to trigger RAG vector reindexing',
      async () => {
        const res = await request(app)
          .post('/api/v1/admin/ai-desk/reindex')
          .set('Authorization', `Bearer ${editorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('indexedProducts');
        expect(res.body.data).toHaveProperty('indexedFaqs');
        expect(res.body.data).toHaveProperty('totalEmbeddings');
      },
      60000
    );

    it('GET /api/v1/company-facts/admin returns company facts filtered by verification', async () => {
      const res = await request(app)
        .get('/api/v1/company-facts/admin?limit=10')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('facts');
      expect(Array.isArray(res.body.data.facts)).toBe(true);
      expect(res.body.data.facts.length).toBeGreaterThan(0);

      const first = res.body.data.facts[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('factKey');
      expect(first).toHaveProperty('label');
      expect(first).toHaveProperty('factValue');
      expect(first).toHaveProperty('isVerified');
    });

    it('POST /api/v1/company-facts/admin allows editor to register a verified export fact', async () => {
      const payload = {
        category: 'operations',
        factKey: testFactKey,
        label: 'Hazira Container Port Loading Berth',
        factValue: 'Adani Hazira Port (INHAZ1) serves as our secondary deep-water gateway located 25 km from Surat commercial processing facility.',
        source: 'client_document',
        sourceDocument: 'Export Logistics Protocol 2026',
        isVerified: true,
        isPublic: true,
        notes: 'Verified against Surat district logistics survey',
      };

      const res = await request(app)
        .post('/api/v1/company-facts/admin')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.factKey).toBe(testFactKey);
      expect(res.body.data.isVerified).toBe(true);

      createdFactId = res.body.data.id;
    });

    it('GET /api/v1/company-facts/admin/:id returns single company fact dossier', async () => {
      expect(createdFactId).not.toBeNull();

      const res = await request(app)
        .get(`/api/v1/company-facts/admin/${createdFactId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdFactId);
      expect(res.body.data.factKey).toBe(testFactKey);
    });

    it('PUT /api/v1/company-facts/admin/:id updates fact value and notes', async () => {
      expect(createdFactId).not.toBeNull();

      const updatedVal = 'Adani Hazira Port (INHAZ1) handles 20ft and 40ft ISO tank containers with direct berth access.';
      const res = await request(app)
        .put(`/api/v1/company-facts/admin/${createdFactId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          factValue: updatedVal,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.factValue).toBe(updatedVal);
    });

    it('GET /api/v1/ai/admin/audit-logs returns visitor chat transcripts for triage', async () => {
      const res = await request(app)
        .get('/api/v1/ai/admin/audit-logs?limit=5')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('logs');
      expect(Array.isArray(res.body.data.logs)).toBe(true);
    });

    it('GET /api/v1/ai/admin/repeated-unknowns returns knowledge gap topics', async () => {
      const res = await request(app)
        .get('/api/v1/ai/admin/repeated-unknowns')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PATCH /api/v1/ai/admin/audit-logs/:id/resolve resolves chat inquiry with staff note', async () => {
      expect(testChatLogId).not.toBeNull();

      const res = await request(app)
        .patch(`/api/v1/ai/admin/audit-logs/${testChatLogId}/resolve`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          resolvedNote: 'Specification sheet confirmed by laboratory QA desk',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isResolved).toBe(true);
      expect(res.body.data.resolvedNote).toContain('Specification sheet confirmed');
    });

    it('DELETE /api/v1/company-facts/admin/:id allows admin to delete company fact', async () => {
      expect(createdFactId).not.toBeNull();

      const res = await request(app)
        .delete(`/api/v1/company-facts/admin/${createdFactId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('deleted');

      createdFactId = null;
    });

    it('RBAC Role Security: Sales role cannot trigger reindexing or create facts', async () => {
      const reindexRes = await request(app)
        .post('/api/v1/admin/ai-desk/reindex')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(reindexRes.status).toBe(403);

      const createRes = await request(app)
        .post('/api/v1/company-facts/admin')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          category: 'operations',
          factKey: 'unauthorized.test',
          label: 'Unauthorized Fact',
          factValue: 'Unauthorized',
        });

      expect(createRes.status).toBe(403);
    });

    it('Unauthenticated requests to /api/v1/admin/ai-desk/summary return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/admin/ai-desk/summary');
      expect(res.status).toBe(401);
    });
  });
});
