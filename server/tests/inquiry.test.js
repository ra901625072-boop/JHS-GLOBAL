import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Inquiry from '../src/modules/inquiry/inquiry.model.js';

describe('Inquiry & Sample API Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('POST /api/v1/inquiries should accept valid RFQ and return 201 with RFQ reference number', async () => {
    const rfqPayload = {
      name: 'Michael Vance',
      email: 'm.vance@eurofoods-import.de',
      company: 'EuroFoods Import GmbH',
      country: 'Germany',
      city: 'Hamburg',
      destinationPort: 'Hamburg Port',
      incoterm: 'CIF',
      targetShipmentMonth: 'November 2026',
      buyerType: 'importer',
      items: [
        {
          productName: 'Salem Turmeric Finger',
          quantity: 20,
          unit: 'MT',
          packing: '25 kg PP Bags',
        },
      ],
      message: 'Looking for 1x 20ft container trial order under CIF Hamburg terms.',
    };

    const res = await request(app).post('/api/v1/inquiries').send(rfqPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNo).toMatch(/^RFQ-\d{4}-\d{6}$/);
    expect(res.body.data.status).toBe('new');
    expect(res.body.data.promisedResponseTime).toBe('48 business hours');

    // Verify persisted in DB
    const persisted = await Inquiry.findOne({ where: { referenceNo: res.body.data.referenceNo } });
    expect(persisted).toBeDefined();
    expect(persisted.buyer.company).toBe('EuroFoods Import GmbH');
    expect(persisted.items[0].productName).toBe('Salem Turmeric Finger');
  });

  it('POST /api/v1/inquiries should reject when required buyer fields are missing', async () => {
    const invalidPayload = {
      name: '',
      email: 'invalid-email',
      company: '',
      country: '',
    };

    const res = await request(app).post('/api/v1/inquiries').send(invalidPayload);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('POST /api/v1/inquiries should reject when neither products nor message are supplied', async () => {
    const emptyCommoditiesPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Traders',
      country: 'United Arab Emirates',
      items: [],
      message: '',
    };

    const res = await request(app).post('/api/v1/inquiries').send(emptyCommoditiesPayload);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.details.some((d) => d.field === 'items')).toBe(true);
  });

  it('POST /api/v1/inquiries with honeypot filled should flag submission as spam', async () => {
    const spamPayload = {
      name: 'Spam Bot',
      email: 'bot@spam.com',
      company: 'Spam Corp',
      country: 'Russia',
      message: 'Buy cheap watches online',
      website_hp: 'https://spam-link.com', // Honeypot filled by bot
    };

    const res = await request(app).post('/api/v1/inquiries').send(spamPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('spam');

    const persisted = await Inquiry.findOne({ where: { referenceNo: res.body.data.referenceNo } });
    expect(persisted.status).toBe('spam');
    expect(persisted.priority).toBe('cold');
  });

  it('POST /api/v1/samples should accept valid sample request and return 201', async () => {
    const samplePayload = {
      name: 'Sarah Connor',
      email: 'qa@nutritionlabs.co.uk',
      company: 'Nutrition Labs UK Ltd',
      country: 'United Kingdom',
      products: [
        {
          productName: 'Organic Psyllium Husk 99%',
          qty: '250g',
        },
      ],
      shippingAddress: {
        street: '14 BioPark Avenue',
        city: 'Manchester',
        postalCode: 'M1 4BT',
        country: 'United Kingdom',
      },
      courierAccount: {
        provider: 'DHL',
        accountNumber: '968541235',
      },
    };

    const res = await request(app).post('/api/v1/samples').send(samplePayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNo).toMatch(/^SMP-\d{4}-\d{6}$/);
    expect(res.body.data.status).toBe('new');
  });
});
