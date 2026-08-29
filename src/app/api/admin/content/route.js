import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { sameOrigin } from '@/server/auth.js';
import { currentUser } from '@/server/current-user.js';
import { db, schema } from '@/server/db/index.js';
import { getGroup } from '@/lib/cms-schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Re-render the pages a content key drives. `site:global` feeds metadata and
// the footer everywhere, so it sweeps the whole tree; everything else just
// refreshes its own preview page.
function revalidateFor(key) {
  if (key === 'site:global') {
    revalidatePath('/', 'layout');
    return;
  }
  const preview = key === 'page:home' ? '/' : getGroup(key)?.preview;
  if (preview) revalidatePath(preview);
}

const bodySchema = z.object({
  key: z.string().trim().min(1).max(120),
  value: z.record(z.string(), z.any()),
});

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Bad origin.' }, { status: 403 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid content payload.' }, { status: 400 });
  }

  const { key, value } = parsed.data;

  try {
    await db
      .insert(schema.siteContent)
      .values({ key, value, updatedBy: user.email, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: schema.siteContent.key,
        set: { value, updatedBy: user.email, updatedAt: new Date() },
      });
  } catch (error) {
    return NextResponse.json(
      { error: `Could not save. ${error.message ?? ''}`.trim() },
      { status: 500 },
    );
  }

  revalidateFor(key);

  return NextResponse.json({ ok: true });
}
