import { test, expect } from 'vitest';
import { Client } from 'pg';
import { execSync } from 'child_process';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  test.skip('apply migrations and tables exist (skipped, DATABASE_URL not set)', () => {});
} else {
  test('apply migrations and tables exist', async () => {
    // Run migration script
    execSync('node server/migrate.cjs', { stdio: 'inherit', env: process.env });

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const res1 = await client.query(`SELECT to_regclass('public.tokens') as t`);
    const res2 = await client.query(`SELECT to_regclass('public.webhook_events') as w`);

    await client.end();

    expect(res1.rows[0].t).toBe('tokens');
    expect(res2.rows[0].w).toBe('webhook_events');
  });
}
