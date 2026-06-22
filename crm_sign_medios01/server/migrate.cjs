const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('Please set DATABASE_URL in environment');
    process.exit(2);
  }

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id serial PRIMARY KEY,
      name text UNIQUE,
      applied_at timestamptz DEFAULT now()
    );
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const name = file;
    const res = await client.query('SELECT 1 FROM migrations WHERE name=$1', [name]);
    if (res.rowCount > 0) {
      console.log('Skipping', name);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log('Applying', name);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations(name) VALUES($1)', [name]);
      await client.query('COMMIT');
      console.log('Applied', name);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Failed to apply', name, e && e.message);
      process.exit(3);
    }
  }

  await client.end();
  console.log('Migrations complete');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
