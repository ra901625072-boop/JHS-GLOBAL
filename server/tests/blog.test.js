import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';

describe('Blog & Dynamic SEO Engine Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('GET /api/v1/blog should return published articles list with pagination', async () => {
    const res = await request(app).get('/api/v1/blog?limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('slug');
    expect(res.body.data[0]).toHaveProperty('category');
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta).toHaveProperty('total');
  });

  it('GET /api/v1/blog/:slug should return single article with related posts', async () => {
    const res = await request(app).get(
      '/api/v1/blog/understanding-curcumin-content-in-salem-vs-alleppey-turmeric'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('post');
    expect(res.body.data.post.slug).toBe(
      'understanding-curcumin-content-in-salem-vs-alleppey-turmeric'
    );
    expect(res.body.data.post).toHaveProperty('content');
    expect(res.body.data).toHaveProperty('related');
    expect(Array.isArray(res.body.data.related)).toBe(true);
  });

  it('GET /api/v1/blog/non-existent-article should return 404', async () => {
    const res = await request(app).get('/api/v1/blog/non-existent-article-slug-xyz');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /sitemap.xml should return valid XML sitemap with static and dynamic entity routes', async () => {
    const res = await request(app).get('/sitemap.xml');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/xml');
    expect(res.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(res.text).toContain('<urlset');
    expect(res.text).toContain('/products');
    expect(res.text).toContain('/categories/');
    expect(res.text).toContain('/blog/');
  });

  it('GET /robots.txt should return robots directives blocking admin paths and pointing to sitemap', async () => {
    const res = await request(app).get('/robots.txt');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('User-agent: *');
    expect(res.text).toContain('Disallow: /admin/');
    expect(res.text).toContain('Sitemap:');
  });

  it('cacheService.invalidateBlog() should flush cached blog queries and slug endpoints', async () => {
    const { cacheService } = await import('../src/services/cache.service.js');
    await cacheService.set('http:/api/v1/blog', { test: true }, 60);
    await cacheService.set('http:/api/v1/blog/test-slug', { test: true }, 60);

    expect(await cacheService.get('http:/api/v1/blog')).not.toBeNull();
    cacheService.invalidateBlog('test-slug');
    expect(await cacheService.get('http:/api/v1/blog')).toBeNull();
    expect(await cacheService.get('http:/api/v1/blog/test-slug')).toBeNull();
  });
});
