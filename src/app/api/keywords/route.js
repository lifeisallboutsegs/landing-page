import { NextResponse } from 'next/server';
import { z } from 'zod';

import { research } from '@/server/keywords/research.js';
import { clientIp, hashIp } from '@/server/leads.js';
import { rateLimit } from '@/server/rate-limit.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  seed: z.string().trim().min(2, 'Enter a topic to research').max(80),
  location: z.string().trim().max(60).optional().or(z.literal('')),
  depth: z.enum(['shallow', 'standard', 'deep']).optional(),
});

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Enter a topic to research.' },
      { status: 422 },
    );
  }

  const ipHash = hashIp(clientIp(request.headers));

  // Each call fans out to dozens of upstream requests, so this is throttled
  // harder than the lead form — and 'deep' harder still.
  const isDeep = parsed.data.depth === 'deep';
  const limit = await rateLimit({
    key: `keywords:${isDeep ? 'deep:' : ''}${ipHash ?? 'unknown'}`,
    limit: Number(isDeep ? (process.env.KEYWORDS_DEEP_LIMIT ?? 3) : (process.env.KEYWORDS_RATE_LIMIT ?? 15)),
    windowSeconds: Number(process.env.KEYWORDS_RATE_WINDOW ?? 3600),
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'That is a lot of research. Try again a little later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  try {
    const result = await research(parsed.data.seed, {
      location: parsed.data.location || '',
      depth: parsed.data.depth ?? 'standard',
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[keywords] research failed', error);
    return NextResponse.json({ error: 'Could not fetch suggestions right now.' }, { status: 502 });
  }
}
