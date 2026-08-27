import { NextResponse } from 'next/server';
import { sql } from '@/server/db/index.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Liveness probe for systemd/nginx and uptime monitoring. Checks the database
 * too: a process that is up but cannot reach Postgres cannot capture a lead,
 * which is the only thing this site exists to do.
 */
export async function GET() {
  try {
    await sql`select 1`;
    return NextResponse.json({ ok: true, db: 'up', at: new Date().toISOString() });
  } catch (error) {
    console.error('[health] database unreachable', error.message);
    return NextResponse.json({ ok: false, db: 'down' }, { status: 503 });
  }
}
