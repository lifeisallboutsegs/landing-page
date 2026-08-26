import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { and, eq, gt, lt } from 'drizzle-orm';

import { db, schema } from './db/index.js';

const scrypt = promisify(scryptCb);

export const SESSION_COOKIE = 'dwa_admin';
const SESSION_HOURS = 12;

// OWASP-recommended scrypt floor (N=2^15, r=8, p=1). Node's default N is 2^14;
// raising it costs ~100ms per login and multiplies an attacker's cost by the
// same factor. maxmem must be lifted to match or Node refuses the parameters.
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 96 * 1024 * 1024 };
const KEY_LEN = 64;

const MAX_FAILED_ATTEMPTS = 8;
const LOCKOUT_MINUTES = 15;

/**
 * scrypt from Node's standard library rather than a bcrypt package: memory-hard,
 * no native build step, and one fewer security-critical dependency to trust.
 */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LEN, SCRYPT);
  return `scrypt$${SCRYPT.N}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  try {
    const parts = String(stored).split('$');
    if (parts[0] !== 'scrypt') return false;
    const [, nRaw, saltHex, hashHex] = parts;

    const derived = await scrypt(password, Buffer.from(saltHex, 'hex'), KEY_LEN, {
      ...SCRYPT,
      N: Number(nRaw) || SCRYPT.N,
    });
    const expected = Buffer.from(hashHex, 'hex');
    if (derived.length !== expected.length) return false;
    // Constant-time: a byte-by-byte compare leaks the hash one byte at a time.
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Burned when no such user exists, so a login against an unknown address costs
 * the same wall-clock time as one against a real account. Without this, response
 * timing enumerates which emails are registered.
 */
const DUMMY_HASH = await hashPassword(randomBytes(32).toString('hex'));
export async function burnTimingBudget(password) {
  await verifyPassword(password, DUMMY_HASH);
}

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

/**
 * Issues a fresh session. The raw token is returned once, for the cookie, and
 * only its hash is persisted — a database leak yields no usable cookies.
 * A new token per login also defeats session fixation.
 */
export async function createSession(user, { ipHash, userAgent } = {}) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);

  await db.insert(schema.adminSessions).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt,
    ipHash: ipHash ?? null,
    userAgent: userAgent?.slice(0, 500) ?? null,
  });

  return { token, expiresAt };
}

/** Resolves a cookie value to its user, or null. Expired rows are swept as seen. */
export async function readSession(token) {
  if (!token) return null;

  const now = new Date();
  await db.delete(schema.adminSessions).where(lt(schema.adminSessions.expiresAt, now));

  const [row] = await db
    .select({
      sessionId: schema.adminSessions.id,
      id: schema.adminUsers.id,
      email: schema.adminUsers.email,
      name: schema.adminUsers.name,
      role: schema.adminUsers.role,
    })
    .from(schema.adminSessions)
    .innerJoin(schema.adminUsers, eq(schema.adminSessions.userId, schema.adminUsers.id))
    .where(
      and(
        eq(schema.adminSessions.tokenHash, hashToken(token)),
        gt(schema.adminSessions.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  await db
    .update(schema.adminSessions)
    .set({ lastSeenAt: now })
    .where(eq(schema.adminSessions.id, row.sessionId));

  return row;
}

export async function destroySession(token) {
  if (!token) return;
  await db.delete(schema.adminSessions).where(eq(schema.adminSessions.tokenHash, hashToken(token)));
}

/** Revokes every session for a user — use after a password change. */
export async function destroyAllSessions(userId) {
  await db.delete(schema.adminSessions).where(eq(schema.adminSessions.userId, userId));
}

export function isLocked(user) {
  return Boolean(user.lockedUntil && user.lockedUntil > new Date());
}

export async function recordFailedAttempt(user) {
  const failed = (user.failedAttempts ?? 0) + 1;
  const lockedUntil =
    failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null;

  await db
    .update(schema.adminUsers)
    .set({ failedAttempts: lockedUntil ? 0 : failed, lockedUntil })
    .where(eq(schema.adminUsers.id, user.id));

  return { locked: Boolean(lockedUntil), lockoutMinutes: LOCKOUT_MINUTES };
}

export async function recordSuccessfulLogin(user) {
  await db
    .update(schema.adminUsers)
    .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() })
    .where(eq(schema.adminUsers.id, user.id));
}

export const sessionCookieOptions = {
  httpOnly: true, // not readable by JS, so XSS cannot exfiltrate the session
  sameSite: 'lax', // blocks cross-site POSTs, i.e. CSRF on admin actions
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_HOURS * 60 * 60,
};

/**
 * Defence in depth behind SameSite: state-changing admin requests must come
 * from our own origin. Covers browsers where SameSite is not enforced.
 */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin form posts may omit it
  const host = request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
