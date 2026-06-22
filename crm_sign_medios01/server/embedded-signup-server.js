/* Simple Express server to handle Embedded Signup token exchange and webhooks.
   Intended for local development only. Requires env vars:
     FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, EMBEDDED_REDIRECT_URI
*/
const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const {
  exchangeCodeForToken,
  getLongLivedToken,
  registerNumber,
  subscribeWebhook,
  initDb,
  saveTokenEntry,
  insertWebhookEvent,
  getWebhookEvents,
} = require('./beUtils.cjs');

const APP_ID = process.env.FACEBOOK_APP_ID || '';
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const REDIRECT_URI = process.env.EMBEDDED_REDIRECT_URI || 'https://localhost/';

const app = express();
app.use(express.json());

// Apply a modest rate limit to webhook endpoint and token endpoint
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
});
app.use('/api/', apiLimiter);

// DB: if DATABASE_URL is set, use postgres; otherwise fallback to in-memory stores
const DATABASE_URL = process.env.DATABASE_URL || null;
let dbClient = null;
let useDb = false;
const tokensByPhone = {}; // fallback
const webhookEvents = [];

if (DATABASE_URL) {
  const pgClient = require('pg');
  initDb(DATABASE_URL, pgClient)
    .then((client) => {
      dbClient = client;
      useDb = true;
      logger.info('Connected to DATABASE_URL and ensured tables exist');
    })
    .catch((e) => {
      logger.error({ err: e }, 'Failed to connect to DB');
      dbClient = null;
      useDb = false;
    });
}

app.post('/api/token', async (req, res) => {
  try {
    const { code, sessionInfo } = req.body;
    if (!code) return res.status(400).json({ error: 'missing code' });

    const shortLived = await exchangeCodeForToken({
      appId: APP_ID,
      appSecret: APP_SECRET,
      redirectUri: REDIRECT_URI,
      code,
    });
    const longLived = await getLongLivedToken({
      appId: APP_ID,
      appSecret: APP_SECRET,
      shortLivedToken: shortLived,
    });

    const phone = sessionInfo?.phone_number || 'unknown';
    const tokenEntry = {
      token: longLived,
      createdAt: new Date().toISOString(),
      sessionInfo,
    };

    if (useDb && dbClient) {
      try {
        await saveTokenEntry({ phone, tokenEntry, useDb, dbClient });
      } catch (e) {
        logger.warn({ err: e }, 'DB insert token failed');
        tokensByPhone[phone] = tokenEntry; // fallback
      }
    } else {
      tokensByPhone[phone] = tokenEntry;
    }

    // Try to register the number and subscribe webhooks if we have WABA id
    try {
      const wabaId = sessionInfo?.wabaId || sessionInfo?.waba_id || sessionInfo?.data?.waba_id;
      if (wabaId) {
        // Attempt to register number (best-effort)
        await registerNumber({ wabaId, sessionInfo, accessToken: longLived }).catch((e) => {
          logger.warn({ err: e }, 'registerNumber failed');
          tokensByPhone[phone].registerError = String(e);
        });

        // Attempt to subscribe webhooks
        await subscribeWebhook({ wabaId, accessToken: longLived }).catch((e) => {
          logger.warn({ err: e }, 'subscribeWebhook failed');
          tokensByPhone[phone].subscribeError = String(e);
        });
      }
    } catch (e) {
      console.warn('post-token registration steps failed', e && e.message ? e.message : e);
    }

    res.json({ ok: true, phone, token: tokensByPhone[phone] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});


// Explicit routes to trigger register/subscribe manually
app.post('/api/register', express.json(), async (req, res) => {
  const { wabaId, sessionInfo, token } = req.body;
  if (!wabaId || !token) return res.status(400).json({ error: 'missing wabaId or token' });
  try {
    const r = await registerNumber({ wabaId, sessionInfo, accessToken: token });
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/subscribe', express.json(), async (req, res) => {
  const { wabaId, token } = req.body;
  if (!wabaId || !token) return res.status(400).json({ error: 'missing wabaId or token' });
  try {
    const r = await subscribeWebhook({ wabaId, accessToken: token });
    res.json({ ok: true, result: r });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Raw handler for webhooks so we can verify HMAC using the raw body
app.post('/api/webhooks', express.raw({ type: '*/*' }), async (req, res) => {
  const signature = req.get('x-hub-signature-256') || '';
  let rawBody = req.body;
  if (!Buffer.isBuffer(rawBody)) {
    if (typeof rawBody === 'string') {
      rawBody = Buffer.from(rawBody, 'utf8');
    } else if (rawBody && typeof rawBody === 'object') {
      rawBody = Buffer.from(JSON.stringify(rawBody), 'utf8');
    } else {
      rawBody = Buffer.from('', 'utf8');
    }
  }

  const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      logger.warn({ signature, expected }, 'Invalid webhook signature');
      return res.status(401).send('invalid signature');
    }
  } catch (e) {
    logger.warn({ err: e }, 'Signature verification failed');
    return res.status(401).send('invalid signature');
  }
  const json = JSON.parse(rawBody.toString('utf8'));
  if (!json || typeof json !== 'object') {
    logger.warn({ payload: rawBody.toString('utf8') }, 'Invalid webhook payload');
    return res.status(400).send('invalid payload');
  }
  logger.info({ event: 'webhook.received', size: rawBody.length });
  const entry = { receivedAt: new Date().toISOString(), payload: json };
  if (useDb && dbClient) {
    try {
      await insertWebhookEvent({ entry, useDb, dbClient });
      res.json({ ok: true });
      return;
    } catch (e) {
      console.warn('DB insert webhook event failed', e.message || e);
      webhookEvents.push(entry);
      res.json({ ok: true, dbError: String(e) });
      return;
    }
  }

  webhookEvents.push(entry);
  res.json({ ok: true });
});

app.get('/api/webhooks/events', async (req, res) => {
  if (useDb && dbClient) {
    try {
      const events = await getWebhookEvents({ useDb, dbClient });
      res.json({ events });
      return;
    } catch (e) {
      res.status(500).json({ error: String(e) });
      return;
    }
  }

  res.json({ events: webhookEvents });
});

app.get('/api/tokens', (req, res) => {
  res.json({ tokens: tokensByPhone });
});

if (require.main === module) {
  const port = process.env.PORT || 4001;
  app.listen(port, () => console.log(`Embedded signup server listening on ${port}`));
}

module.exports = app;
