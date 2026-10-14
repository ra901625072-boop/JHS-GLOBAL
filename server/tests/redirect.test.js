import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('301 Permanent Redirect Suite', () => {
  it('GET /about should return 301 redirecting to /about-us', async () => {
    const res = await request(app).get('/about');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/about-us');
  });

  it('GET /about/ (trailing slash) should return 301 redirecting to /about-us', async () => {
    const res = await request(app).get('/about/');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/about-us');
  });

  it('GET /private-label should return 301 redirecting to /about-us', async () => {
    const res = await request(app).get('/private-label');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/about-us');
  });

  it('GET /global-reach should return 301 redirecting to /about-us', async () => {
    const res = await request(app).get('/global-reach');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/about-us');
  });

  it('GET /sitemap.xml should include /about-us and /faq URLs with XML headers', async () => {
    const res = await request(app).get('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/xml');
    expect(res.text).toContain('/about-us</loc>');
    expect(res.text).toContain('/faq</loc>');
    expect(res.text).not.toContain('/about</loc>');
  });
});
