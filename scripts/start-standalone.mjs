/**
 * Runs the production standalone build locally.
 *
 * `output: 'standalone'` resolves .env files relative to the bundle directory
 * (.next/standalone), not the project root, so .env.local is never picked up
 * and every database call fails with "DATABASE_URL is not set". Production
 * solves this by injecting the environment (systemd EnvironmentFile); this
 * script does the same thing for local runs, reading the project's env files
 * and handing them to the server process.
 *
 *   npm run start:prod            # 127.0.0.1:3000
 *   HOST=0.0.0.0 PORT=3012 npm run start:prod
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import nextEnv from '@next/env';

const root = process.cwd();
nextEnv.loadEnvConfig(root);

const server = path.join(root, '.next', 'standalone', 'server.js');
if (!existsSync(server)) {
  console.error('No standalone build found. Run `npm run build:standalone` first.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing from .env.local — the app cannot start.');
  process.exit(1);
}

const host = process.env.HOST ?? '127.0.0.1';
const port = process.env.PORT ?? '3000';

if (host === '0.0.0.0') {
  console.warn(
    '\n  Binding to 0.0.0.0 — this will be reachable from the internet.\n' +
      '  There is no TLS here, so admin credentials would cross the network in the clear.\n',
  );
}

console.log(`  starting standalone build on http://${host}:${port}`);

spawn(process.execPath, [server], {
  stdio: 'inherit',
  env: { ...process.env, HOSTNAME: host, PORT: port, NODE_ENV: 'production' },
}).on('exit', (code) => process.exit(code ?? 0));
