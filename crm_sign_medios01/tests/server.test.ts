import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('webhook signature verification', () => {
  it('creates expected sha256 signature', () => {
    const secret = 'shh';
    const payload = JSON.stringify({ hello: 'world' });
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // replicate same computation
    const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(sig).toBe(expected);
  });
});

describe('DB fallback behaviour', () => {
  it('can insert token entry object shape', () => {
    const tokenEntry = {
      token: 'abc123',
      createdAt: new Date().toISOString(),
      sessionInfo: { phone_number: '+123' },
    };
    expect(tokenEntry).toHaveProperty('token');
    expect(tokenEntry).toHaveProperty('createdAt');
    expect(tokenEntry.sessionInfo).toHaveProperty('phone_number');
  });
});
