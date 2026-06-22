const crypto = require('crypto');
const fetch = require('cross-fetch');

async function exchangeCodeForToken({ appId, appSecret, redirectUri, code }) {
  const tokenUrl = `https://graph.facebook.com/v24.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&client_secret=${appSecret}&code=${code}`;
  const tokenResp = await fetch(tokenUrl);
  if (!tokenResp.ok) {
    const text = await tokenResp.text();
    throw new Error(`Token exchange failed: ${text}`);
  }
  const tokenJson = await tokenResp.json();
  return tokenJson.access_token;
}

async function getLongLivedToken({ appId, appSecret, shortLivedToken }) {
  const longUrl = `https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
  const longResp = await fetch(longUrl);
  if (!longResp.ok) {
    const text = await longResp.text();
    throw new Error(`Long-lived token exchange failed: ${text}`);
  }
  const longJson = await longResp.json();
  return longJson.access_token;
}

async function registerNumber({ wabaId, sessionInfo, accessToken }) {
  const url = `https://graph.facebook.com/v24.0/${wabaId}/phone_numbers`;
  const body = {
    phone_number: sessionInfo?.phone_number || sessionInfo?.phone || sessionInfo?.data?.phone_number,
    verified_name: sessionInfo?.companyName || sessionInfo?.app_id || 'Unnamed',
  };
  const resp = await fetch(`${url}?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`registerNumber failed: ${txt}`);
  }
  return resp.json();
}

async function subscribeWebhook({ wabaId, accessToken }) {
  const url = `https://graph.facebook.com/v24.0/${wabaId}/subscribed_apps`;
  const resp = await fetch(`${url}?access_token=${accessToken}`, { method: 'POST' });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`subscribeWebhook failed: ${txt}`);
  }
  return resp.json();
}

async function initDb(DATABASE_URL, pgClient) {
  const { Client } = pgClient;
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS tokens (
      phone text PRIMARY KEY,
      token jsonb,
      created_at timestamptz DEFAULT now()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS webhook_events (
      id serial PRIMARY KEY,
      received_at timestamptz DEFAULT now(),
      payload jsonb
    );
  `);
  return client;
}

async function saveTokenEntry({ phone, tokenEntry, useDb, dbClient }) {
  if (useDb && dbClient) {
    await dbClient.query(
      'INSERT INTO tokens(phone, token, created_at) VALUES($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET token = EXCLUDED.token, created_at = EXCLUDED.created_at',
      [phone, tokenEntry, new Date().toISOString()]
    );
  }
}

async function insertWebhookEvent({ entry, useDb, dbClient }) {
  if (useDb && dbClient) {
    await dbClient.query('INSERT INTO webhook_events(received_at, payload) VALUES($1, $2)', [new Date().toISOString(), entry.payload]);
    return;
  }
}

async function getWebhookEvents({ useDb, dbClient, limit = 200 }) {
  if (useDb && dbClient) {
    const result = await dbClient.query('SELECT received_at, payload FROM webhook_events ORDER BY received_at DESC LIMIT $1', [limit]);
    return result.rows.map((row) => ({ receivedAt: row.received_at, payload: row.payload }));
  }
  return [];
}

module.exports = {
  exchangeCodeForToken,
  getLongLivedToken,
  registerNumber,
  subscribeWebhook,
  initDb,
  saveTokenEntry,
  insertWebhookEvent,
  getWebhookEvents,
};
