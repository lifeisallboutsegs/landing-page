import { and, desc, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { crawl } from '@/server/audit/crawl.js';
import { UnsafeUrlError } from '@/server/audit/safe-fetch.js';
import { db, schema } from '@/server/db/index.js';
import { clientIp, hashIp } from '@/server/leads.js';
import { rateLimit } from '@/server/rate-limit.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CACHE_MINUTES = 30;

const bodySchema = z.object({
  url: z.string().trim().min(3).max(500),
  email: z.string().trim().toLowerCase().email().max(320).optional().or(z.literal('')),
});

/** Adds a scheme when the visitor typed a bare domain, and drops the fragment. */
function normalise(input) {
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const url = new URL(withScheme);
  url.hash = '';
  return url.toString();
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter the address of a page to audit.' }, { status: 422 });
  }

  let normalisedUrl;
  try {
    normalisedUrl = normalise(parsed.data.url);
  } catch {
    return NextResponse.json({ error: 'That does not look like a valid URL.' }, { status: 422 });
  }

  const ipHash = hashIp(clientIp(request.headers));

  // This endpoint makes our server fetch an arbitrary page, so it is expensive
  // and abusable. Throttle harder than the lead form.
  const limit = await rateLimit({
    key: `audit:${ipHash ?? 'unknown'}`,
    limit: Number(process.env.AUDIT_RATE_LIMIT ?? 10),
    windowSeconds: Number(process.env.AUDIT_RATE_WINDOW ?? 3600),
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'That is a lot of audits. Try again a little later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  // Serve a recent result rather than re-crawling — kinder to the target site
  // and keeps the PSI quota for pages we have not seen.
  const since = new Date(Date.now() - CACHE_MINUTES * 60 * 1000);
  const [cached] = await db
    .select()
    .from(schema.audits)
    .where(
      and(
        eq(schema.audits.normalisedUrl, normalisedUrl),
        eq(schema.audits.status, 'complete'),
        gt(schema.audits.createdAt, since),
      ),
    )
    .orderBy(desc(schema.audits.createdAt))
    .limit(1);

  if (cached) {
    return NextResponse.json({ ok: true, cached: true, score: cached.score, result: cached.result });
  }

  try {
    const result = await crawl(normalisedUrl);

    await db.insert(schema.audits).values({
      url: parsed.data.url,
      normalisedUrl,
      email: parsed.data.email || null,
      status: 'complete',
      score: result.score,
      result,
      ipHash,
      completedAt: new Date(),
    });

    return NextResponse.json({ ok: true, cached: false, score: result.score, result });
  } catch (error) {
    const message =
      error instanceof UnsafeUrlError ? error.message : 'That page could not be audited.';

    await db.insert(schema.audits).values({
      url: parsed.data.url,
      normalisedUrl,
      email: parsed.data.email || null,
      status: 'failed',
      error: message,
      ipHash,
      completedAt: new Date(),
    });

    if (!(error instanceof UnsafeUrlError)) console.error('[audit] crawl failed', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
