import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { sameOrigin } from '@/server/auth.js';
import { currentUser } from '@/server/current-user.js';
import { db, schema } from '@/server/db/index.js';
import { teamDefaults } from '@/lib/about-content.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const memberSchema = z.object({
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  groupName: z.enum(['leadership', 'advisory', 'core']),
  photoUrl: z.string().trim().max(500).optional().or(z.literal('')),
  bio: z.string().trim().max(2000).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.coerce.boolean().default(true),
});

async function guard(request) {
  if (!sameOrigin(request)) return { error: 'Bad origin.', status: 403 };
  const user = await currentUser();
  if (!user) return { error: 'Not signed in.', status: 401 };
  return { user };
}

const done = () => {
  revalidatePath('/about');
  return NextResponse.json({ ok: true });
};

export async function POST(request) {
  const g = await guard(request);
  if (g.error) return NextResponse.json({ error: g.error }, { status: g.status });

  const body = await request.json().catch(() => null);

  // Seed: promote the built-in roster into editable rows (only when empty).
  if (body?.seed) {
    const [any] = await db.select({ id: schema.teamMembers.id }).from(schema.teamMembers).limit(1);
    if (any) return NextResponse.json({ error: 'Team list is not empty.' }, { status: 409 });
    const rows = [];
    for (const [groupName, people] of Object.entries(teamDefaults)) {
      people.forEach((p, i) =>
        rows.push({ name: p.name, role: p.role, groupName, sortOrder: i, published: true }),
      );
    }
    await db.insert(schema.teamMembers).values(rows);
    return done();
  }

  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid member.' }, { status: 400 });

  const v = parsed.data;
  await db.insert(schema.teamMembers).values({ ...v, photoUrl: v.photoUrl || null, bio: v.bio || null });
  return done();
}

export async function PATCH(request) {
  const g = await guard(request);
  if (g.error) return NextResponse.json({ error: g.error }, { status: g.status });

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });

  const parsed = memberSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid member.' }, { status: 400 });

  const { id: _drop, ...fields } = parsed.data;
  if ('photoUrl' in fields) fields.photoUrl = fields.photoUrl || null;
  if ('bio' in fields) fields.bio = fields.bio || null;

  await db
    .update(schema.teamMembers)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(schema.teamMembers.id, id));
  return done();
}

export async function DELETE(request) {
  const g = await guard(request);
  if (g.error) return NextResponse.json({ error: g.error }, { status: g.status });

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });

  await db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id));
  return done();
}
