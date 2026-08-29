import { notFound } from 'next/navigation';

import ContentEditor from '@/components/admin/ContentEditor';
import { getGroup, groupToSlug, slugToGroup, CMS_GROUPS } from '@/lib/cms-schema';
import { cmsDefault } from '@/lib/cms-defaults';
import { getContent } from '@/server/content.js';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export function generateStaticParams() {
  return CMS_GROUPS.map((g) => ({ group: groupToSlug(g.id) }));
}

export default async function AdminContentGroupPage({ params }) {
  const { group: slug } = await params;
  const id = slugToGroup(slug);
  const group = getGroup(id);
  if (!group) notFound();

  const defaults = cmsDefault(id);
  const initial = await getContent(id, {});

  return (
    <ContentEditor
      groupId={id}
      groupLabel={group.label}
      preview={group.preview}
      note={group.note}
      schemaFields={group.fields}
      initial={initial}
      defaults={defaults}
    />
  );
}
