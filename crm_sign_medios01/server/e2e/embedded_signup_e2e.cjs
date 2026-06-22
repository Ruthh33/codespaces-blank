const { exchangeCodeForToken, getLongLivedToken, registerNumber, subscribeWebhook, initDb, saveTokenEntry } = require('../beUtils.cjs');
const { Client } = require('pg');

async function run() {
  const APP_ID = process.env.FACEBOOK_APP_ID;
  const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
  const REDIRECT_URI = process.env.EMBEDDED_REDIRECT_URI || 'https://localhost/';
  const CODE = process.env.EMBEDDED_SIGNUP_CODE; // optional
  const SHORT_TOKEN = process.env.SHORT_LIVED_TOKEN; // optional
  const DATABASE_URL = process.env.DATABASE_URL || null;

  if (!APP_ID || !APP_SECRET) {
    console.error('Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to run this e2e script');
    process.exit(2);
  }

  let shortToken = SHORT_TOKEN;
  if (!shortToken) {
    if (!CODE) {
      console.error('Provide EMBEDDED_SIGNUP_CODE or SHORT_LIVED_TOKEN to continue');
      process.exit(2);
    }
    console.log('Exchanging code for short-lived token...');
    shortToken = await exchangeCodeForToken({ appId: APP_ID, appSecret: APP_SECRET, redirectUri: REDIRECT_URI, code: CODE });
    console.log('Got short-lived token');
  }

  console.log('Exchanging for long-lived token...');
  const longToken = await getLongLivedToken({ appId: APP_ID, appSecret: APP_SECRET, shortLivedToken: shortToken });
  console.log('Long-lived token received');

  const sessionInfo = JSON.parse(process.env.TEST_SESSION_INFO || '{}');
  const phone = sessionInfo?.phone_number || sessionInfo?.phone || 'unknown';

  if (DATABASE_URL) {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    await initDb(DATABASE_URL, require('pg'));
    await saveTokenEntry({ phone, tokenEntry: { token: longToken, createdAt: new Date().toISOString(), sessionInfo }, useDb: true, dbClient: client });
    await client.end();
    console.log('Saved token entry to DB');
  } else {
    console.log('No DATABASE_URL provided — skipping DB persistence');
  }

  const wabaId = sessionInfo?.wabaId || sessionInfo?.waba_id;
  if (wabaId) {
    console.log('Attempting registerNumber and subscribeWebhook (best-effort)...');
    try {
      const reg = await registerNumber({ wabaId, sessionInfo, accessToken: longToken });
      console.log('registerNumber result:', reg);
    } catch (e) {
      console.warn('registerNumber failed:', e && e.message);
    }
    try {
      const sub = await subscribeWebhook({ wabaId, accessToken: longToken });
      console.log('subscribeWebhook result:', sub);
    } catch (e) {
      console.warn('subscribeWebhook failed:', e && e.message);
      console.warn('Note: Graph API may require a public webhook URL for subscription to succeed');
    }
  } else {
    console.log('No WABA ID in session info; skipping register/subscribe');
  }

  console.log('Done');
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { run };
