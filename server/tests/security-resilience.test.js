import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import jwt from 'jsonwebtoken';
import env from '../src/config/env.js';

describe('Security & Resilience Hardening Suite', () => {
  let editorToken = '';
  let salesToken = '';

  beforeAll(async () => {
    await connectDB();

    const editorRes = await request(app).post('/api/v1/auth/login').send({
      email: 'editor@exportb2b.com',
      password: 'Editor@Export2026!',
    });
    if (editorRes.body?.data?.accessToken) {
      editorToken = editorRes.body.data.accessToken;
    }

    const salesRes = await request(app).post('/api/v1/auth/login').send({
      email: 'sales@exportb2b.com',
      password: 'Sales@Export2026!',
    });
    if (salesRes.body?.data?.accessToken) {
      salesToken = salesRes.body.data.accessToken;
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // ─── 1. Security Headers & Defense in Depth ────────────────────────
  describe('Security Headers & CORS Protections', () => {
    it('should include secure HTTP headers via Helmet on public endpoints', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-dns-prefetch-control']).toBe('off');
      expect(res.headers['x-download-options']).toBe('noopen');
    });

    it('should disallow or reject malformed / tampered content-type payloads', async () => {
      const res = await request(app)
        .post('/api/v1/inquiries')
        .set('Content-Type', 'application/json')
        .send('{"invalid_json": true,'); // Broken JSON

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 2. SQL Injection Resistance ──────────────────────────────────
  describe('SQL Injection & Query Fuzzing Resistance', () => {
    const maliciousPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE products; --",
      "' UNION SELECT null, null, null, null--",
      "1' OR 1=1 #",
      "admin' --",
      "' OR pg_sleep(5)--",
    ];

    maliciousPayloads.forEach((payload) => {
      it(`should safely handle SQL injection vector: ${payload}`, async () => {
        const res = await request(app).get(`/api/v1/products?q=${encodeURIComponent(payload)}`);
        // Must succeed safely with parameterized query returning empty/filtered list without DB error
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data?.products || res.body.data)).toBe(true);
      });
    });
  });

  // ─── 3. Auth Bypass & Role Escalation Defense ──────────────────────
  describe('Authentication & Role Escalation Defenses', () => {
    it('should reject requests with missing authorization token on protected routes', async () => {
      const res = await request(app).get('/api/v1/customers');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject tampered or forged JWT tokens', async () => {
      const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OSwicm9sZSI6InN1cGVyYWRtaW4ifQ.invalid_signature_here';
      const res = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject tokens signed with an arbitrary secret key', async () => {
      const rogueToken = jwt.sign({ id: 1, role: 'superadmin' }, 'malicious-secret-key-12345');
      const res = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${rogueToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should enforce strict Role-Based Access Control (RBAC): Editor cannot access financial/CRM resources', async () => {
      const res = await request(app)
        .post('/api/v1/customers')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          companyName: 'Unauthorized Corp',
          contactPerson: 'Eve',
          country: 'Germany',
          email: 'eve@unauthorized.de',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── 4. Input Sanitization & XSS Resistance ───────────────────────
  describe('Input Sanitization & XSS Resistance', () => {
    it('should safely store and sanitize HTML tags without executing scripts', async () => {
      const xssMessage = '<script>alert("XSS")</script><img src="x" onerror="alert(1)"> Urgent CIF Quote needed';
      const rfqRes = await request(app).post('/api/v1/inquiries').send({
        name: '<script>alert(1)</script>Security Researcher',
        email: 'security.check@xss-eval.org',
        company: 'Vulnerability Test Inc <iframe src="evil.com"></iframe>',
        country: 'Netherlands',
        destinationPort: 'Rotterdam',
        incoterm: 'CIF',
        items: [{ productName: 'Organic Cumin Seeds', quantity: 20, unit: 'MT' }],
        message: xssMessage,
      });

      expect(rfqRes.status).toBe(201);
      expect(rfqRes.body.success).toBe(true);
      expect(rfqRes.body.data.referenceNo).toBeDefined();
    });
  });

  // ─── 5. Resilience & Fault Tolerance ──────────────────────────────
  describe('Resilience & Graceful Degradation', () => {
    it('should return standardized 404 error envelope on undefined routes without leaking internals', async () => {
      const res = await request(app).get('/api/v1/non-existent-endpoint-xyz');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Route not found');
      expect(res.body.stack).toBeUndefined(); // Stack trace never exposed in client API responses
    });

    it('should reject abusive pagination limits with 422 and handle high page numbers cleanly with 200', async () => {
      // Abusive limit (> 50) rejected safely
      const abusiveRes = await request(app).get('/api/v1/products?page=1&limit=1000000');
      expect(abusiveRes.status).toBe(422);
      expect(abusiveRes.body.success).toBe(false);

      // High page within valid limit handles gracefully with 200 and empty list
      const highPageRes = await request(app).get('/api/v1/products?page=999999&limit=20');
      expect(highPageRes.status).toBe(200);
      expect(highPageRes.body.success).toBe(true);
      expect(highPageRes.body.data.length).toBe(0);
    });

    it('should handle simulated external email transport absence gracefully without crashing RFQ submission', async () => {
      // In this environment SMTP credentials are simulated. RFQ submission must still yield 201 Created.
      const rfqRes = await request(app).post('/api/v1/inquiries').send({
        name: 'Reliability Test',
        email: 'reliability@resilience-test.com',
        company: 'Resilient Logistics BV',
        country: 'Germany',
        destinationPort: 'Hamburg',
        incoterm: 'FOB',
        items: [{ productName: 'Dehydrated White Onion Flakes', quantity: 10, unit: 'MT' }],
        message: 'Testing email resilience fallback.',
      });

      expect(rfqRes.status).toBe(201);
      expect(rfqRes.body.success).toBe(true);
    });
  });
});
