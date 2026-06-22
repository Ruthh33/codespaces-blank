import { test, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import crypto from 'crypto';

let request;

beforeAll(async () => {
  // Ensure server uses the same secret as tests
  process.env.FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || 'test-secret';
  const { default: app } = await import('../../server/embedded-signup-server.js');
  request = supertest(app);
});

test('webhook accepts valid HMAC', async () => {
  const payload = JSON.stringify({ hello: 'world' });
  const secret = process.env.FACEBOOK_APP_SECRET;
  const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(Buffer.from(payload, 'utf8')).digest('hex');

  const res = await request.post('/api/webhooks')
    .set('x-hub-signature-256', sig)
    .set('Content-Type', 'application/json')
    .send(payload);

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('ok', true);
});

test('webhook rejects invalid HMAC', async () => {
  const payload = JSON.stringify({ hello: 'world' });
  const sig = 'sha256=deadbeef';

  const res = await request.post('/api/webhooks')
    .set('x-hub-signature-256', sig)
    .set('Content-Type', 'application/json')
    .send(payload);

  expect(res.status).toBe(401);
});
