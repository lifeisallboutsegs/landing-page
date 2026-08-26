import { loadEnvConfig } from '@next/env';

// drizzle-kit is a standalone CLI, so nothing has loaded .env.local for us the
// way `next dev` does. Reuse Next's own loader rather than a second dotenv
// setup, so the CLI and the app resolve DATABASE_URL with identical precedence
// (.env.local overriding .env, and so on).
loadEnvConfig(process.cwd());

/** @type {import('drizzle-kit').Config} */
export default {
  schema: './src/server/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
  verbose: true,
  strict: true,
};
