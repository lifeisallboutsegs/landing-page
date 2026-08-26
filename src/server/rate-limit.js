import { and, eq, gt, lt, sql as raw } from 'drizzle-orm';

import { db, schema } from './db/index.js';

/**
 * Fixed-window rate limit backed by Postgres.
 *
 * The lead form and audit tool are unauthenticated and will have ads pointed at
 * them, so the limit has to survive a process restart and be shared across
 * workers — which rules out an in-memory map. One row per bucket per window,
 * incremented atomically so two concurrent requests cannot both read "0".
 */
export async function rateLimit({ key, limit, windowSeconds }) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  // Opportunistic cleanup; cheap because of the bucket index.
  await db.delete(schema.rateLimits).where(lt(schema.rateLimits.expiresAt, now));

  const [existing] = await db
    .select()
    .from(schema.rateLimits)
    .where(and(eq(schema.rateLimits.bucket, key), gt(schema.rateLimits.expiresAt, now)))
    .limit(1);

  if (!existing) {
    await db.insert(schema.rateLimits).values({ bucket: key, hits: 1, expiresAt });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (existing.hits >= limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000));
    return { ok: false, remaining: 0, retryAfter };
  }

  await db
    .update(schema.rateLimits)
    .set({ hits: raw`${schema.rateLimits.hits} + 1` })
    .where(eq(schema.rateLimits.id, existing.id));

  return { ok: true, remaining: limit - existing.hits - 1, retryAfter: 0 };
}
