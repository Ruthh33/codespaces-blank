import request from 'supertest';
import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import app from '../server/embedded-signup-server.js';

describe('embedded signup server', () => {
  it('returns webhook events list', async () => {
    const response = await request(app).get('/api/webhooks/events');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('events');
    expect(Array.isArray(response.body.events)).toBe(true);
  });

  it('accepts valid webhook signatures and stores the event', async () => {
    const payload = { type: 'wa_webhook', data: { test: true } };
    const body = JSON.stringify(payload);
    const secret = process.env.FACEBOOK_APP_SECRET || '';
    const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

    const response = await request(app)
      .post('/api/webhooks')
      .set('Content-Type', 'application/json')
      .set('x-hub-signature-256', signature)
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ok', true);
  });
});
