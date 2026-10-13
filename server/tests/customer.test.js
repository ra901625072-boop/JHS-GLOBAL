import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Customer from '../src/modules/customer/customer.model.js';
import { getCustomerById } from '../src/modules/customer/customer.service.js';
import { Op } from 'sequelize';

describe('Customer CRM & Account Management Suite', () => {
  let salesToken = '';
  let editorToken = '';
  let createdCustomerId = '';

  beforeAll(async () => {
    await connectDB();

    await Customer.destroy({
      where: {
        email: { [Op.in]: ['tariq@gulfspices.ae', 'e.rostova@baltic-ingredients.pl'] },
      },
    });

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
    await Customer.destroy({
      where: {
        email: { [Op.in]: ['tariq@gulfspices.ae', 'e.rostova@baltic-ingredients.pl'] },
      },
    });
    await disconnectDB();
  });

  it('POST /api/v1/customers should manually register overseas buyer account', async () => {
    const payload = {
      companyName: 'Gulf Spices Trading LLC',
      contactPerson: 'Tariq Al-Mansoor',
      country: 'United Arab Emirates',
      city: 'Dubai',
      email: 'tariq@gulfspices.ae',
      phone: '+971 4 9876543',
      whatsapp: '+971 50 1234567',
      businessType: 'importer',
      interestedProducts: ['Salem Turmeric', 'Green Cardamom', 'Cumin Seeds'],
      currency: 'USD',
      preferredPort: 'Jebel Ali Port, Dubai',
      preferredIncoterm: 'CIF',
      paymentTerms: '30% Advance TT, 70% against BL copy',
      note: 'Met at Gulfood trade show 2026. High container volume potential.',
    };

    const res = await request(app)
      .post('/api/v1/customers')
      .set('Authorization', `Bearer ${salesToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.companyName).toBe('Gulf Spices Trading LLC');
    expect(res.body.data.email).toBe('tariq@gulfspices.ae');
    expect(res.body.data.notes.length).toBe(1);

    createdCustomerId = res.body.data._id;
  });

  it('GET /api/v1/customers should list and search buyer profiles', async () => {
    const res = await request(app)
      .get('/api/v1/customers?q=Gulf')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((c) => c.companyName === 'Gulf Spices Trading LLC')).toBe(true);
  });

  it('GET /api/v1/customers/:id should retrieve buyer profile with history', async () => {
    const res = await request(app)
      .get(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdCustomerId);
    expect(res.body.data.contactPerson).toBe('Tariq Al-Mansoor');
  });

  it('PUT /api/v1/customers/:id should update trade preferences', async () => {
    const res = await request(app)
      .put(`/api/v1/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        shippingPreference: '40ft HC Containers',
        note: 'Customer requested 40ft HC instead of standard 20ft.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.shippingPreference).toBe('40ft HC Containers');
  });

  it('POST /api/v1/customers/:id/notes should record interaction audit note', async () => {
    const res = await request(app)
      .post(`/api/v1/customers/${createdCustomerId}/notes`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ note: 'Called Tariq on WhatsApp. Discussed price target for 2x 20ft containers.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notes.length).toBeGreaterThanOrEqual(2);
  });

  it('Submitting a public RFQ should auto-register or link customer in CRM', async () => {
    const rfqRes = await request(app).post('/api/v1/inquiries').send({
      name: 'Elena Rostova',
      email: 'e.rostova@baltic-ingredients.pl',
      company: 'Baltic Ingredients Sp. z o.o.',
      country: 'Poland',
      destinationPort: 'Gdansk',
      incoterm: 'CIF',
      items: [{ productName: 'Dehydrated White Onion Flakes', quantity: 15, unit: 'MT' }],
      message: 'Need prompt FOB or CIF Gdansk container quote.',
    });

    expect(rfqRes.status).toBe(201);

    // Poll up to 2000ms for background async CRM persistence
    let customer = null;
    for (let i = 0; i < 20; i++) {
      customer = await Customer.findOne({ where: { email: 'e.rostova@baltic-ingredients.pl' } });
      if (customer) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(customer).toBeDefined();
    expect(customer.companyName).toBe('Baltic Ingredients Sp. z o.o.');
    expect(customer.country).toBe('Poland');
    expect(customer.interestedProducts).toContain('Dehydrated White Onion Flakes');
    const customerWithHistory = await getCustomerById(customer.id);
    expect(customerWithHistory.previousInquiries.length).toBe(1);
  });

  it('Editor should be forbidden (403) from accessing customer financial/CRM data', async () => {
    const res = await request(app)
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(res.status).toBe(403);
  });
});
