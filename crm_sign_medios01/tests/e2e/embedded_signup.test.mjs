import { test } from 'vitest';
import { execSync } from 'child_process';

const hasCreds = !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && (process.env.EMBEDDED_SIGNUP_CODE || process.env.SHORT_LIVED_TOKEN));

if (!hasCreds) {
  test.skip('embedded signup e2e (skipped, missing FACEBOOK_APP_ID/SECRET and code/token)', () => {});
} else {
  test('run embedded signup e2e script', () => {
    execSync('node server/e2e/embedded_signup_e2e.cjs', { stdio: 'inherit', env: process.env });
  });
}
