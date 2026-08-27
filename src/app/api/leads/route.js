import { NextResponse } from 'next/server';

import { db, schema } from '@/server/db/index.js';
import { clientIp, hashIp, leadSchema, splitAttribution } from '@/server/leads.js';
import { sendLeadAcknowledgement, sendLeadNotification } from '@/server/mail.js';
import { rateLimit } from '@/server/rate-limit.js';

// Touches the database on every call, so it must never be statically evaluated.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    // Surface per-field messages so the form can point at the offending input
    // rather than showing a generic failure.
    const fieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: 'Please check the form.', fieldErrors }, { status: 422 });
  }

  const data = parsed.data;

  // Honeypot. Answer 200 so a bot cannot tell it was caught and retry with the
  // field cleared — but write nothing.
  if (data.company_website_confirm) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const ip = clientIp(request.headers);
  const ipHash = hashIp(ip);

  try {
    const limit = await rateLimit({
      key: `leads:${ipHash ?? 'unknown'}`,
      limit: Number(process.env.LEADS_RATE_LIMIT ?? 5),
      windowSeconds: Number(process.env.LEADS_RATE_WINDOW ?? 3600),
    });

    if (!limit.ok) {
      return NextResponse.json(
        { error: 'That is a lot of enquiries from one place. Please email us instead.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
      );
    }

    const attribution = splitAttribution(data.meta);

    const [row] = await db
      .insert(schema.leads)
      .values({
        name: data.name,
        email: data.email,
        website: data.website || null,
        service: data.service || null,
        message: data.message || null,
        ...attribution,
        ipHash,
        userAgent: request.headers.get('user-agent')?.slice(0, 500) ?? null,
      })
      .returning({ id: schema.leads.id, createdAt: schema.leads.createdAt });

    // The enquiry is already committed, so mail is deliberately not awaited and
    // its failures cannot reach the visitor. A notification that does not arrive
    // is an inconvenience; a form that errors because the mail host is down
    // would cost a customer. Failures are logged inside the mailer.
    const forMail = { ...data, ...attribution };
    void Promise.allSettled([
      sendLeadNotification(forMail),
      sendLeadAcknowledgement(forMail),
    ]);

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (error) {
    // Never leak a driver error to the browser, but make it findable in logs —
    // a silently swallowed enquiry is the exact failure this build is fixing.
    console.error('[leads] failed to store enquiry', error);
    return NextResponse.json(
      { error: "That didn't send. Please email admin@developwitharim.com and we'll pick it up." },
      { status: 500 },
    );
  }
}
