import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Error no esperado en idle client', err);
});

export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Query ejecutada', { text, duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Error en query:', { text, error });
    throw error;
  }
}

export async function getClient(): Promise<any> {
  const client = await pool.connect();
  return client;
}

export default pool;
