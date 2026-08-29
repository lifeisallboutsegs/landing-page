import { asc, eq } from 'drizzle-orm';

import { db, schema } from './db/index.js';
// Relative, not `@/` — this module is also loaded by CLI scripts that have no
// path-alias resolver.
import { TEAM_GROUPS } from '../lib/about-content.js';
import { cmsDefault } from '../lib/cms-defaults.js';

/**
 * Reads an editable content blob and merges it onto the code-defined default,
 * so a partially filled row still renders every field. Any failure — no
 * DATABASE_URL, the table not migrated yet, the database down — returns the
 * default untouched. The site is never blocked on the CMS being reachable.
 */
export async function getContent(key, fallback = {}) {
  try {
    const [row] = await db
      .select()
      .from(schema.siteContent)
      .where(eq(schema.siteContent.key, key))
      .limit(1);

    if (!row || !row.value || typeof row.value !== 'object' || Array.isArray(row.value)) {
      return fallback;
    }
    // Shallow merge: a saved field wins, an unsaved one keeps the default.
    return { ...fallback, ...row.value };
  } catch {
    return fallback;
  }
}

/**
 * Content for one CMS group (`page:home`, `service:seo`, …), merged over its
 * code default from `cms-defaults.js`. This is the call public pages make.
 */
export async function getPageContent(id) {
  return getContent(id, cmsDefault(id));
}

const GROUP_KEYS = TEAM_GROUPS.map((g) => g.key);

/**
 * Published team members, bucketed by group and ordered. Returns `fallback`
 * (the code roster) when the table is empty or unreachable.
 */
export async function getTeam(fallback) {
  try {
    const rows = await db
      .select()
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.published, true))
      .orderBy(asc(schema.teamMembers.sortOrder), asc(schema.teamMembers.id));

    if (!rows.length) return fallback;

    const grouped = Object.fromEntries(GROUP_KEYS.map((k) => [k, []]));
    for (const row of rows) {
      const bucket = grouped[row.groupName] ?? grouped.core;
      bucket.push({ name: row.name, role: row.role, photoUrl: row.photoUrl, bio: row.bio });
    }
    return grouped;
  } catch {
    return fallback;
  }
}

/** Every member including unpublished — for the admin list only. */
export async function getAllTeam() {
  try {
    return await db
      .select()
      .from(schema.teamMembers)
      .orderBy(asc(schema.teamMembers.groupName), asc(schema.teamMembers.sortOrder), asc(schema.teamMembers.id));
  } catch {
    return [];
  }
}
