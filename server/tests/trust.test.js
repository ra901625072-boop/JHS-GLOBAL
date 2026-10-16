import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';

describe('Trust & Informational Endpoints Suite', () => {
  beforeAll(async () => {
    await connectDB();
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/certificates should return public certificates list', async () => {
    const res = await request(app).get('/api/v1/certificates');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('scope');
  });

  it('GET /api/v1/testimonials should return buyer testimonials', async () => {
    const res = await request(app).get('/api/v1/testimonials');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('company');
    expect(res.body.data[0]).toHaveProperty('country');
  });

  it('GET /api/v1/market-regions should return regional destinations and transit days', async () => {
    const res = await request(app).get('/api/v1/market-regions');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('region');
    expect(res.body.data[0]).toHaveProperty('transitDays');
    expect(Array.isArray(res.body.data[0].countries)).toBe(true);
  });

  it('GET /api/v1/faqs should return categorized FAQs', async () => {
    const res = await request(app).get('/api/v1/faqs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('question');
    expect(res.body.data[0]).toHaveProperty('answer');
    expect(res.body.data[0]).toHaveProperty('group');
  });

  it('GET /api/v1/faqs should contain zero unfinished TODO(client) placeholder strings', async () => {
    const res = await request(app).get('/api/v1/faqs');

    expect(res.status).toBe(200);
    const todoFaqs = res.body.data.filter(
      (f) => f.answer.includes('TODO(') || f.question.includes('TODO(')
    );
    expect(todoFaqs).toHaveLength(0);
  });
});
