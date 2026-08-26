import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema.js';

/**
 * One shared connection pool.
 *
 * Next's dev server reloads modules on every edit, so the pool is parked on
 * globalThis — otherwise each save opens another set of connections and
 * Postgres starts refusing them a few minutes into a session.
 */
const globalForDb = globalThis;

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and point it at your Postgres instance.',
    );
  }

  return postgres(url, {
    // The VPS runs Postgres on the same host, so a small pool is plenty and
    // keeps us well clear of the default max_connections.
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idle_timeout: 20,
    connect_timeout: 10,
    // Managed Postgres usually terminates TLS; a local socket does not.
    ssl: process.env.DATABASE_SSL === 'true' ? 'require' : undefined,
  });
}

export const sql = globalForDb.__dwaSql ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForDb.__dwaSql = sql;

export const db = drizzle(sql, { schema });
export { schema };
