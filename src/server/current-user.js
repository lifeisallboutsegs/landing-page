import { cookies } from 'next/headers';

import { SESSION_COOKIE, readSession } from './auth.js';

/**
 * Resolves the signed-in admin for server components and route handlers.
 *
 * Auth is enforced here rather than in middleware on purpose: sessions are rows
 * in Postgres, and middleware runs on the edge runtime where the database
 * driver is unavailable. Checking in the admin layout means every page under it
 * is gated by a real database lookup rather than by trusting a token's contents.
 */
export async function currentUser() {
  const store = await cookies();
  return readSession(store.get(SESSION_COOKIE)?.value);
}
