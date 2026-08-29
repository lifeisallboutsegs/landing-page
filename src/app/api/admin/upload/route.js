import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { sameOrigin } from '@/server/auth.js';
import { currentUser } from '@/server/current-user.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BYTES = 4 * 1024 * 1024;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

// Written to /public so `next start` serves it directly. This folder is runtime
// data — keep it out of git and make sure a deploy does not wipe it.
const DIR = path.join(process.cwd(), 'public', 'uploads', 'team');

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Bad origin.' }, { status: 403 });
  }
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image is over 4 MB.' }, { status: 413 });
  }
  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Use a JPG, PNG, WebP or AVIF image.' }, { status: 415 });
  }

  const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, name), Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    return NextResponse.json(
      { error: `Could not store the image. ${error.message ?? ''}`.trim() },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: `/uploads/team/${name}` });
}
