import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return global._pgPool;
}

export const pool = getPool();

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const { rows } = await pool.query(text, params);
  return rows as T[];
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
