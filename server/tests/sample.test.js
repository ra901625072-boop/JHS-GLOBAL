import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import SampleRequest from '../src/modules/sample/sample.model.js';
import { generateTrackingUrl } from '../src/modules/sample/sample.service.js';

describe('Sample Dispatch Desk & Courier Tracking Suite', () => {
  let adminToken = '';
  let salesToken = '';
  let editorToken = '';
  let testSampleId = '';

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

    // Create or find an existing sample for test fixtures
    const newSample = await SampleRequest.create({
      referenceNo: `SMP-TEST-${Date.now()}`,
      buyer: {
        name: 'Dr. Klaus Weber',
        email: 'k.weber@bavaria-pharma.de',
        company: 'Bavaria Pharma GmbH',
        country: 'Germany',
      },
      products: [
        {
          productName: 'Organic Ashwagandha Extract 5% Withanolides',
          qty: '250g',
        },
      ],
      shippingAddress: {
        street: '88 Ludwigstrasse',
        city: 'Munich',
        state: 'Bavaria',
        postalCode: '80539',
        country: 'Germany',
      },
      courierAccount: {
        provider: 'DHL',
        accountNumber: '96845231',
      },
      testingParameters: 'HPLC assay for Withanolide content, heavy metals test, residual solvents check.',
      status: 'new',
    });
    testSampleId = (newSample.id || newSample._id).toString();
  }, 35000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Courier Tracking URL Generator Helper', () => {
    it('should generate valid DHL Express tracking URL', () => {
      const url = generateTrackingUrl('DHL', '1234567890');
      expect(url).toContain('dhl.com');
      expect(url).toContain('1234567890');
    });

    it('should generate valid FedEx tracking URL', () => {
      const url = generateTrackingUrl('FedEx', '789123456');
      expect(url).toContain('fedex.com');
      expect(url).toContain('789123456');
    });

    it('should generate valid Aramex tracking URL', () => {
      const url = generateTrackingUrl('Aramex', '3049582910');
      expect(url).toContain('aramex.com');
      expect(url).toContain('3049582910');
    });
  });

  describe('Admin Sample Dispatch Desk Endpoints', () => {
    it('GET /api/v1/samples should reject unauthenticated requests (401)', async () => {
      const res = await request(app).get('/api/v1/samples');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/samples should allow sales desk to query paginated samples', async () => {
      const res = await request(app)
        .get('/api/v1/samples?limit=10')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('total');
    });

    it('GET /api/v1/samples/:id should return complete sample dossier details', async () => {
      const res = await request(app)
        .get(`/api/v1/samples/${testSampleId}`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.buyer.company).toBe('Bavaria Pharma GmbH');
      expect(res.body.data.shippingAddress.city).toBe('Munich');
      expect(res.body.data.testingParameters).toContain('Withanolide');
    });

    it('PATCH /api/v1/samples/:id should allow updating status and staff notes', async () => {
      const res = await request(app)
        .patch(`/api/v1/samples/${testSampleId}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          status: 'preparing',
          courier: 'DHL',
          note: 'Sample lot #ASH-2026-04 weighed and nitrogen vacuum sealed in cleanroom.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('preparing');
      expect(res.body.data.notes.some((n) => n.text.includes('nitrogen vacuum'))).toBe(true);
    });

    it('POST /api/v1/samples/:id/dispatch should record courier AWB, tracking URL, and COA attachment', async () => {
      const res = await request(app)
        .post(`/api/v1/samples/${testSampleId}/dispatch`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          courier: 'DHL',
          awbNumber: 'DHL-9842109845',
          note: 'Handed to Surat DHL Express pickup courier. Transit expected 3-4 business days.',
          documents: [
            {
              type: 'COA',
              name: 'Certificate-of-Analysis-Batch-ASH-2026-04.pdf',
              url: 'https://cdn.jhsglobal.com/specs/ash-coa-2026.pdf',
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('dispatched');
      expect(res.body.data.courier).toBe('DHL');
      expect(res.body.data.awbNumber).toBe('DHL-9842109845');
      expect(res.body.data.trackingUrl).toContain('dhl.com');
      expect(res.body.data.dispatchedAt).toBeDefined();
      expect(res.body.data.documents.some((d) => d.type === 'COA')).toBe(true);
    });

    it('POST /api/v1/samples/:id/documents should attach additional technical documents (SDS)', async () => {
      const res = await request(app)
        .post(`/api/v1/samples/${testSampleId}/documents`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          type: 'SDS',
          name: 'Safety-Data-Sheet-Ashwagandha-Extract.pdf',
          url: 'https://cdn.jhsglobal.com/compliance/ash-sds-2026.pdf',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.documents.some((d) => d.type === 'SDS')).toBe(true);
    });

    it('Role Check: Editor role should be forbidden (403) from managing samples', async () => {
      const res = await request(app)
        .patch(`/api/v1/samples/${testSampleId}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ status: 'delivered' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
