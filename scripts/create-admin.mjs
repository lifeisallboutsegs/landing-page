/**
 * Creates or updates an admin user.
 *
 *   node scripts/create-admin.mjs you@example.com "Your Name"
 *
 * The password is read from stdin so it never lands in shell history or the
 * process list.
 */
import { createInterface } from 'node:readline/promises';
// @next/env is CommonJS, so it has no named ESM exports.
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());

const { db, schema } = await import('../src/server/db/index.js');
const { hashPassword } = await import('../src/server/auth.js');
const { eq } = await import('drizzle-orm');

const [email, name] = process.argv.slice(2);
if (!email) {
  console.error('Usage: node scripts/create-admin.mjs <email> [name]');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = (await rl.question('Password (min 12 chars): ')).trim();
rl.close();

if (password.length < 12) {
  console.error('Password must be at least 12 characters.');
  process.exit(1);
}

const passwordHash = await hashPassword(password);
const [existing] = await db
  .select()
  .from(schema.adminUsers)
  .where(eq(schema.adminUsers.email, email.toLowerCase()))
  .limit(1);

if (existing) {
  await db
    .update(schema.adminUsers)
    .set({ passwordHash, name: name ?? existing.name })
    .where(eq(schema.adminUsers.id, existing.id));
  console.log(`Updated password for ${email}`);
} else {
  await db
    .insert(schema.adminUsers)
    .values({ email: email.toLowerCase(), name: name ?? null, passwordHash });
  console.log(`Created admin ${email}`);
}

process.exit(0);
