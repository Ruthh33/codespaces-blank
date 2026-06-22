import nock from 'nock';
import { test, expect } from 'vitest';
import { registerNumber, subscribeWebhook } from '../../server/beUtils.cjs';

test('registerNumber calls Graph API and returns JSON', async () => {
  const wabaId = '123456';
  const scope = nock('https://graph.facebook.com')
    .post(`/v24.0/${wabaId}/phone_numbers`)
    .query(true)
    .reply(200, { success: true });

  const res = await registerNumber({ wabaId, sessionInfo: { phone_number: '+123' }, accessToken: 'token' });
  expect(res).toEqual({ success: true });
  scope.done();
});

test('subscribeWebhook calls Graph API and returns JSON', async () => {
  const wabaId = '777888';
  const scope = nock('https://graph.facebook.com')
    .post(`/v24.0/${wabaId}/subscribed_apps`)
    .query(true)
    .reply(200, { subscribed: true });

  const res = await subscribeWebhook({ wabaId, accessToken: 'token' });
  expect(res).toEqual({ subscribed: true });
  scope.done();
});
