import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import connectDB, { disconnectDB } from '../src/config/db.js';
import Task from '../src/modules/task/task.model.js';

describe('Sales Follow-up & Task Queue Suite', () => {
  let salesToken = '';
  let editorToken = '';
  let createdTaskId = '';

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

  it('POST /api/v1/tasks should create follow-up reminder', async () => {
    const payload = {
      title: 'WhatsApp follow-up on Basmati Rice quotation Q-1024',
      taskType: 'whatsapp',
      company: 'ABC Trading LLC',
      customerName: 'Rahim Khan',
      country: 'United Arab Emirates',
      dueDate: new Date().toISOString(),
      dueTime: '09:30 AM',
      priority: 'high',
      notes: 'Follow up regarding 5 containers basmati rice CIF Dubai.',
    };

    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${salesToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('WhatsApp follow-up');
    expect(res.body.data.status).toBe('pending');

    createdTaskId = res.body.data._id;
  });

  it('GET /api/v1/tasks/today should return active follow-ups scheduled for today', async () => {
    const res = await request(app)
      .get('/api/v1/tasks/today')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((t) => t._id === createdTaskId)).toBe(true);
  });

  it('PATCH /api/v1/tasks/:id/status should mark task as completed', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${createdTaskId}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ status: 'completed', notes: 'Client requested price adjustment by $20/MT.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.completedAt).toBeDefined();
  });

  it('DELETE /api/v1/tasks/:id should remove task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Editor should be forbidden (403) from accessing sales follow-ups', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(res.status).toBe(403);
  });
});
