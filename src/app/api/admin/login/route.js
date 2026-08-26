import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  SESSION_COOKIE,
  burnTimingBudget,
  createSession,
  isLocked,
  recordFailedAttempt,
  recordSuccessfulLogin,
  sameOrigin,
  sessionCookieOptions,
  verifyPassword,
} from '@/server/auth.js';
import { db, schema } from '@/server/db/index.js';
import { clientIp, hashIp } from '@/server/leads.js';
import { rateLimit } from '@/server/rate-limit.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schemaLogin = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(500),
});

// One message for every failure mode. Saying "no such user" or "wrong password"
// hands an attacker a list of valid accounts.
const GENERIC = 'Email or password is incorrect.';

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Bad origin.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schemaLogin.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const ipHash = hashIp(clientIp(request.headers));

  // Throttle by address first, so a single host cannot grind through passwords
  // for many accounts.
  const ipLimit = await rateLimit({
    key: `login:ip:${ipHash ?? 'unknown'}`,
    limit: Number(process.env.LOGIN_RATE_LIMIT ?? 10),
    windowSeconds: Number(process.env.LOGIN_RATE_WINDOW ?? 900),
  });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } },
    );
  }

  const [user] = await db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  if (!user) {
    // Spend the same time we would have spent hashing, then fail identically.
    await burnTimingBudget(password);
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  if (isLocked(user)) {
    return NextResponse.json(
      { error: 'This account is temporarily locked after too many failed attempts.' },
      { status: 423 },
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const { locked, lockoutMinutes } = await recordFailedAttempt(user);
    return NextResponse.json(
      {
        error: locked
          ? `Too many failed attempts. This account is locked for ${lockoutMinutes} minutes.`
          : GENERIC,
      },
      { status: locked ? 423 : 401 },
    );
  }

  await recordSuccessfulLogin(user);
  const { token } = await createSession(user, {
    ipHash,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
