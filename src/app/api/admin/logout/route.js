import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { SESSION_COOKIE, destroySession, sameOrigin } from '@/server/auth.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Bad origin.' }, { status: 403 });
  }

  const store = await cookies();
  // Delete the row, not just the cookie — otherwise a copied token stays valid.
  await destroySession(store.get(SESSION_COOKIE)?.value);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
