import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Order from '../src/modules/order/order.model.js';

describe('Order & Export Shipment Lifecycle Suite', () => {
  let salesToken = '';
  let editorToken = '';
  let createdOrderId = '';
  let createdDocId = '';

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

  it('POST /api/v1/orders should create confirmed export order', async () => {
    const payload = {
      buyer: {
        name: 'Michael Vance',
        email: 'm.vance@eurofoods-import.de',
        company: 'EuroFoods Import GmbH',
        country: 'Germany',
        phone: '+49 40 123456',
        address: 'Am Sandtorkai 48, Hamburg',
      },
      products: [
        {
          productName: 'Organic Salem Turmeric Finger',
          specification: 'Curcumin 3.5% Min, Moisture 10% Max',
          quantity: 20,
          unit: 'MT',
          unitPrice: 1850,
          total: 37000,
        },
      ],
      currency: 'USD',
      totalAmount: 40000,
      incoterm: 'CIF',
      paymentTerms: '30% Advance TT, 70% against BL copy',
      shippingMethod: 'Ocean FCL',
      destinationPort: 'Hamburg Port, Germany',
      expectedShipmentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Customer confirmed Proforma QT-2026-000001.',
    };

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${salesToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toMatch(/^ORD-\d{4}-\d{6}$/);
    expect(res.body.data.orderStatus).toBe('confirmed');
    expect(res.body.data.totalAmount).toBe(40000);

    createdOrderId = res.body.data._id;
  });

  it('GET /api/v1/orders should list export orders', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/orders/:id should retrieve order with shipment and docs', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdOrderId);
    expect(res.body.data.buyer.company).toBe('EuroFoods Import GmbH');
  });

  it('PATCH /api/v1/orders/:id/status should advance status along export pipeline', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ orderStatus: 'processing', notes: 'Factory commenced cleaning and container packing.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderStatus).toBe('processing');
  });

  it('PATCH /api/v1/orders/:id/shipment should log maritime container & tracking details', async () => {
    const shipmentData = {
      containerNumber: 'MSKU-7892341',
      shippingLine: 'Maersk Line',
      portOfLoading: 'Mundra Port (INMUN1)',
      portOfDischarge: 'Hamburg Port (DEHAM)',
      etd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      eta: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
      billOfLadingNumber: 'MAEU238917293',
      trackingUrl: 'https://www.maersk.com/tracking/MSKU7892341',
      shippingStatus: 'loaded',
    };

    const res = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}/shipment`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send(shipmentData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.shipment.containerNumber).toBe('MSKU-7892341');
    expect(res.body.data.shipment.shippingLine).toBe('Maersk Line');
    expect(res.body.data.shipment.billOfLadingNumber).toBe('MAEU238917293');
  });

  it('POST /api/v1/orders/:id/documents should attach export documents', async () => {
    const docData = {
      documentType: 'Bill of Lading',
      documentNumber: 'BL-MAEU-2026-88',
      fileName: 'Original_Bill_Of_Lading_MSKU.pdf',
      fileUrl: 'https://storage.exportb2b.com/docs/bl-88.pdf',
    };

    const res = await request(app)
      .post(`/api/v1/orders/${createdOrderId}/documents`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send(docData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.documents.length).toBe(1);
    expect(res.body.data.documents[0].documentType).toBe('Bill of Lading');

    createdDocId = res.body.data.documents[0]._id;
  });

  it('DELETE /api/v1/orders/:id/documents/:docId should remove document', async () => {
    const res = await request(app)
      .delete(`/api/v1/orders/${createdOrderId}/documents/${createdDocId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.documents.length).toBe(0);
  });

  it('Editor should be forbidden (403) from managing orders and shipments', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(res.status).toBe(403);
  });
});
