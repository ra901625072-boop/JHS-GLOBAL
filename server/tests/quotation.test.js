import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Quotation from '../src/modules/quotation/quotation.model.js';

describe('Quotation & Export Pricing Suite', () => {
  let salesToken = '';
  let editorToken = '';
  let createdQuotationId = '';

  beforeAll(async () => {
    await connectDB();

    const salesRes = await request(app).post('/api/v1/auth/login').send({
      email: 'sales@exportb2b.com',
      password: 'Sales@Export2026!',
    });
    salesToken = salesRes.body.data.accessToken;

    const editorRes = await request(app).post('/api/v1/auth/login').send({
      email: 'editor@exportb2b.com',
      password: 'Editor@Export2026!',
    });
    editorToken = editorRes.body.data.accessToken;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('POST /api/v1/quotations should create quotation with Incoterm & price breakdown', async () => {
    const payload = {
      buyer: {
        name: 'Michael Vance',
        email: 'm.vance@eurofoods-import.de',
        company: 'EuroFoods Import GmbH',
        country: 'Germany',
        phone: '+49 40 123456',
        address: 'Hamburg Logistics Park',
      },
      items: [
        {
          productName: 'Salem Turmeric Finger Extra Bold',
          specification: 'Min 3.5% Curcumin, 25kg PP bags with inner liner',
          quantity: 20,
          unit: 'MT',
          unitPrice: 1850,
          total: 37000,
        },
      ],
      currency: 'USD',
      subtotal: 37000,
      shippingCharges: 2400,
      insuranceCharges: 350,
      otherCharges: 250,
      totalAmount: 40000,
      incoterm: 'CIF',
      portOfLoading: 'Mundra Port, India',
      portOfDischarge: 'Hamburg Port, Germany',
      paymentTerms: '30% Advance TT, 70% against BL copy',
      validityDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryTime: '15-20 days prompt shipment',
      notes: 'Price includes phytosanitary certificate and fumigation.',
    };

    const res = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${salesToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quotationNumber).toMatch(/^QT-\d{4}-\d{6}$/);
    expect(res.body.data.totalAmount).toBe(40000);
    expect(res.body.data.incoterm).toBe('CIF');

    createdQuotationId = res.body.data._id;
  });

  it('GET /api/v1/quotations should list quotations for sales desk', async () => {
    const res = await request(app)
      .get('/api/v1/quotations')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/quotations/:id should retrieve quotation details', async () => {
    const res = await request(app)
      .get(`/api/v1/quotations/${createdQuotationId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdQuotationId);
    expect(res.body.data.buyer.company).toBe('EuroFoods Import GmbH');
  });

  it('PATCH /api/v1/quotations/:id/status should update status to sent', async () => {
    const res = await request(app)
      .patch(`/api/v1/quotations/${createdQuotationId}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'sent', notes: 'Dispatched to buyer via corporate email.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('sent');
  });

  it('GET /api/v1/quotations/:id/pdf should stream a valid PDF file', async () => {
    const res = await request(app)
      .get(`/api/v1/quotations/${createdQuotationId}/pdf`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('.pdf');
    expect(res.body.length).toBeGreaterThan(500); // Verify binary PDF buffer returned
  });

  it('Editor should be forbidden (403) from accessing quotations', async () => {
    const res = await request(app)
      .get('/api/v1/quotations')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(res.status).toBe(403);
  });
});
